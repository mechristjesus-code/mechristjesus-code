import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

// Core Creator DNA profile — one per user
export const creatorDna = pgTable('creator_dna', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  // Writing & voice
  writingStyle:    text('writing_style').default('conversational'),
  speakingStyle:   text('speaking_style').default('casual'),
  brandVoice:      text('brand_voice'),
  vocabulary:      jsonb('vocabulary').$type<string[]>().default([]),
  avoidWords:      jsonb('avoid_words').$type<string[]>().default([]),
  // Visual & brand
  brandColors:     jsonb('brand_colors').$type<string[]>().default([]),
  visualStyle:     text('visual_style').default('modern'),
  // Content preferences
  contentGoals:    jsonb('content_goals').$type<string[]>().default([]),
  targetAudience:  text('target_audience'),
  niche:           text('niche'),
  // AI learning
  reviewHistory:   jsonb('review_history').$type<Record<string,unknown>[]>().default([]),
  favPrompts:      jsonb('fav_prompts').$type<string[]>().default([]),
  editingRules:    jsonb('editing_rules').$type<string[]>().default([]),
  // Meta
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().notNull(),
})

export type CreatorDna    = typeof creatorDna.$inferSelect
export type NewCreatorDna = typeof creatorDna.$inferInsert
