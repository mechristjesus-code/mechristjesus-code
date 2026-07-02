import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const projectStatusEnum = pgEnum('project_status', ['draft', 'in_progress', 'complete', 'archived'])
export const projectTypeEnum   = pgEnum('project_type',   ['youtube', 'tiktok', 'instagram', 'blog', 'podcast', 'custom'])

export const creatorProjects = pgTable('creator_projects', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:        text('title').notNull(),
  type:         projectTypeEnum('type').default('youtube').notNull(),
  status:       projectStatusEnum('status').default('draft').notNull(),
  sourceUrl:    text('source_url'),
  transcript:   text('transcript'),
  generatedScript: text('generated_script'),
  generatedTitle:  text('generated_title'),
  generatedDesc:   text('generated_desc'),
  hashtags:     jsonb('hashtags').$type<string[]>().default([]),
  notes:        text('notes'),
  exports:      jsonb('exports').$type<Record<string,string>[]>().default([]),
  metadata:     jsonb('metadata').$type<Record<string,unknown>>().default({}),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})

export type CreatorProject    = typeof creatorProjects.$inferSelect
export type NewCreatorProject = typeof creatorProjects.$inferInsert
