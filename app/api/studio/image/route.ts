import { NextRequest, NextResponse } from "next/server";

const REACTUS  = process.env.REACTUS_BASE_URL!;
const API_KEY  = process.env.HAPPYSEEDS_KEY!;
const PROJECT  = process.env.HAPPYSEEDS_PROJECT_ID!;

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, imageMime, prompt, style } = await req.json();

    if (!imageBase64 || !prompt) {
      return NextResponse.json({ error: "imageBase64 and prompt are required" }, { status: 400 });
    }

    const stylePrompts: Record<string, string> = {
      cinematic:   "cinematic movie still, dramatic lighting, film grain, 4K",
      anime:       "anime illustration style, vibrant colors, sharp lines",
      oil:         "oil painting, impressionist brushstrokes, fine art museum quality",
      cyberpunk:   "cyberpunk neon city night, rain-slicked streets, synthwave aesthetic",
      watercolor:  "soft watercolor illustration, delicate washes, artistic",
      magazine:    "high-fashion editorial magazine cover, studio lighting, Vogue aesthetic",
      cartoon:     "Pixar 3D cartoon style, expressive, colorful, family-friendly",
      realistic:   "photorealistic, ultra-detailed, professional photography, 8K",
    };
    const styleHint = stylePrompts[style] ?? "";
    const fullPrompt = `${prompt}. ${styleHint}`.trim();

    // Upload the user's image to OSS first
    const mimeType = imageMime ?? "image/jpeg";
    const dataUri  = `data:${mimeType};base64,${imageBase64}`;

    const uploadRes = await fetch(`${REACTUS}/v1/llm_server/upload_base64_file`, {
      method:  "POST",
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      body:    JSON.stringify({ project_id: PROJECT, content: dataUri }),
    });
    const uploadJson = await uploadRes.json();
    if (!uploadJson.success) {
      return NextResponse.json({ error: "Failed to upload image", detail: uploadJson }, { status: 500 });
    }
    const imageUrl = uploadJson.data as string;

    // Edit the image with the user's prompt
    const editRes = await fetch(`${REACTUS}/v1/llm_server`, {
      method: "POST",
      headers: {
        "x-api-key":   API_KEY,
        "x-bty-app":   PROJECT,
        "x-bty-model": "gpt-image-2-edit",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:    "gpt-image-2",
        images:   [{ image_url: imageUrl }],
        prompt:   fullPrompt,
        n:        1,
        size:     "1024x1024",
        quality:  "high",
        background: "auto",
        output_format: "png",
      }),
    });

    const editJson = await editRes.json();
    const b64 = editJson?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image returned", detail: editJson }, { status: 500 });
    }

    // Persist to OSS
    const ossRes = await fetch(`${REACTUS}/v1/llm_server/upload_base64_file`, {
      method:  "POST",
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      body:    JSON.stringify({ project_id: PROJECT, content: `data:image/png;base64,${b64}` }),
    });
    const ossJson = await ossRes.json();
    const ossUrl  = ossJson.success ? (ossJson.data as string) : null;

    return NextResponse.json({ b64, ossUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
