import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { creatorProjects } from '@/db/schemas/creator_projects'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { fetchYouTubeTranscript } from '@/lib/creator/ai-router'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = await db.select().from(creatorProjects)
    .where(eq(creatorProjects.userId, session.sub))
    .orderBy(desc(creatorProjects.updatedAt))
  return NextResponse.json({ projects })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, type, sourceUrl, notes } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })

  // Auto-fetch transcript for YouTube URLs
  let transcript = ''
  if (sourceUrl && (type === 'youtube' || sourceUrl.includes('youtube') || sourceUrl.includes('youtu.be'))) {
    transcript = await fetchYouTubeTranscript(sourceUrl)
  }

  const [project] = await db.insert(creatorProjects).values({
    userId: session.sub, title, type: type ?? 'youtube', sourceUrl, transcript, notes,
  }).returning()

  return NextResponse.json({ project, transcriptFetched: !!transcript }, { status: 201 })
}
