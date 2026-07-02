import { NextRequest, NextResponse } from "next/server";

const REACTUS  = process.env.REACTUS_BASE_URL!;
const API_KEY  = process.env.HAPPYSEEDS_KEY!;
const PROJECT  = process.env.HAPPYSEEDS_PROJECT_ID!;

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, imageMime, prompt, duration } = await req.json();

    if (!imageBase64 || !prompt) {
      return NextResponse.json({ error: "imageBase64 and prompt are required" }, { status: 400 });
    }

    // Upload user's photo to OSS
    const mimeType = imageMime ?? "image/jpeg";
    const dataUri  = `data:${mimeType};base64,${imageBase64}`;

    const uploadRes = await fetch(`${REACTUS}/v1/llm_server/upload_base64_file`, {
      method:  "POST",
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      body:    JSON.stringify({ project_id: PROJECT, content: dataUri }),
    });
    const uploadJson = await uploadRes.json();
    if (!uploadJson.success) {
      return NextResponse.json({ error: "Upload failed", detail: uploadJson }, { status: 500 });
    }
    const imageUrl = uploadJson.data as string;

    // Start async video generation using doubao-seedance with first_frame = user's photo
    const videoRes = await fetch(`${REACTUS}/v1/llm_server`, {
      method: "POST",
      headers: {
        "x-api-key":        API_KEY,
        "x-bty-app":        PROJECT,
        "x-bty-model":      "doubao-seedance-1-5-pro-251215",
        "X-DashScope-Async":"enable",
        "Content-Type":     "application/json",
      },
      body: JSON.stringify({
        model:    "doubao-seedance-1-5-pro-251215",
        content: [
          { type: "text",      text: prompt },
          { type: "image_url", image_url: { url: imageUrl }, role: "first_frame" },
        ],
        generate_audio: false,
        ratio:    "adaptive",
        duration: duration ?? 5,
        watermark: false,
      }),
    });

    const videoJson = await videoRes.json();
    // doubao returns `id` (not task_id)
    const taskId = videoJson?.id;
    if (!taskId) {
      return NextResponse.json({ error: "No task id returned", detail: videoJson }, { status: 500 });
    }

    return NextResponse.json({ taskId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
