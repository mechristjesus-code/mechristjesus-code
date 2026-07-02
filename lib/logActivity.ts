import { db } from '@/db'
import { activityLog } from '@/db/schemas/activity'

export async function logActivity(
  userId: string,
  action: string,
  detail?: string,
  taskId?: string
) {
  try {
    await db.insert(activityLog).values({ userId, action, detail, taskId: taskId ?? null })
  } catch {
    // non-critical — swallow
  }
}
