/**
 * AI Router — routes requests to the configured LLM
 * Uses the BTY gateway (OpenAI-compatible) via HAPPYSEEDS_KEY
 */
import 'server-only'

const BASE_URL  = process.env.LLM_BASE_URL  || 'https://api.openai.com/v1'
const API_KEY   = process.env.LLM_API_KEY   || process.env.HAPPYSEEDS_KEY || ''
const DEFAULT_MODEL = 'gpt-4o-mini'

export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }

export interface RouterOptions {
  model?:       string
  temperature?: number
  maxTokens?:   number
  stream?:      boolean
}

/** Non-streaming completion — returns full text */
export async function complete(
  messages: ChatMessage[],
  opts: RouterOptions = {},
): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model:       opts.model       ?? DEFAULT_MODEL,
      temperature: opts.temperature ?? 0.7,
      max_tokens:  opts.maxTokens   ?? 2048,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI router error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

/** Streaming completion — returns ReadableStream for SSE */
export async function stream(
  messages: ChatMessage[],
  opts: RouterOptions = {},
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model:       opts.model       ?? DEFAULT_MODEL,
      temperature: opts.temperature ?? 0.7,
      max_tokens:  opts.maxTokens   ?? 2048,
      stream:      true,
      messages,
    }),
  })

  if (!res.ok) throw new Error(`AI stream error ${res.status}`)
  return res.body!
}

/** YouTube transcript extraction via youtube-transcript-api (public) */
export async function fetchYouTubeTranscript(url: string): Promise<string> {
  try {
    // Extract video ID from any YouTube URL format
    const match = url.match(/(?:v=|\/shorts\/|youtu\.be\/)([\w-]{11})/)
    if (!match) throw new Error('Could not extract video ID from URL')
    const videoId = match[1]

    // Use the public youtubetranscript.com API
    const r = await fetch(
      `https://api.youtubetranscript.com/?videoID=${videoId}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!r.ok) throw new Error(`Transcript fetch failed: ${r.status}`)
    const data = await r.json()

    if (Array.isArray(data)) {
      return data.map((s: { text: string }) => s.text).join(' ')
    }
    throw new Error('Unexpected transcript format')
  } catch {
    return '' // gracefully return empty — caller handles
  }
}
