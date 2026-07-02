'use client'
import { create } from 'zustand'

export interface Team { id: string; name: string; ownerId: string; inviteCode: string; createdAt: string }
export interface TeamMember { id: string; userId: string; username: string; email: string; role: string; joinedAt: string }

interface TeamState {
  teams: Team[]
  members: Record<string, TeamMember[]>
  fetchTeams: () => Promise<void>
  createTeam: (name: string) => Promise<Team | null>
  joinTeam: (code: string) => Promise<Team | null>
  fetchMembers: (teamId: string) => Promise<void>
}

export const useTeamStore = create<TeamState>()((set) => ({
  teams: [],
  members: {},
  fetchTeams: async () => {
    const res = await fetch('/api/teams')
    if (!res.ok) return
    const { teams } = await res.json()
    set({ teams })
  },
  createTeam: async (name) => {
    const res = await fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    if (!res.ok) return null
    const { team } = await res.json()
    set((s) => ({ teams: [...s.teams, team] }))
    return team
  },
  joinTeam: async (code) => {
    const res = await fetch('/api/teams/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteCode: code }) })
    if (!res.ok) return null
    const { team } = await res.json()
    set((s) => ({ teams: [...s.teams.filter((t) => t.id !== team.id), team] }))
    return team
  },
  fetchMembers: async (teamId) => {
    const res = await fetch(`/api/teams/${teamId}/members`)
    if (!res.ok) return
    const { members } = await res.json()
    set((s) => ({ members: { ...s.members, [teamId]: members } }))
  },
}))
