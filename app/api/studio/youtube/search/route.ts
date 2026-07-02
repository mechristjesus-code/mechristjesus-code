import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const YT_KEY = process.env.YOUTUBE_API_KEY ?? "";

export async function GET(req: NextRequest) {
  const q         = req.nextUrl.searchParams.get("q") ?? "";
  const maxResults = req.nextUrl.searchParams.get("max") ?? "8";
  if (!q) return NextResponse.json({ error: "q required" }, { status: 400 });

  if (!YT_KEY || YT_KEY === "your-youtube-data-api-v3-key") {
    // Return mock results so the UI is usable without a real key
    return NextResponse.json({ items: mockResults(q), mock: true });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&maxResults=${maxResults}&type=video&key=${YT_KEY}`;
    const res  = await fetch(url);
    const json = await res.json();
    if (json.error) return NextResponse.json({ error: json.error.message }, { status: 400 });
    const items = (json.items ?? []).map((it: Record<string, unknown>) => {
      const snip = it.snippet as Record<string, unknown>;
      const id   = it.id as Record<string, unknown>;
      return {
        videoId:     id.videoId,
        title:       snip.title,
        description: snip.description,
        thumbnail:   (snip.thumbnails as Record<string, Record<string, unknown>>)?.medium?.url,
        channel:     snip.channelTitle,
        publishedAt: snip.publishedAt,
      };
    });
    return NextResponse.json({ items });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

function mockResults(q: string) {
  return Array.from({ length: 4 }, (_, i) => ({
    videoId:     `mock_${i}`,
    title:       `${q} — Video ${i + 1} (demo)`,
    description: "Add your YouTube Data API v3 key to .env to see real results.",
    thumbnail:   `https://picsum.photos/seed/${q}${i}/320/180`,
    channel:     "Demo Channel",
    publishedAt: new Date().toISOString(),
    mock:        true,
  }));
}
