import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const REACTUS  = process.env.REACTUS_BASE_URL!;
const API_KEY  = process.env.HAPPYSEEDS_KEY!;
const PROJECT  = process.env.HAPPYSEEDS_PROJECT_ID!;
const LLM_KEY  = process.env.HAPPYSEEDS_KEY!;
const LLM_BASE = process.env.BTY_LLM_SERVER_BASE_URL
  ?? (process.env.REACTUS_BASE_URL + "/v1");

// ── Types ──────────────────────────────────────────────────────
export type RemixMode =
  | "ai_script"      // rewrite the transcript as a new script
  | "style_transfer" // regenerate thumbnail in a new visual style
  | "actor_swap"     // replace on-screen person with the user's face
  | "shorts_cut"     // extract best 60s clip ideas
  | "reaction"       // generate a reaction/commentary script
  | "mashup";        // combine two video concepts into one new script

// ── System prompts per mode ────────────────────────────────────
const MODE_PROMPTS: Record<RemixMode, string> = {
  ai_script: `You are a YouTube scriptwriter. Given a video transcript, rewrite it
as a completely new, original script on the same topic. Make it more engaging,
punchy, and optimized for watch time. Use pattern interrupts, open loops, and CTAs.
Return plain text — the full remixed script only.`,

  shorts_cut: `You are a YouTube Shorts editor. Given a transcript, identify the
3 best 60-second clip moments. For each, provide:
- CLIP [n]: timestamp range suggestion (e.g. 0:30–1:30)
- HOOK: the opening line that grabs attention
- SCRIPT: the trimmed 60s script
- WHY: why this clip will perform well
Return plain text, clearly labeled.`,

  reaction: `You are a reaction content creator. Given a video transcript, write a
compelling reaction/commentary script. Include: your initial reaction, key moments
to pause and comment on, your hot takes, and a strong outro with your opinion.
Return the full reaction script as plain text.`,

  mashup: `You are a creative video producer. Given two video concepts/transcripts,
create a completely new mashup concept that combines the best ideas from both.
Include: concept pitch (2 sentences), full script, thumbnail concept, and title ideas.
Return plain text.`,

  style_transfer: `You are a YouTube thumbnail designer. Given a video title and
description, write a detailed image generation prompt for a completely new thumbnail
in the requested style. Make it eye-catching, with bold text space, high contrast,
and emotional pull. Return ONLY the image generation prompt.`,

  actor_swap: `You are a video director. Given a video script/transcript, rewrite
the script optimized for a new AI actor to deliver it. Adjust tone, pacing, and
delivery notes so it feels authentic. Include [PAUSE], [EMPHASIZE], [SMILE] etc.
Return the actor-ready script only.`,
};

// ── Helpers ────────────────────────────────────────────────────
async function fetchTranscript(videoId: string): Promise<{ transcript: string; title: string }> {
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await pageRes.text();
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(" - YouTube", "").trim() : videoId;

  const captionMatch = html.match(/"captionTracks":\s*\[.*?"baseUrl":"(.*?)"/);
  let transcript = "";
  if (captionMatch) {
    const capUrl = captionMatch[1].replace(/\\u0026/g, "&");
    const capRes = await fetch(capUrl);
    const xml   = await capRes.text();
    transcript  = xml
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
      .replace(/&#39;/g,"'").replace(/&quot;/g,'"')
      .replace(/\s+/g," ").trim().slice(0, 5000);
  }
  return { transcript: transcript || "[No transcript available]", title };
}

// ── POST /api/studio/youtube/remix ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const {
      videoId,         // primary YouTube video ID
      videoId2,        // optional second video for mashup
      mode,            // RemixMode
      style,           // for style_transfer
      faceBase64,      // for actor_swap
      faceMime,
    } = await req.json() as {
      videoId: string; videoId2?: string; mode: RemixMode;
      style?: string; faceBase64?: string; faceMime?: string;
    };

    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });
    if (!mode)    return NextResponse.json({ error: "mode required" }, { status: 400 });

    const { transcript, title } = await fetchTranscript(videoId);

    let secondTranscript = "";
    let secondTitle = "";
    if (mode === "mashup" && videoId2) {
      const second = await fetchTranscript(videoId2);
      secondTranscript = second.transcript;
      secondTitle      = second.title;
    }

    const systemPrompt = MODE_PROMPTS[mode];
    let userContent = `Video: "${title}"\n\nTranscript:\n${transcript}`;
    if (mode === "mashup" && secondTranscript) {
      userContent += `\n\n---\nVideo 2: "${secondTitle}"\n\nTranscript 2:\n${secondTranscript}`;
    }
    if (mode === "style_transfer" && style) {
      userContent += `\n\nRequested visual style: ${style}`;
    }

    // Call LLM
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
          { role: "system", content: systemPrompt },
          { role: "user",   content: userContent  },
        ],
        max_tokens: 1500, temperature: 0.75,
      }),
    });

    const chatJson = await chatRes.json();
    const remixText = chatJson?.choices?.[0]?.message?.content ?? "";

    // For style_transfer: also generate thumbnail image
    let thumbnailUrl: string | null = null;
    if (mode === "style_transfer" && remixText) {
      const imgRes = await fetch(`${REACTUS}/v1/llm_server`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY, "x-bty-app": PROJECT,
          "x-bty-model": "gpt-image-2-gen", "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: remixText + " YouTube thumbnail style, 16:9 aspect ratio",
          n: 1, size: "1536x1024", quality: "medium",
          background: "auto", output_format: "png",
        }),
      });
      const imgJson = await imgRes.json();
      const b64 = imgJson?.data?.[0]?.b64_json;
      if (b64) {
        const ossRes = await fetch(`${REACTUS}/v1/llm_server/upload_base64_file`, {
          method: "POST",
          headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: PROJECT,
            content: `data:image/png;base64,${b64}`,
          }),
        });
        const ossJson = await ossRes.json();
        if (ossJson.success) thumbnailUrl = ossJson.data;
      }
    }

    // For actor_swap: kick off AI actor video with remixed script
    let actorTaskId: string | null = null;
    if (mode === "actor_swap" && faceBase64) {
      const uploadRes = await fetch(`${REACTUS}/v1/llm_server/upload_base64_file`, {
        method: "POST",
        headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: PROJECT,
          content: `data:${faceMime ?? "image/jpeg"};base64,${faceBase64}`,
        }),
      });
      const uploadJson = await uploadRes.json();
      if (uploadJson.success) {
        const faceUrl = uploadJson.data as string;
        const vidRes = await fetch(`${REACTUS}/v1/llm_server`, {
          method: "POST",
          headers: {
            "x-api-key": API_KEY, "x-bty-app": PROJECT,
            "x-bty-model": "doubao-seedance-1-5-pro-251215",
            "X-DashScope-Async": "enable", "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "doubao-seedance-1-5-pro-251215",
            content: [
              { type: "text", text: `${remixText.slice(0, 300)} Cinematic style.` },
              { type: "image_url", image_url: { url: faceUrl }, role: "first_frame" },
            ],
            generate_audio: false, ratio: "adaptive", duration: 5, watermark: false,
          }),
        });
        const vidJson = await vidRes.json();
        actorTaskId = vidJson?.id ?? null;
      }
    }

    return NextResponse.json({
      remixText,
      thumbnailUrl,
      actorTaskId,
      originalTitle: title,
      mode,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
