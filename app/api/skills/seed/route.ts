import { NextResponse } from "next/server";
import { saveSkill, getSkill, type Skill } from "@/lib/skills-store";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Seeds all SKILL.md files from /skills/* into the in-memory store.
// Called once on first Skills Hub load. Idempotent — won't duplicate.
export async function POST() {
  try {
    const skillsDir = path.join(process.cwd(), "skills");
    if (!fs.existsSync(skillsDir)) {
      return NextResponse.json({ seeded: 0, message: "skills/ directory not found" });
    }

    const dirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const seeded: string[] = [];

    for (const dir of dirs) {
      const skillFile = path.join(skillsDir, dir, "SKILL.md");
      const metaFile  = path.join(skillsDir, dir, "metadata.json");
      if (!fs.existsSync(skillFile)) continue;

      const id = `skill_seed_${dir}`;
      if (getSkill(id)) continue; // already loaded

      const rawContent = fs.readFileSync(skillFile, "utf-8");
      let meta: { name?: string; description?: string; tags?: string[] } = {};
      if (fs.existsSync(metaFile)) {
        try { meta = JSON.parse(fs.readFileSync(metaFile, "utf-8")); } catch { /* ignore */ }
      }

      // Extract first non-heading line as description fallback
      const firstLine = rawContent.split("\n")
        .map((l) => l.replace(/^#+\s*/, "").trim())
        .find((l) => l.length > 20 && !l.startsWith("<!--")) ?? dir;

      const skill: Skill = {
        id,
        name:         meta.name ?? dir.replace(/-/g, " "),
        description:  meta.description ?? firstLine.slice(0, 200),
        source:       "upload",
        fileType:     "md",
        rawContent:   rawContent.slice(0, 20000),
        capabilities: [],
        createdAt:    new Date().toISOString(),
      };

      saveSkill(skill);
      seeded.push(dir);
    }

    return NextResponse.json({ seeded: seeded.length, skills: seeded });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
