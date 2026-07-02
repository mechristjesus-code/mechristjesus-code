import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const REACTUS = process.env.REACTUS_BASE_URL!;
const API_KEY = process.env.HAPPYSEEDS_KEY!;
const PROJECT = process.env.HAPPYSEEDS_PROJECT_ID!;
const LLM_KEY = process.env.HAPPYSEEDS_KEY!;
const LLM_BASE = process.env.BTY_LLM_SERVER_BASE_URL
  ?? (process.env.REACTUS_BASE_URL + "/v1");

const SYSTEM = `You are a YouTube SEO and monetization expert.
Given a video topic and script, return ONLY valid JSON (no fences):
{
  "title": "...",
  "description": "...",
  "tags": ["tag1","tag2",...],
  "category": "...",
  "thumbnailPrompt": "...",
  "monetizationTips": ["tip1","tip2","tip3"],
  "bestUploadTime": "...",
  "estimatedCPM": "..."
}
Title: 60 chars max, front-load keyword, compelling.
Description: 300 words, include keywords, timestamps placeholder, CTA.
Tags: 15 tags, mix broad+specific.
ThumbnailPrompt: vivid image-gen prompt for a YouTube thumbnail.`;

export async function POST(req: NextRequest) {
  try {
    const { topic, script, niche } = await req.json();
    if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

    // Generate metadata via LLM
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
          { role: "system", content: SYSTEM },
          { role: "user", content: `Topic: ${topic}\nNiche: ${niche ?? "general"}\nScript excerpt: ${(script ?? "").slice(0, 500)}` },
        ],
        max_tokens: 1500, temperature: 0.6,
      }),
    });
    const chatJson = await chatRes.json();
    const raw = chatJson?.choices?.[0]?.message?.content ?? "";
    let meta: Record<string, unknown>;
    try {
      meta = JSON.parse(raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "LLM returned invalid JSON", raw }, { status: 500 });
    }

    // Auto-generate thumbnail image
    let thumbnailUrl: string | null = null;
    if (meta.thumbnailPrompt) {
      const imgRes = await fetch(`${REACTUS}/v1/llm_server`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY, "x-bty-app": PROJECT,
          "x-bty-model": "gpt-image-2-gen", "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: meta.thumbnailPrompt + " YouTube thumbnail, 16:9, bold text space",
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
          body: JSON.stringify({ project_id: PROJECT, content: `data:image/png;base64,${b64}` }),
        });
        const ossJson = await ossRes.json();
        if (ossJson.success) thumbnailUrl = ossJson.data;
      }
    }

    return NextResponse.json({ meta, thumbnailUrl });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
