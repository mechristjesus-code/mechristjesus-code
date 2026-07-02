/**
 * Memory Engine — four-layer memory system
 * short_term → project → creator → knowledge
 */
import 'server-only'
import { db } from '@/db'
import { aiMemory, aiChatHistory } from '@/db/schemas/ai_memory'
import { eq, and, desc, gte } from 'drizzle-orm'

export type MemoryLayer = 'short_term' | 'project' | 'creator' | 'knowledge'

/** Write a memory entry */
export async function rememberFact(
  userId: string,
  key: string,
  value: string,
  layer: MemoryLayer = 'short_term',
  projectId?: string,
  ttlHours?: number,
) {
  const expiresAt = ttlHours ? new Date(Date.now() + ttlHours * 3600_000) : undefined
  await db.insert(aiMemory).values({ userId, key, value, layer, projectId, expiresAt })
}

/** Read recent memories for context injection */
export async function recallMemory(
  userId: string,
  layer: MemoryLayer,
  limit = 20,
  projectId?: string,
): Promise<{ key: string; value: string }[]> {
  const now = new Date()
  const rows = await db
    .select({ key: aiMemory.key, value: aiMemory.value })
    .from(aiMemory)
    .where(
      and(
        eq(aiMemory.userId, userId),
        eq(aiMemory.layer, layer),
        projectId ? eq(aiMemory.projectId, projectId) : undefined,
        // exclude expired
        gte(aiMemory.expiresAt, now),
      )
    )
    .orderBy(desc(aiMemory.createdAt))
    .limit(limit)
  return rows
}

/** Save a chat message */
export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  personaId?: string,
  projectId?: string,
  model?: string,
) {
  await db.insert(aiChatHistory).values({ userId, role, content, personaId, projectId, model })
}

/** Load recent chat history for context window */
export async function getChatHistory(
  userId: string,
  limit = 20,
  projectId?: string,
): Promise<{ role: string; content: string }[]> {
  const rows = await db
    .select({ role: aiChatHistory.role, content: aiChatHistory.content })
    .from(aiChatHistory)
    .where(
      and(
        eq(aiChatHistory.userId, userId),
        projectId ? eq(aiChatHistory.projectId, projectId) : undefined,
      )
    )
    .orderBy(desc(aiChatHistory.createdAt))
    .limit(limit)
  return rows.reverse() // chronological order
}
