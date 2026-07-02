import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { tags, taskTags } from '@/db/schemas/tags'
import { and, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

type P = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, session.sub)))
  return NextResponse.json({ success: true })
}

// PUT /api/tags/:tagId  — toggle tag on a task
export async function PUT(req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: tagId } = await params
  const { taskId, assign } = await req.json()
  if (assign) {
    await db.insert(taskTags).values({ taskId, tagId }).onConflictDoNothing()
  } else {
    await db.delete(taskTags).where(and(eq(taskTags.taskId, taskId), eq(taskTags.tagId, tagId)))
  }
  return NextResponse.json({ success: true })
}
