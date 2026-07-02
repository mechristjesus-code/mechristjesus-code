import { NextRequest, NextResponse } from "next/server";
import { getSkill, saveSkill, type Capability } from "@/lib/skills-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const LLM_BASE = process.env.BTY_LLM_SERVER_BASE_URL ?? process.env.REACTUS_BASE_URL + "/v1";
const LLM_KEY  = process.env.HAPPYSEEDS_KEY!;

// ── System prompt ────────────────────────────────────────────

const SYSTEM = `You are a skill analyzer for the Creator DNA OS platform.
Given a skill document, extract structured capabilities.
Return ONLY valid JSON — no markdown fences, no explanation.

Format:
{
  "name": "Short skill name",
  "description": "One-sentence summary of what this skill does",
  "capabilities": [
    {
      "id": "cap_1",
      "title": "Capability title",
      "description": "What this capability does (1–2 sentences)",
      "category": "one of: Content|Code|Analysis|Media|Automation|Research|Communication|Data",
      "example": "A concrete one-line example of using this capability",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}
Generate between 4 and 10 capabilities. Make them specific, actionable, and tied to the document content.`;

// ── POST /api/skills/generate ─────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { skillId, extraPrompt } = await req.json();
    if (!skillId) return NextResponse.json({ error: "skillId required" }, { status: 400 });

    const skill = getSkill(skillId);
    if (!skill) return NextResponse.json({ error: "Skill not found" }, { status: 404 });

    // Truncate raw content to avoid token overflow
    const content = skill.rawContent.slice(0, 8000);
    const userMsg  = [
      `Skill document (${skill.fileType}):`,
      "---",
      content,
      "---",
      extraPrompt ? `Additional context: ${extraPrompt}` : "",
    ].filter(Boolean).join("\n");

    // Call chat completions (BTY gateway, OpenAI protocol)
    const chatRes = await fetch(`${LLM_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization":    `Bearer ${LLM_KEY}`,
        "x-bty-business":   "ReActUs",
        "x-bty-workspace":  "default",
        "Content-Type":     "application/json",
      },
      body: JSON.stringify({
        model:    "claude-sonnet-4.6",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user",   content: userMsg },
        ],
        max_tokens:   2048,
        temperature:  0.4,
      }),
    });

    if (!chatRes.ok) {
      const errText = await chatRes.text();
      return NextResponse.json({ error: "LLM call failed", detail: errText }, { status: 502 });
    }

    const chatJson = await chatRes.json();
    const raw      = chatJson?.choices?.[0]?.message?.content ?? "";

    // Parse JSON from LLM response
    let parsed: { name?: string; description?: string; capabilities?: Capability[] };
    try {
      // strip any accidental backtick fences
      const clean = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "LLM returned invalid JSON", raw }, { status: 500 });
    }

    // Merge into skill
    const updated = {
      ...skill,
      name:         parsed.name        ?? skill.name,
      description:  parsed.description ?? skill.description,
      capabilities: (parsed.capabilities ?? []).map((c, i) => ({
        ...c,
        id: c.id ?? `cap_${i + 1}`,
      })),
    };

    saveSkill(updated);
    return NextResponse.json({ skill: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
