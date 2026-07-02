'use client'
import { create } from 'zustand'

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskTag { id: string; name: string; color: string }

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeId: string | null
  teamId: string | null
  createdAt: string
  updatedAt: string
  tags: TaskTag[]
}

interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (data: Partial<Task>) => Promise<Task | null>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/api/tasks')
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json()
      set({ tasks: data.tasks ?? [], loading: false })
    } catch {
      set({ error: 'Failed to load tasks', loading: false })
    }
  },

  createTask: async (data) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) return null
      const { task } = await res.json()
      set((s) => ({ tasks: [task, ...s.tasks] }))
      return task
    } catch {
      return null
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) return
      const { task } = await res.json()
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }))
    } catch { /* silent */ }
  },

  deleteTask: async (id) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    } catch { /* silent */ }
  },
}))
