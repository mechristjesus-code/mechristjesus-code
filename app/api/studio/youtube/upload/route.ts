import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * YouTube upload route.
 * Requires OAuth2 access token from the client (user must auth with Google).
 * The frontend collects the token via Google OAuth consent and passes it here.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      videoUrl,      // OSS URL of the generated video
      accessToken,   // Google OAuth2 access token from client
      title,
      description,
      tags,
      categoryId,
      privacyStatus, // "public" | "private" | "unlisted"
    } = await req.json();

    if (!accessToken) {
      return NextResponse.json({
        error: "Google OAuth access token required.",
        authUrl: buildAuthUrl(),
      }, { status: 401 });
    }
    if (!videoUrl) return NextResponse.json({ error: "videoUrl required" }, { status: 400 });

    // Fetch the video blob from OSS
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error("Failed to fetch video from OSS");
    const videoBuffer = await videoRes.arrayBuffer();

    // YouTube resumable upload — step 1: init
    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type":  "application/json",
          "X-Upload-Content-Type": "video/mp4",
          "X-Upload-Content-Length": String(videoBuffer.byteLength),
        },
        body: JSON.stringify({
          snippet: {
            title:       title ?? "Creator DNA OS — AI Generated Video",
            description: description ?? "Generated with Creator DNA OS AI Studio",
            tags:        tags ?? ["AI", "CreatorDNA"],
            categoryId:  categoryId ?? "22",
          },
          status: { privacyStatus: privacyStatus ?? "private" },
        }),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      return NextResponse.json({ error: "YouTube init failed", detail: errText }, { status: 502 });
    }

    const uploadUri = initRes.headers.get("location");
    if (!uploadUri) throw new Error("No upload URI from YouTube");

    // Step 2: upload the video bytes
    const uploadRes = await fetch(uploadUri, {
      method: "PUT",
      headers: {
        "Content-Type":   "video/mp4",
        "Content-Length": String(videoBuffer.byteLength),
        "Authorization":  `Bearer ${accessToken}`,
      },
      body: videoBuffer,
    });

    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok) {
      return NextResponse.json({ error: "Upload failed", detail: uploadJson }, { status: 502 });
    }

    const videoId = uploadJson.id;
    return NextResponse.json({
      success:  true,
      videoId,
      youtubeUrl: `https://youtube.com/watch?v=${videoId}`,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri:  process.env.NEXT_PUBLIC_APP_URL + "/api/auth/google/callback",
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube",
    ].join(" "),
    access_type: "offline",
    prompt:      "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
