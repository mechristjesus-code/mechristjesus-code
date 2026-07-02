'use client'
import { create } from 'zustand'

export interface Tag { id: string; userId: string; name: string; color: string; createdAt: string }

interface TagState {
  tags: Tag[]
  fetchTags: () => Promise<void>
  createTag: (name: string, color: string) => Promise<Tag | null>
  deleteTag: (id: string) => Promise<void>
  assignTag: (tagId: string, taskId: string, assign: boolean) => Promise<void>
}

export const useTagStore = create<TagState>()((set) => ({
  tags: [],
  fetchTags: async () => {
    const res = await fetch('/api/tags')
    if (!res.ok) return
    const { tags } = await res.json()
    set({ tags })
  },
  createTag: async (name, color) => {
    const res = await fetch('/api/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) })
    if (!res.ok) return null
    const { tag } = await res.json()
    set((s) => ({ tags: [...s.tags, tag] }))
    return tag
  },
  deleteTag: async (id) => {
    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }))
  },
  assignTag: async (tagId, taskId, assign) => {
    await fetch(`/api/tags/${tagId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, assign }) })
  },
}))
