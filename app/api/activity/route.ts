import { NextResponse } from 'next/server'
import { db } from '@/db'
import { activityLog } from '@/db/schemas/activity'
import { tasks } from '@/db/schemas/tasks'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entries = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      detail: activityLog.detail,
      createdAt: activityLog.createdAt,
      taskId: activityLog.taskId,
      taskTitle: tasks.title,
    })
    .from(activityLog)
    .leftJoin(tasks, eq(activityLog.taskId, tasks.id))
    .where(eq(activityLog.userId, session.sub))
    .orderBy(desc(activityLog.createdAt))
    .limit(50)

  return NextResponse.json({ activity: entries })
}
