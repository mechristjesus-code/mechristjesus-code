import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const LLM_KEY  = process.env.HAPPYSEEDS_KEY!;
const LLM_BASE = process.env.BTY_LLM_SERVER_BASE_URL
  ?? (process.env.REACTUS_BASE_URL + "/v1");

/**
 * Fetches transcript + auto-generates a repurposed script from a YouTube video.
 * Uses youtube-transcript npm-style fetch (no API key needed for public videos).
 */
export async function POST(req: NextRequest) {
  try {
    const { videoId, repurposeAs } = await req.json();
    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    // Fetch transcript via timedtext API (public videos only)
    const infoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageRes = await fetch(infoUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await pageRes.text();

    // Extract captions URL from page HTML
    const captionMatch = html.match(/"captionTracks":\s*\[.*?"baseUrl":"(.*?)"/);
    let transcript = "";

    if (captionMatch) {
      const captionUrl = captionMatch[1].replace(/\\u0026/g, "&");
      const capRes = await fetch(captionUrl);
      const capXml = await capRes.text();
      // Parse XML text tags
      transcript = capXml
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        .replace(/\s+/g, " ").trim()
        .slice(0, 6000);
    }

    if (!transcript) {
      transcript = "[Transcript not available for this video — auto-captions may be disabled]";
    }

    // Extract video title from page
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const videoTitle = titleMatch ? titleMatch[1].replace(" - YouTube", "").trim() : videoId;

    // AI repurpose the transcript
    const repurposeType = repurposeAs ?? "short-form script";
    const chatRes = await fetch(`${LLM_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LLM_KEY}`,
        "x-bty-business": "ReActUs", "x-bty-workspace": "default",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4.6",
        messages: [
          {
            role: "system",
            content: `You are a content repurposing expert. Given a YouTube transcript, 
rewrite it as: ${repurposeType}. 
Keep the core value, make it engaging, punchy, and optimized for Creator DNA OS.
Return plain text only — no markdown headers.`,
          },
          {
            role: "user",
            content: `Video: "${videoTitle}"\n\nTranscript:\n${transcript}`,
          },
        ],
        max_tokens: 1000, temperature: 0.7,
      }),
    });

    const chatJson = await chatRes.json();
    const repurposed = chatJson?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ transcript, videoTitle, repurposed });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
