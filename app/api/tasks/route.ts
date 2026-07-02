import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { tasks } from '@/db/schemas/tasks'
import { taskTags, tags } from '@/db/schemas/tags'
import { eq, desc, inArray } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { logActivity } from '@/lib/logActivity'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, session.sub))
    .orderBy(desc(tasks.createdAt))

  if (userTasks.length === 0) return NextResponse.json({ tasks: [] })

  const taskIds = userTasks.map((t) => t.id)
  const tagRows = await db
    .select({ taskId: taskTags.taskId, tag: tags })
    .from(taskTags)
    .innerJoin(tags, eq(taskTags.tagId, tags.id))
    .where(inArray(taskTags.taskId, taskIds))

  const tagsByTask: Record<string, typeof tags.$inferSelect[]> = {}
  for (const row of tagRows) {
    if (!tagsByTask[row.taskId]) tagsByTask[row.taskId] = []
    tagsByTask[row.taskId].push(row.tag)
  }

  const enriched = userTasks.map((t) => ({ ...t, tags: tagsByTask[t.id] ?? [] }))
  return NextResponse.json({ tasks: enriched })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, description, priority, dueDate, assigneeId, teamId } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const [task] = await db.insert(tasks).values({
      userId: session.sub,
      title: title.trim(),
      description: description?.trim() ?? null,
      priority: priority ?? 'medium',
      status: 'todo',
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId ?? null,
      teamId: teamId ?? null,
    }).returning()

    await logActivity(session.sub, 'task_created', `Created "${task.title}"`, task.id)
    return NextResponse.json({ task: { ...task, tags: [] } }, { status: 201 })
  } catch (err) {
    console.error('[tasks POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
