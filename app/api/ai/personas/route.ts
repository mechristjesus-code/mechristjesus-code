import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { aiPersonas } from '@/db/schemas/ai_personas'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

const DEFAULT_PERSONAS = [
  { name: 'Script Writer',      role: 'script_writer',   emoji: '✍️', systemPrompt: 'You are an expert YouTube script writer. Write engaging, original scripts that convert viewers.' },
  { name: 'SEO Assistant',      role: 'seo',             emoji: '📈', systemPrompt: 'You are an SEO expert. Optimise titles, descriptions, and tags for maximum discoverability.' },
  { name: 'Research Assistant', role: 'research',        emoji: '🔬', systemPrompt: 'You are a deep research assistant. Find facts, trends, and insights on any topic.' },
  { name: 'Social Media Mgr',   role: 'social',          emoji: '📱', systemPrompt: 'You create viral social media captions and hooks tailored to the creator\'s audience.' },
  { name: 'Video Editor',       role: 'video_editor',    emoji: '🎬', systemPrompt: 'You are a video editing consultant. Suggest cuts, pacing, transitions and visual effects.' },
  { name: 'Thumbnail Designer', role: 'thumbnail',       emoji: '🎨', systemPrompt: 'You design compelling thumbnail concepts with text, color, and composition guidance.' },
]

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let personas = await db.select().from(aiPersonas).where(eq(aiPersonas.userId, session.sub))

  // Seed defaults if none exist
  if (personas.length === 0) {
    const inserts = DEFAULT_PERSONAS.map((p) => ({ ...p, userId: session.sub, isDefault: true }))
    personas = await db.insert(aiPersonas).values(inserts).returning()
  }

  return NextResponse.json({ personas })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.name || !body.systemPrompt) return NextResponse.json({ error: 'name and systemPrompt required' }, { status: 400 })
  const [persona] = await db.insert(aiPersonas).values({ ...body, userId: session.sub }).returning()
  return NextResponse.json({ persona }, { status: 201 })
}
