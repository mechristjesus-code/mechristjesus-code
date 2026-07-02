import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const REACTUS = process.env.REACTUS_BASE_URL!;
const API_KEY = process.env.HAPPYSEEDS_KEY!;
const PROJECT = process.env.HAPPYSEEDS_PROJECT_ID!;

async function uploadToOSS(dataUri: string): Promise<string> {
  const r = await fetch(`${REACTUS}/v1/llm_server/upload_base64_file`, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: PROJECT, content: dataUri }),
  });
  const j = await r.json();
  if (!j.success) throw new Error("OSS upload failed: " + JSON.stringify(j));
  return j.data as string;
}

export async function POST(req: NextRequest) {
  try {
    const { faceBase64, faceMime, script, scene, duration, voiceOver } = await req.json();
    if (!faceBase64) return NextResponse.json({ error: "faceBase64 required" }, { status: 400 });
    if (!script)     return NextResponse.json({ error: "script required" }, { status: 400 });

    // Upload actor face photo to OSS
    const mime    = faceMime ?? "image/jpeg";
    const faceUrl = await uploadToOSS(`data:${mime};base64,${faceBase64}`);

    // Build video prompt: scene + script as narration/action
    const prompt = [
      scene ? `Scene: ${scene}.` : "",
      `The person in the image appears on screen as the AI actor.`,
      `They speak or perform: "${script}"`,
      voiceOver ? "Natural lip movement and expressive delivery." : "",
    ].filter(Boolean).join(" ");

    // Kick off async video generation — actor face as first_frame
    const res = await fetch(`${REACTUS}/v1/llm_server`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY, "x-bty-app": PROJECT,
        "x-bty-model": "doubao-seedance-1-5-pro-251215",
        "X-DashScope-Async": "enable", "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "doubao-seedance-1-5-pro-251215",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: faceUrl }, role: "first_frame" },
        ],
        generate_audio: false,
        ratio: "adaptive",
        duration: Math.min(Math.max(duration ?? 5, 3), 10),
        watermark: false,
      }),
    });
    const j = await res.json();
    const taskId = j?.id;
    if (!taskId) return NextResponse.json({ error: "No task id", detail: j }, { status: 500 });
    return NextResponse.json({ taskId });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
