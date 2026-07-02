import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDna } from '@/lib/creator/dna'
import { getChatHistory, saveChatMessage } from '@/lib/creator/memory'
import { buildSystemPrompt } from '@/lib/creator/prompt-engine'
import { stream } from '@/lib/creator/ai-router'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { message, projectId, personaId, systemPromptOverride } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'message required' }, { status: 400 })

    const dna      = await getDna(session.sub)
    const history  = await getChatHistory(session.sub, 20, projectId)

    const systemPrompt = systemPromptOverride ?? buildSystemPrompt({
      dna, workflow: 'chat', userInput: message,
    })

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ]

    // Save user message
    await saveChatMessage(session.sub, 'user', message, personaId, projectId)

    // Stream response back
    const aiStream = await stream(messages)

    // Pipe through and collect for saving
    const encoder = new TextEncoder()
    let fullResponse = ''

    const transformed = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, ctrl) {
        const text = new TextDecoder().decode(chunk)
        // Extract content from SSE lines
        for (const line of text.split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6))
              const delta = json.choices?.[0]?.delta?.content
              if (delta) fullResponse += delta
            } catch { /* skip */ }
          }
        }
        ctrl.enqueue(chunk)
      },
      async flush() {
        if (fullResponse) {
          await saveChatMessage(session.sub, 'assistant', fullResponse, personaId, projectId)
        }
      }
    })

    return new Response(aiStream.pipeThrough(transformed), {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })
  } catch (err) {
    console.error('[ai/chat]', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
