import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { tasks } from './tasks'

export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  detail: text('detail'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ActivityEntry = typeof activityLog.$inferSelect
