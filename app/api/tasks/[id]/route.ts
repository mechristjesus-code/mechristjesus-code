import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { tasks } from '@/db/schemas/tasks'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { logActivity } from '@/lib/logActivity'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId', 'teamId'] as const
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    for (const key of allowed) {
      if (key in body) {
        updates[key] = (key === 'dueDate' && body[key]) ? new Date(body[key]) : (body[key] ?? null)
      }
    }
    const [updated] = await db
      .update(tasks).set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.sub)))
      .returning()
    if (!updated) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (body.status) await logActivity(session.sub, 'task_updated', `Status → ${body.status}`, id)
    return NextResponse.json({ task: updated })
  } catch (err) {
    console.error('[tasks PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const [deleted] = await db
      .delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, session.sub))).returning()
    if (!deleted) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    await logActivity(session.sub, 'task_deleted', `Deleted "${deleted.title}"`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[tasks DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
