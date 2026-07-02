import { NextResponse } from 'next/server'
import { db } from '@/db'
import { tasks } from '@/db/schemas/tasks'
import { eq, and, gte, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.sub

  // Status breakdown
  const statusCounts = await db
    .select({ status: tasks.status, count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .groupBy(tasks.status)

  // Priority breakdown
  const priorityCounts = await db
    .select({ priority: tasks.priority, count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .groupBy(tasks.priority)

  // Tasks created per day for last 14 days
  const since = new Date()
  since.setDate(since.getDate() - 13)

  const dailyCreated = await db
    .select({
      day: sql<string>`DATE(created_at)::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), gte(tasks.createdAt, since)))
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`)

  // Fill in missing days with 0
  const dayMap: Record<string, number> = {}
  for (const row of dailyCreated) dayMap[row.day] = row.count
  const trend: { day: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    trend.push({ day: key, count: dayMap[key] ?? 0 })
  }

  return NextResponse.json({ statusCounts, priorityCounts, trend })
}
