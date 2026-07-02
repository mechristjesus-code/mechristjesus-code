import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const memoryLayerEnum = pgEnum('memory_layer', ['short_term', 'project', 'creator', 'knowledge'])

export const aiMemory = pgTable('ai_memory', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id'),
  layer:     memoryLayerEnum('layer').default('short_term').notNull(),
  key:       text('key').notNull(),
  value:     text('value').notNull(),
  embedding: jsonb('embedding').$type<number[]>(),
  metadata:  jsonb('metadata').$type<Record<string,unknown>>().default({}),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const aiChatHistory = pgTable('ai_chat_history', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  personaId:  uuid('persona_id'),
  projectId:  uuid('project_id'),
  role:       text('role').notNull(),   // 'user' | 'assistant' | 'system'
  content:    text('content').notNull(),
  model:      text('model'),
  tokens:     jsonb('tokens').$type<{prompt:number;completion:number}>(),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
})

export type AiMemory       = typeof aiMemory.$inferSelect
export type AiChatHistory  = typeof aiChatHistory.$inferSelect
