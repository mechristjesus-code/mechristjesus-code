/**
 * Prompt Engine — assembles DNA-aware prompts for any workflow
 */
import { dnaToPromptFragment, type DnaProfile } from './dna'

export type WorkflowType =
  | 'youtube_script'
  | 'youtube_title'
  | 'youtube_description'
  | 'hashtags'
  | 'chat'
  | 'research'
  | 'thumbnail_concept'
  | 'social_caption'

interface PromptContext {
  dna:       DnaProfile
  workflow:  WorkflowType
  userInput: string
  transcript?: string
  projectTitle?: string
  memories?: { key: string; value: string }[]
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const parts: string[] = []

  // 1. Persona base
  parts.push(`You are an expert AI assistant specialized in content creation.`)

  // 2. DNA fragment
  parts.push(dnaToPromptFragment(ctx.dna))

  // 3. Memory context
  if (ctx.memories?.length) {
    parts.push('\n## Recent context from memory')
    for (const m of ctx.memories) parts.push(`- ${m.key}: ${m.value}`)
  }

  // 4. Workflow-specific instructions
  parts.push('\n## Task instructions')
  switch (ctx.workflow) {
    case 'youtube_script':
      parts.push(
        'Write an original YouTube video script based on the transcript/topic provided.',
        'Structure: Hook (0–30s), Main content (sections), CTA at end.',
        'Match the creator\'s writing style exactly.',
        'Do NOT copy phrases from the source — rewrite everything in the creator\'s voice.',
      )
      break
    case 'youtube_title':
      parts.push(
        'Generate 5 YouTube video titles. Rules:',
        '- Under 70 characters each',
        '- High click-through potential',
        '- Curiosity gap or clear value proposition',
        '- Match creator\'s brand voice',
        'Return as a numbered list only.',
      )
      break
    case 'youtube_description':
      parts.push(
        'Write a YouTube video description.',
        'Structure: Hook sentence, 2–3 paragraph summary, timestamps placeholder, links section.',
        'SEO-optimised but natural sounding.',
        'Max 500 words.',
      )
      break
    case 'hashtags':
      parts.push(
        'Generate 20 relevant hashtags for the content.',
        'Mix: 5 niche-specific, 10 topic-specific, 5 broad reach.',
        'Return as space-separated #hashtags only.',
      )
      break
    case 'thumbnail_concept':
      parts.push(
        'Describe a compelling thumbnail concept.',
        'Include: main text overlay, background scene, color scheme, emotion/expression.',
        'Keep it actionable for a designer.',
      )
      break
    case 'social_caption':
      parts.push(
        'Write a short social media caption (Instagram/TikTok).',
        'Max 2–3 sentences + call to action.',
        'Add 3–5 inline emoji where natural.',
      )
      break
    case 'research':
      parts.push('Research and summarise the topic clearly and concisely. Cite key points.')
      break
    case 'chat':
      parts.push('Answer the user\'s question helpfully, using their Creator DNA profile for style.')
      break
  }

  if (ctx.transcript) {
    parts.push(`\n## Source transcript / content\n${ctx.transcript.slice(0, 4000)}`)
  }

  return parts.join('\n\n')
}

export function buildUserMessage(ctx: PromptContext): string {
  return ctx.userInput
}
