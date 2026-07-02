/**
 * Creator DNA Engine
 * Reads / builds the user's DNA profile to inject into AI prompts.
 */
import 'server-only'
import { db } from '@/db'
import { creatorDna } from '@/db/schemas/creator_dna'
import { eq } from 'drizzle-orm'

export type DnaProfile = typeof creatorDna.$inferSelect

/** Fetch or create a default DNA profile for a user */
export async function getDna(userId: string): Promise<DnaProfile> {
  const [existing] = await db.select().from(creatorDna).where(eq(creatorDna.userId, userId)).limit(1)
  if (existing) return existing
  const [created] = await db.insert(creatorDna).values({ userId }).returning()
  return created
}

/** Persist partial DNA updates */
export async function updateDna(userId: string, patch: Partial<Omit<DnaProfile, 'id' | 'userId' | 'createdAt'>>) {
  const [row] = await db
    .update(creatorDna)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(creatorDna.userId, userId))
    .returning()
  return row
}

/**
 * Convert a DNA profile into a concise system-prompt fragment
 * that any AI persona can prepend to its instructions.
 */
export function dnaToPromptFragment(dna: DnaProfile): string {
  const lines: string[] = ['## Creator DNA — user preferences']
  if (dna.niche)           lines.push(`- Niche / topic area: ${dna.niche}`)
  if (dna.brandVoice)      lines.push(`- Brand voice: ${dna.brandVoice}`)
  if (dna.writingStyle)    lines.push(`- Writing style: ${dna.writingStyle}`)
  if (dna.speakingStyle)   lines.push(`- Speaking style: ${dna.speakingStyle}`)
  if (dna.targetAudience)  lines.push(`- Target audience: ${dna.targetAudience}`)
  const vocab = (dna.vocabulary as string[]) ?? []
  if (vocab.length)        lines.push(`- Preferred vocabulary: ${vocab.join(', ')}`)
  const avoid = (dna.avoidWords as string[]) ?? []
  if (avoid.length)        lines.push(`- Words/phrases to AVOID: ${avoid.join(', ')}`)
  const goals = (dna.contentGoals as string[]) ?? []
  if (goals.length)        lines.push(`- Content goals: ${goals.join(', ')}`)
  const rules = (dna.editingRules as string[]) ?? []
  if (rules.length)        lines.push(`- Editing rules: ${rules.join('; ')}`)
  lines.push('Always match this style unless the user explicitly asks otherwise.')
  return lines.join('\n')
}
