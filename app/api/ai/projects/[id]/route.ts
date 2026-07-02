import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { creatorProjects } from '@/db/schemas/creator_projects'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

type P = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const [project] = await db.select().from(creatorProjects)
    .where(and(eq(creatorProjects.id, id), eq(creatorProjects.userId, session.sub)))
    .limit(1)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ project })
}

export async function PATCH(req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const allowed = ['title','status','transcript','generatedScript','generatedTitle','generatedDesc','hashtags','notes']
  const updates: Record<string,unknown> = { updatedAt: new Date() }
  for (const k of allowed) if (k in body) updates[k] = body[k]
  const [updated] = await db.update(creatorProjects).set(updates)
    .where(and(eq(creatorProjects.id, id), eq(creatorProjects.userId, session.sub))).returning()
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ project: updated })
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await db.delete(creatorProjects).where(and(eq(creatorProjects.id, id), eq(creatorProjects.userId, session.sub)))
  return NextResponse.json({ success: true })
}
