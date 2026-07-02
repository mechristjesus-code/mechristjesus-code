import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { tags } from '@/db/schemas/tags'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userTags = await db.select().from(tags).where(eq(tags.userId, session.sub))
  return NextResponse.json({ tags: userTags })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const [tag] = await db.insert(tags).values({ userId: session.sub, name: name.trim(), color: color ?? '#6366f1' }).returning()
  return NextResponse.json({ tag }, { status: 201 })
}
