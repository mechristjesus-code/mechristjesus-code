import { NextRequest, NextResponse } from "next/server";
import { saveSkill, type Skill } from "@/lib/skills-store";

export const runtime = "nodejs";
export const maxDuration = 30;

// ── Text extractors by file type ──────────────────────────────

function extractText(buffer: Buffer, mimeType: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  // For plain text types, decode directly
  if (
    mimeType.includes("text") ||
    ["md", "txt", "yaml", "yml", "json", "toml", "env"].includes(ext)
  ) {
    return buffer.toString("utf-8").slice(0, 20000);
  }
  // PDFs / binary: return placeholder (full extraction needs pdftotext)
  return `[Binary file: ${filename} — ${Math.round(buffer.byteLength / 1024)} KB]\n` +
    "Content extraction available for text, markdown, JSON, YAML files.";
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── POST /api/skills/upload ───────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const form     = await req.formData();
    const file     = form.get("file") as File | null;
    const nameOver = (form.get("name") as string | null) ?? "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes    = await file.arrayBuffer();
    const buffer   = Buffer.from(bytes);
    const rawText  = extractText(buffer, file.type, file.name);

    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "txt";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const skillName = nameOver.trim() || baseName.replace(/[-_]/g, " ");

    // Simple description: first non-empty line of content
    const firstLine = rawText
      .split("\n")
      .map((l) => l.replace(/^#+\s*/, "").trim())
      .find((l) => l.length > 10 && !l.startsWith("[")) ?? skillName;

    const id = `skill_${Date.now()}_${slugify(skillName).slice(0, 20)}`;

    const skill: Skill = {
      id,
      name:         skillName,
      description:  firstLine.slice(0, 200),
      source:       "upload",
      fileType:     ext,
      rawContent:   rawText,
      capabilities: [],          // filled by /api/skills/generate
      createdAt:    new Date().toISOString(),
    };

    saveSkill(skill);

    return NextResponse.json({ skill });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
