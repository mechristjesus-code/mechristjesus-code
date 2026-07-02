import { NextResponse } from "next/server";
import { listSkills, deleteSkill } from "@/lib/skills-store";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ skills: listSkills() });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = deleteSkill(id);
  return NextResponse.json({ ok });
}
