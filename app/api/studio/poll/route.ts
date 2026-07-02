import { NextRequest, NextResponse } from "next/server";

const REACTUS = process.env.REACTUS_BASE_URL!;
const API_KEY = process.env.HAPPYSEEDS_KEY!;
const PROJECT = process.env.HAPPYSEEDS_PROJECT_ID!;

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  try {
    const res = await fetch(
      `${REACTUS}/v1/llm_server/fetch_result?unique_key=${encodeURIComponent(taskId)}`,
      {
        headers: {
          "x-api-key":   API_KEY,
          "x-bty-app":   PROJECT,
          "x-bty-model": "doubao-seedance-1-5-pro-251215",
        },
      }
    );
    const json = await res.json();

    // Doubao status: "processing" | "succeeded" | "failed"
    const status   = json?.task_status ?? json?.status ?? "processing";
    const videoUrl = json?.video_url ?? json?.output?.video_url ?? null;

    if (status === "succeeded" && videoUrl) {
      // Persist to OSS
      const ossRes  = await fetch(`${REACTUS}/v1/llm_server/file_dump_to_oss`, {
        method:  "POST",
        headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
        body:    JSON.stringify({ project_id: PROJECT, url: videoUrl }),
      });
      const ossJson = await ossRes.json();
      const ossUrl  = ossJson.success ? (ossJson.data as string) : videoUrl;
      return NextResponse.json({ status: "done", videoUrl: ossUrl });
    }

    if (status === "failed") {
      return NextResponse.json({ status: "failed", detail: json });
    }

    return NextResponse.json({ status: "processing" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
