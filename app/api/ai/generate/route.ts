/**
 * /api/ai/generate — non-streaming generation for structured outputs
 * Handles: youtube_script, youtube_title, youtube_description, hashtags,
 *          thumbnail_concept, social_caption, research
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDna } from '@/lib/creator/dna'
import { recallMemory, saveChatMessage } from '@/lib/creator/memory'
import { buildSystemPrompt, type WorkflowType } from '@/lib/creator/prompt-engine'
import { complete } from '@/lib/creator/ai-router'
import { db } from '@/db'
import { creatorProjects } from '@/db/schemas/creator_projects'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { workflow, userInput, transcript, projectId } = await req.json() as {
      workflow:   WorkflowType
      userInput:  string
      transcript?: string
      projectId?: string
    }

    if (!workflow || !userInput?.trim()) {
      return NextResponse.json({ error: 'workflow and userInput required' }, { status: 400 })
    }

    const dna      = await getDna(session.sub)
    const memories = await recallMemory(session.sub, 'creator', 10)

    const systemPrompt = buildSystemPrompt({
      dna, workflow, userInput, transcript, memories,
    })

    const result = await complete([
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userInput },
    ])

    // Auto-save to project if provided
    if (projectId) {
      const updateMap: Record<string, string> = {
        youtube_script:      'generatedScript',
        youtube_title:       'generatedTitle',
        youtube_description: 'generatedDesc',
      }
      const col = updateMap[workflow]
      if (col) {
        await db.update(creatorProjects)
          .set({ [col]: result, updatedAt: new Date() })
          .where(and(eq(creatorProjects.id, projectId), eq(creatorProjects.userId, session.sub)))
      }
    }

    await saveChatMessage(session.sub, 'assistant', result, undefined, projectId)

    return NextResponse.json({ result, workflow })
  } catch (err) {
    console.error('[ai/generate]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
