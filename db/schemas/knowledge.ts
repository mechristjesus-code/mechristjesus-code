import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const knowledgeTypeEnum = pgEnum('knowledge_type', ['document', 'note', 'website', 'prompt', 'research', 'template'])

export const knowledgeDocs = pgTable('knowledge_docs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:      knowledgeTypeEnum('type').default('note').notNull(),
  title:     text('title').notNull(),
  content:   text('content').notNull(),
  sourceUrl: text('source_url'),
  tags:      jsonb('tags').$type<string[]>().default([]),
  isPublic:  text('is_public').default('false'),
  metadata:  jsonb('metadata').$type<Record<string,unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type KnowledgeDoc    = typeof knowledgeDocs.$inferSelect
export type NewKnowledgeDoc = typeof knowledgeDocs.$inferInsert
