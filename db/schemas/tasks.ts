import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'
// teams imported lazily to avoid circular — teamId stored as plain uuid ref

export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done'])
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high'])

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo').notNull(),
  priority: taskPriorityEnum('priority').default('medium').notNull(),
  dueDate: timestamp('due_date'),
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  teamId: uuid('team_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
