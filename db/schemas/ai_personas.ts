import { pgTable, uuid, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

export const aiPersonas = pgTable('ai_personas', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:         text('name').notNull(),
  role:         text('role').notNull(),          // e.g. "Script Writer", "SEO Assistant"
  emoji:        text('emoji').default('🤖'),
  systemPrompt: text('system_prompt').notNull(),
  model:        text('model').default('gpt-4o-mini'),
  temperature:  text('temperature').default('0.7'),
  tools:        jsonb('tools').$type<string[]>().default([]),
  isDefault:    boolean('is_default').default(false),
  isPublic:     boolean('is_public').default(false),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})

export type AiPersona    = typeof aiPersonas.$inferSelect
export type NewAiPersona = typeof aiPersonas.$inferInsert
