'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore, Task, TaskStatus, TaskPriority } from '@/store/taskStore'
import { useTagStore, Tag } from '@/store/tagStore'
import { useTeamStore } from '@/store/teamStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useToast } from '@/components/Toast'
import {
  CheckSquare, Plus, LogOut, User, Trash2, Pencil, X, Check,
  Clock, Circle, ChevronDown, Calendar, BarChart2, Users,
  Activity, Tag as TagIcon, Search, LayoutGrid, List, Copy,
  AlertCircle, ChevronRight, ArrowUpDown, Flame, Timer,
  ClipboardList, Star, Settings, Menu, ChevronUp,
} from 'lucide-react'

// ─── QuickAddBar ─────────────────────────────────────────────────────────────
function QuickAddBar() {
  const { createTask } = useTaskStore()
  const { toast } = useToast()
  const [title,  setTitle]  = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!title.trim()) return
    setSaving(true)
    const t = await createTask({ title: title.trim(), priority: 'medium', status: 'todo' })
    setSaving(false); setTitle('')
    if (t) toast('success', 'Task created', t.title)
  }
  return (
    <form onSubmit={submit} className="flex items-center gap-2 mb-5">
      <div className="flex-1 relative">
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-3)' }} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quick add — press Enter to save" className="input-base pl-9 w-full" />
      </div>
      <button type="submit" disabled={saving || !title.trim()} className="btn-primary px-4 py-2 rounded-lg shrink-0">
        {saving ? <Spinner size={14} /> : <Plus className="w-4 h-4" />} Add
      </button>
    </form>
  )
}

// ─── CreateTaskModal ──────────────────────────────────────────────────────────
function CreateTaskModal({ onClose }: { onClose: () => void }) {
  const { createTask } = useTaskStore()
  const { teams }      = useTeamStore()
  const { toast }      = useToast()
  const [title,    setTitle]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate,  setDueDate]  = useState('')
  const [teamId,   setTeamId]   = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!title.trim()) return
    setSaving(true)
    const task = await createTask({ title: title.trim(), description: desc || null, priority, dueDate: dueDate || null, teamId: teamId || null })
    setSaving(false)
    if (!task) { setError('Failed to create task'); return }
    toast('success', 'Task created', task.title)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card w-full max-w-md shadow-2xl p-6 anim-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>New Task</h2>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 rounded-lg flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus placeholder="What needs to be done?" className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Add details (optional)" className="input-base resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Priority</label>
              <div className="relative">
                <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="input-base appearance-none pr-8">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-3)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-base" />
            </div>
          </div>
          {teams.length > 0 && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Team</label>
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="input-base">
                <option value="">Personal</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          {error && <p className="text-sm" style={{ color: 'var(--high-fg)' }}>{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5 justify-center rounded-lg">Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} className="btn-primary flex-1 py-2.5 rounded-lg justify-center">
              {saving ? <Spinner size={14} /> : <Plus className="w-4 h-4" />} {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── ActivityTab ──────────────────────────────────────────────────────────────
function ActivityTab() {
  type Entry = { id: string; action: string; detail: string | null; createdAt: string; taskTitle: string | null }
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<string>('all')

  useEffect(() => {
    fetch('/api/activity').then((r) => r.json()).then((d) => { setEntries(d.activity ?? []); setLoading(false) })
  }, [])

  const actionMeta: Record<string, { emoji: string; label: string; color: string }> = {
    task_created: { emoji: '✅', label: 'Created',  color: 'var(--done-fg)' },
    task_updated: { emoji: '✏️', label: 'Updated',  color: 'var(--brand)'   },
    task_deleted: { emoji: '🗑️', label: 'Deleted',  color: 'var(--high-fg)' },
  }

  const actionTypes = ['all', ...Object.keys(actionMeta)]
  const visible = filter === 'all' ? entries : entries.filter((e) => e.action === filter)

  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>

  return (
    <div className="max-w-2xl space-y-4">
      {/* Filter chips */}
      <div className="flex gap-1 flex-wrap">
        {actionTypes.map((a) => (
          <button key={a} onClick={() => setFilter(a)}
            className="text-xs px-3 py-1 rounded-full border transition font-medium"
            style={{ background: filter === a ? 'var(--brand)' : 'var(--surface-2)', color: filter === a ? '#fff' : 'var(--text-2)', borderColor: filter === a ? 'var(--brand)' : 'var(--border-color)' }}>
            {a === 'all' ? 'All' : (actionMeta[a]?.label ?? a)}
          </button>
        ))}
      </div>

      {!visible.length && (
        <div className="text-center py-16">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>No activity yet.</p>
        </div>
      )}

      {visible.map((e) => {
        const meta = actionMeta[e.action] ?? { emoji: '📌', label: e.action, color: 'var(--text-2)' }
        return (
          <div key={e.id} className="card flex items-start gap-3 px-4 py-3 anim-fade-up">
            <span className="text-lg mt-0.5 shrink-0">{meta.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{relativeTime(e.createdAt)}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{e.detail ?? e.action}</p>
              {e.taskTitle && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>Task: {e.taskTitle}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── TeamsTab ─────────────────────────────────────────────────────────────────
function TeamsTab() {
  const { teams, fetchTeams, createTeam, joinTeam, fetchMembers, members } = useTeamStore()
  const { toast } = useToast()
  const [newName,  setNewName]  = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [joining,  setJoining]  = useState(false)
  const [error,    setError]    = useState('')
  const [copied,   setCopied]   = useState<string | null>(null)

  useEffect(() => { fetchTeams() }, [fetchTeams])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setCreating(true)
    const t = await createTeam(newName); setNewName(''); setCreating(false)
    if (t) toast('success', `Team "${t.name}" created`, `Invite code: ${t.inviteCode}`)
  }
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setJoining(true)
    const t = await joinTeam(joinCode)
    if (!t) setError('Invalid invite code'); else toast('success', `Joined "${t.name}"`)
    setJoinCode(''); setJoining(false)
  }
  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id); if (!members[id]) await fetchMembers(id)
  }
  const copy = (code: string) => {
    navigator.clipboard.writeText(code); setCopied(code)
    toast('info', 'Invite code copied!'); setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form onSubmit={handleCreate} className="card p-4 space-y-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Create a team</p>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Team name" className="input-base text-sm" />
          <button type="submit" disabled={creating || !newName.trim()} className="btn-primary w-full py-2 rounded-lg justify-center text-sm">
            {creating ? <Spinner size={14} /> : <Plus className="w-4 h-4" />} Create
          </button>
        </form>
        <form onSubmit={handleJoin} className="card p-4 space-y-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Join a team</p>
          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Invite code e.g. AB12CD34" className="input-base text-sm uppercase" />
          <button type="submit" disabled={joining || !joinCode.trim()} className="btn-primary w-full py-2 rounded-lg justify-center text-sm" style={{ background: '#8b5cf6' }}>
            {joining ? <Spinner size={14} /> : <Users className="w-4 h-4" />} Join
          </button>
        </form>
      </div>
      {error && <p className="text-sm anim-fade-in" style={{ color: 'var(--high-fg)' }}>{error}</p>}
      {!teams.length && <p className="text-sm" style={{ color: 'var(--text-2)' }}>No teams yet.</p>}
      {teams.map((team) => (
        <div key={team.id} className="card overflow-hidden anim-fade-up">
          <button onClick={() => toggleExpand(team.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)] transition">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#8b5cf620', border: '1px solid #8b5cf640' }}>
              <Users className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{members[team.id]?.length ?? '…'} members</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); copy(team.inviteCode) }}
              className="btn-ghost text-xs px-2 py-1 rounded flex items-center gap-1.5">
              <Copy className="w-3 h-3" />{copied === team.inviteCode ? 'Copied!' : team.inviteCode}
            </button>
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded === team.id ? 'rotate-90' : ''}`} style={{ color: 'var(--text-3)' }} />
          </button>
          {expanded === team.id && (
            <div className="px-4 py-3 space-y-2 anim-fade-in" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--surface-2)' }}>
              {(members[team.id] ?? []).map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand)' }}>{m.username[0].toUpperCase()}</div>
                  <span style={{ color: 'var(--foreground)' }}>{m.username}</span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{m.email}</span>
                  <span className="ml-auto text-xs capitalize" style={{ color: 'var(--text-3)' }}>{m.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── TagsTab ──────────────────────────────────────────────────────────────────
const TAG_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6','#f97316']

function TagsTab() {
  const { tags, fetchTags, createTag, deleteTag } = useTagStore()
  const { toast } = useToast()
  const [name,     setName]     = useState('')
  const [color,    setColor]    = useState(TAG_COLORS[0])
  const [creating, setCreating] = useState(false)
  useEffect(() => { fetchTags() }, [fetchTags])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return
    setCreating(true); const t = await createTag(name.trim(), color); setName(''); setCreating(false)
    if (t) toast('success', `Tag "${t.name}" created`)
  }
  return (
    <div className="space-y-5 max-w-lg">
      <form onSubmit={submit} className="card p-5 space-y-4">
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Create a tag</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name" className="input-base" />
        <div className="flex gap-2 flex-wrap">
          {TAG_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110"
              style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {name && <TagBadge tag={{ id: 'preview', name, color }} />}
          <button type="submit" disabled={creating || !name.trim()} className="btn-primary px-4 py-2 rounded-lg text-sm ml-auto">
            {creating ? <Spinner size={14} /> : <Plus className="w-4 h-4" />} Create
          </button>
        </div>
      </form>
      <div className="space-y-2">
        {!tags.length && <p className="text-sm" style={{ color: 'var(--text-2)' }}>No tags yet.</p>}
        {tags.map((tag) => (
          <div key={tag.id} className="card flex items-center justify-between px-4 py-2.5 anim-fade-up">
            <TagBadge tag={tag} />
            <button onClick={() => { deleteTag(tag.id); toast('info', `Tag "${tag.name}" deleted`) }} className="btn-ghost w-7 h-7 p-0 rounded flex items-center justify-center hover:!text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DashboardPage ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { user, logout }               = useAuthStore()
  const { tasks, loading, fetchTasks } = useTaskStore()
  const { fetchTags }                  = useTagStore()
  const { fetchTeams }                 = useTeamStore()

  const [showCreate,    setShowCreate]    = useState(false)
  const [filter,        setFilter]        = useState<TaskStatus | 'all'>('all')
  const [search,        setSearch]        = useState('')
  const [priFilter,     setPriFilter]     = useState<TaskPriority | 'all'>('all')
  const [view,          setView]          = useState<ViewMode>('list')
  const [tab,           setTab]           = useState<TabKey>('tasks')
  const [sortBy,        setSortBy]        = useState<SortKey>('created')
  const [sortAsc,       setSortAsc]       = useState(false)
  const [bulkSelected,  setBulkSelected]  = useState<Set<string>>(new Set())
  const [sidebarOpen,   setSidebarOpen]   = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchTasks(); fetchTags(); fetchTeams()
  }, [user, router, fetchTasks, fetchTags, fetchTeams])

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false
      if (priFilter !== 'all' && t.priority !== priFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q)
      }
      return true
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'title')    cmp = a.title.localeCompare(b.title)
      else if (sortBy === 'priority') cmp = PRI_CFG[b.priority].order - PRI_CFG[a.priority].order
      else if (sortBy === 'due') cmp = (a.dueDate ?? '9') < (b.dueDate ?? '9') ? -1 : 1
      else cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return sortAsc ? -cmp : cmp
    })
    return list
  }, [tasks, filter, priFilter, search, sortBy, sortAsc])

  const stats = {
    total:       tasks.length,
    todo:        tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done:        tasks.filter((t) => t.status === 'done').length,
  }
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const overdue = tasks.filter((t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date()).length

  const allBulkSelected = filtered.length > 0 && filtered.every((t) => bulkSelected.has(t.id))
  const toggleBulkAll = () => {
    if (allBulkSelected) setBulkSelected(new Set())
    else setBulkSelected(new Set(filtered.map((t) => t.id)))
  }

  if (!user) return null

  const navItems: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'tasks',    label: 'Tasks',    icon: <ClipboardList className="w-4 h-4" />, count: tasks.length },
    { key: 'activity', label: 'Activity', icon: <Activity      className="w-4 h-4" /> },
    { key: 'teams',    label: 'Teams',    icon: <Users         className="w-4 h-4" /> },
    { key: 'tags',     label: 'Tags',     icon: <TagIcon       className="w-4 h-4" /> },
  ]

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <aside className="sidebar hidden sm:flex">
          <div className="sidebar-logo">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--brand-muted)', border: '1px solid var(--brand-border)' }}>
              <CheckSquare className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>TaskFlow</span>
          </div>

          <div className="sidebar-section mt-1">
            <p className="sidebar-label">Workspace</p>
            {navItems.map((item) => (
              <button key={item.key} onClick={() => setTab(item.key)}
                className={`sidebar-item ${tab === item.key ? 'active' : ''}`}>
                {item.icon}
                {item.label}
                {item.count !== undefined && item.count > 0 && (
                  <span className="badge">{item.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="sidebar-section mt-3">
            <p className="sidebar-label">Quick stats</p>
            {overdue > 0 && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-1" style={{ background: 'rgba(220,38,38,0.08)' }}>
                <Flame className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--high-fg)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--high-fg)' }}>{overdue} overdue</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-2.5 py-1.5">
              <Timer className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--prog-fg)' }} />
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>{stats.in_progress} in progress</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5">
              <Star className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--done-fg)' }} />
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>{pct}% complete</span>
            </div>
          </div>

          <div className="sidebar-section mt-3">
            <p className="sidebar-label">Navigate</p>
            <a href="/analytics" className="sidebar-item">
              <BarChart2 className="w-4 h-4" /> Analytics
            </a>
            <button className="sidebar-item">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'var(--brand)' }}>
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{user.username}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{user.email}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <ThemeToggle />
              <button onClick={logout} className="btn-ghost text-xs flex-1 justify-center py-1.5">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── Main area ── */}
      <div className="main-area">
        {/* Topbar */}
        <div className="main-topbar">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((v) => !v)} className="btn-ghost w-8 h-8 p-0 rounded-lg flex items-center justify-center">
              <Menu className="w-4 h-4" />
            </button>
            <div className="sm:hidden flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-muted)', border: '1px solid var(--brand-border)' }}>
                <CheckSquare className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
              </div>
              <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>TaskFlow</span>
            </div>
            <h1 className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--foreground)' }}>
              {navItems.find((n) => n.key === tab)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile nav */}
            <div className="flex sm:hidden gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--surface-2)' }}>
              {navItems.map((n) => (
                <button key={n.key} onClick={() => setTab(n.key)} className="p-1.5 rounded-md transition"
                  style={{ background: tab === n.key ? 'var(--surface)' : 'transparent', color: tab === n.key ? 'var(--brand)' : 'var(--text-2)' }}>
                  {n.icon}
                </button>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>{user.username}</span>
            </div>
            <a href="/analytics" className="btn-ghost text-xs sm:hidden">
              <BarChart2 className="w-3.5 h-3.5" />
            </a>
            <div className="sm:hidden"><ThemeToggle /></div>
          </div>
        </div>

        {/* Content */}
        <div className="main-content">
          {/* ── Tasks ── */}
          {tab === 'tasks' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total',       value: stats.total,       sub: `${pct}% done`,  icon: <CheckSquare className="w-4 h-4" />, accent: 'var(--brand)'   },
                  { label: 'To Do',       value: stats.todo,        sub: 'not started',   icon: <Circle      className="w-4 h-4" />, accent: 'var(--todo-fg)' },
                  { label: 'In Progress', value: stats.in_progress, sub: 'active',        icon: <Clock       className="w-4 h-4" />, accent: 'var(--prog-fg)' },
                  { label: 'Completed',   value: stats.done,        sub: 'finished',      icon: <Check       className="w-4 h-4" />, accent: 'var(--done-fg)' },
                ].map((s) => (
                  <div key={s.label} className="card p-4 anim-fade-up">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
                      <span style={{ color: s.accent }}>{s.icon}</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {stats.total > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-2)' }}>Overall progress</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--done-fg)' }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, var(--brand), var(--done-fg))` }} />
                  </div>
                </div>
              )}

              <QuickAddBar />

              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="input-base pl-8 w-40 text-xs py-1.5" />
                  </div>
                  <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                    {(['all', ...STATUS_CYCLE] as const).map((f) => (
                      <button key={f} onClick={() => setFilter(f)} className="px-2.5 py-1 text-xs rounded-md font-medium transition"
                        style={{ background: filter === f ? 'var(--brand)' : 'transparent', color: filter === f ? '#fff' : 'var(--text-2)' }}>
                        {f === 'all' ? 'All' : STATUS_CFG[f].label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                    {(['all', 'low', 'medium', 'high'] as const).map((p) => (
                      <button key={p} onClick={() => setPriFilter(p)} className="px-2.5 py-1 text-xs rounded-md font-medium transition"
                        style={{ background: priFilter === p ? 'var(--brand)' : 'transparent', color: priFilter === p ? '#fff' : 'var(--text-2)' }}>
                        {p === 'all' ? 'Any' : p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <div className="relative">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
                      className="input-base text-xs py-1.5 pl-2 pr-6 appearance-none w-28">
                      <option value="created">Newest</option>
                      <option value="due">Due date</option>
                      <option value="priority">Priority</option>
                      <option value="title">A–Z</option>
                    </select>
                    <ArrowUpDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-3)' }} />
                  </div>
                  {/* View */}
                  <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                    <button onClick={() => setView('list')}   className="p-1.5 rounded-md transition" style={{ background: view === 'list'   ? 'var(--surface)' : 'transparent', color: 'var(--text-2)' }}><List       className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setView('kanban')} className="p-1.5 rounded-md transition" style={{ background: view === 'kanban' ? 'var(--surface)' : 'transparent', color: 'var(--text-2)' }}><LayoutGrid className="w-3.5 h-3.5" /></button>
                  </div>
                  <button onClick={() => setShowCreate(true)} className="btn-primary text-xs px-3 py-1.5 rounded-lg">
                    <Plus className="w-3.5 h-3.5" /> New Task
                  </button>
                </div>
              </div>

              {/* Bulk bar */}
              {bulkSelected.size > 0 && (
                <div className="card flex items-center gap-3 px-4 py-2.5 mb-4 anim-slide-in" style={{ borderColor: 'var(--brand-border)', background: 'var(--brand-muted)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>{bulkSelected.size} selected</span>
                  <button onClick={async () => {
                    const ids = [...bulkSelected]
                    for (const id of ids) await useTaskStore.getState().updateTask(id, { status: 'done' })
                    setBulkSelected(new Set())
                  }} className="btn-primary text-xs px-3 py-1 rounded">
                    <Check className="w-3 h-3" /> Mark done
                  </button>
                  <button onClick={async () => {
                    const ids = [...bulkSelected]
                    for (const id of ids) await useTaskStore.getState().deleteTask(id)
                    setBulkSelected(new Set())
                  }} className="btn-ghost text-xs px-3 py-1 rounded hover:!text-red-400">
                    <Trash2 className="w-3 h-3" /> Delete all
                  </button>
                  <button onClick={() => setBulkSelected(new Set())} className="ml-auto btn-ghost w-6 h-6 p-0 rounded flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Select all */}
              {view === 'list' && filtered.length > 0 && (
                <div className="flex items-center gap-2 mb-2 px-4 py-1">
                  <input type="checkbox" checked={allBulkSelected} onChange={toggleBulkAll} className="accent-[var(--brand)] cursor-pointer" />
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>Select all ({filtered.length})</span>
                </div>
              )}

              {/* Task content */}
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 w-full" style={{ animationDelay: `${i * 0.08}s` }} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 anim-fade-in">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-2)' }}>
                    <AlertCircle className="w-8 h-8" style={{ color: 'var(--text-3)' }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                    {search || filter !== 'all' || priFilter !== 'all' ? 'No matching tasks' : 'No tasks yet'}
                  </p>
                  <p className="text-xs mb-5" style={{ color: 'var(--text-2)' }}>
                    {search || filter !== 'all' || priFilter !== 'all' ? 'Try adjusting your filters.' : 'Use the quick-add bar above to create your first task.'}
                  </p>
                </div>
              ) : view === 'list' ? (
                <div className="space-y-2">
                  {filtered.map((t) => (
                    <TaskCard key={t.id} task={t}
                      bulkSelected={bulkSelected.has(t.id)}
                      onBulkToggle={() => {
                        const next = new Set(bulkSelected)
                        if (next.has(t.id)) next.delete(t.id); else next.add(t.id)
                        setBulkSelected(next)
                      }} />
                  ))}
                </div>
              ) : (
                <KanbanBoard tasks={filtered} />
              )}
            </div>
          )}

          {tab === 'activity' && <ActivityTab />}
          {tab === 'teams'    && <TeamsTab />}
          {tab === 'tags'     && <TagsTab />}
        </div>
      </div>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

// ─── types / constants ───────────────────────────────────────────────────────
export type ViewMode = 'list' | 'kanban'
export type TabKey   = 'tasks' | 'activity' | 'teams' | 'tags'
export type SortKey  = 'created' | 'due' | 'priority' | 'title'

const STATUS_CYCLE: TaskStatus[] = ['todo', 'in_progress', 'done']
const STATUS_CFG: Record<TaskStatus, { label: string; chipClass: string; icon: React.ReactNode; color: string }> = {
  todo:        { label: 'To Do',       chipClass: 'chip chip-todo', icon: <Circle className="w-3 h-3" />,  color: 'var(--todo-fg)' },
  in_progress: { label: 'In Progress', chipClass: 'chip chip-prog', icon: <Clock  className="w-3 h-3" />,  color: 'var(--prog-fg)' },
  done:        { label: 'Done',        chipClass: 'chip chip-done', icon: <Check  className="w-3 h-3" />,  color: 'var(--done-fg)' },
}
const PRI_CFG: Record<TaskPriority, { label: string; chipClass: string; dot: string; order: number }> = {
  low:    { label: 'Low',    chipClass: 'chip chip-low',    dot: 'bg-slate-400', order: 0 },
  medium: { label: 'Medium', chipClass: 'chip chip-medium', dot: 'bg-amber-400', order: 1 },
  high:   { label: 'High',   chipClass: 'chip chip-high',   dot: 'bg-red-500',   order: 2 },
}

type TagLike = Pick<Tag, 'id' | 'name' | 'color'>

// ─── helpers ─────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }: { size?: number }) {
  return <span className="inline-block rounded-full border-2 animate-spin shrink-0" style={{ width: size, height: size, borderColor: 'var(--brand-border)', borderTopColor: 'var(--brand)' }} />
}

function TagBadge({ tag, onRemove }: { tag: TagLike; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border anim-fade-in"
      style={{ borderColor: tag.color + '50', background: tag.color + '18', color: tag.color }}>
      {tag.name}
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove() }} className="ml-0.5 opacity-60 hover:opacity-100">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  )
}

function urgencyBadge(dueDate: string | null, status: TaskStatus): React.ReactNode {
  if (!dueDate || status === 'done') return null
  const due  = new Date(dueDate)
  const now  = new Date()
  const diff = (due.getTime() - now.getTime()) / 86400000
  if (diff < 0)  return <span className="badge-overdue">Overdue</span>
  if (diff < 2)  return <span className="badge-soon">Due soon</span>
  return null
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)   return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

// ─── KanbanCard + Board ───────────────────────────────────────────────────────
function KanbanCard({ task, onDragStart }: { task: Task; onDragStart: (id: string) => void }) {
  const { deleteTask } = useTaskStore()
  const { toast } = useToast()
  const pc = PRI_CFG[task.priority]
  return (
    <div draggable onDragStart={() => onDragStart(task.id)}
      className="card group p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow anim-fade-up"
      style={{ userSelect: 'none' }}>
      <div className="flex items-start gap-2 mb-2">
        <p className={`text-sm font-medium leading-snug flex-1 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
          style={{ color: 'var(--foreground)' }}>{task.title}</p>
        {urgencyBadge(task.dueDate, task.status)}
      </div>
      {task.description && <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-2)' }}>{task.description}</p>}
      <div className="flex items-center justify-between gap-2">
        <span className={pc.chipClass}><span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />{pc.label}</span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
          {task.dueDate && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{new Date(task.dueDate).toLocaleDateString()}</span>}
          <button onClick={() => { deleteTask(task.id); toast('info', 'Task deleted') }} className="hover:text-red-400 transition" style={{ color: 'var(--text-3)' }}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {(task.tags?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          {task.tags.map((t) => <TagBadge key={t.id} tag={t} />)}
        </div>
      )}
    </div>
  )
}

function KanbanColumnAddBar({ status, onAdd }: { status: TaskStatus; onAdd: (title: string) => Promise<void> }) {
  const [open,  setOpen]  = useState(false)
  const [title, setTitle] = useState('')
  const [busy,  setBusy]  = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) ref.current?.focus() }, [open])
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!title.trim()) return
    setBusy(true); await onAdd(title.trim()); setTitle(''); setBusy(false); setOpen(false)
  }
  if (!open) return (
    <button onClick={() => setOpen(true)} className="w-full flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg mt-1 transition hover:bg-[var(--surface-3)]" style={{ color: 'var(--text-3)' }}>
      <Plus className="w-3 h-3" /> Add task
    </button>
  )
  return (
    <form onSubmit={submit} className="mt-2 flex gap-1">
      <input ref={ref} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title…"
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="input-base text-xs flex-1 py-1.5" />
      <button type="submit" disabled={busy || !title.trim()} className="btn-primary px-2 py-1.5 rounded text-xs">
        {busy ? <Spinner size={12} /> : <Check className="w-3 h-3" />}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn-ghost px-2 py-1.5 rounded text-xs"><X className="w-3 h-3" /></button>
    </form>
  )
}

function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const { updateTask, createTask } = useTaskStore()
  const { toast } = useToast()
  const [dragging, setDragging] = useState<string | null>(null)
  const [over,     setOver]     = useState<TaskStatus | null>(null)

  const drop = async (col: TaskStatus) => {
    if (dragging) { await updateTask(dragging, { status: col }); toast('info', `Moved to ${STATUS_CFG[col].label}`) }
    setDragging(null); setOver(null)
  }

  const addToColumn = async (status: TaskStatus, title: string) => {
    await createTask({ title, status, priority: 'medium' })
    toast('success', 'Task created')
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {STATUS_CYCLE.map((col) => {
        const sc = STATUS_CFG[col]; const colTasks = tasks.filter((t) => t.status === col); const isOver = over === col
        return (
          <div key={col}
            onDragOver={(e) => { e.preventDefault(); setOver(col) }}
            onDragLeave={() => setOver(null)}
            onDrop={() => drop(col)}
            className="rounded-xl p-3 min-h-48 transition-all duration-150"
            style={{ background: isOver ? 'var(--brand-muted)' : 'var(--surface-2)', border: `1px solid ${isOver ? 'var(--brand)' : 'var(--border-color)'}`, boxShadow: isOver ? 'var(--brand-glow)' : 'none' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className={sc.chipClass}>{sc.icon} {sc.label}</span>
              <span className="ml-auto w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>{colTasks.length}</span>
            </div>
            <div className="space-y-2">
              {colTasks.map((t) => <KanbanCard key={t.id} task={t} onDragStart={setDragging} />)}
              {colTasks.length === 0 && !isOver && (
                <div className="py-6 text-center text-xs rounded-lg" style={{ color: 'var(--text-3)', border: '2px dashed var(--border-color)' }}>Drop tasks here</div>
              )}
            </div>
            <KanbanColumnAddBar status={col} onAdd={(title) => addToColumn(col, title)} />
          </div>
        )
      })}
    </div>
  )
}

// ─── TaskCard ────────────────────────────────────────────────────────────────
function TaskCard({ task, bulkSelected, onBulkToggle }: { task: Task; bulkSelected: boolean; onBulkToggle: () => void }) {
  const { updateTask, deleteTask } = useTaskStore()
  const { tags: allTags, assignTag, fetchTags } = useTagStore()
  const { toast } = useToast()
  const [editing,       setEditing]       = useState(false)
  const [expanded,      setExpanded]      = useState(false)
  const [title,         setTitle]         = useState(task.title)
  const [desc,          setDesc]          = useState(task.description ?? '')
  const [status,        setStatus]        = useState<TaskStatus>(task.status)
  const [priority,      setPriority]      = useState<TaskPriority>(task.priority)
  const [saving,        setSaving]        = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const taskTagIds = useMemo(() => new Set(task.tags?.map((t) => t.id) ?? []), [task.tags])

  const cycleStatus = async () => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(task.status) + 1) % STATUS_CYCLE.length]
    await updateTask(task.id, { status: next })
    toast('info', `Status → ${STATUS_CFG[next].label}`, task.title)
  }

  const save = async () => {
    setSaving(true)
    await updateTask(task.id, { title, description: desc || null, status, priority })
    setSaving(false); setEditing(false)
    toast('success', 'Task updated')
  }

  const del = async () => {
    await deleteTask(task.id)
    toast('info', 'Task deleted', task.title)
  }

  const toggleTag = async (tagId: string) => {
    await assignTag(tagId, task.id, !taskTagIds.has(tagId))
    await useTaskStore.getState().fetchTasks()
  }

  const sc = STATUS_CFG[task.status]
  const pc = PRI_CFG[task.priority]
  const hasDesc = !!task.description

  if (editing) {
    return (
      <div className="card p-4 space-y-3 anim-scale-in" style={{ borderColor: 'var(--brand-border)' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-base text-sm" placeholder="Task title" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="input-base text-sm resize-none" placeholder="Description (optional)" />
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="input-base text-xs flex-1">
            {STATUS_CYCLE.map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="input-base text-xs flex-1">
            {(Object.keys(PRI_CFG) as TaskPriority[]).map((p) => <option key={p} value={p}>{PRI_CFG[p].label}</option>)}
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={() => setEditing(false)} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
          <button onClick={save} disabled={saving || !title.trim()} className="btn-primary text-xs px-3 py-1.5 rounded-lg">
            {saving ? <Spinner size={12} /> : <Check className="w-3 h-3" />} Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`card card-hover group anim-fade-up ${task.status === 'done' ? 'opacity-60' : ''} ${bulkSelected ? 'ring-2 ring-[var(--brand)]' : ''}`}>
      <div className="flex items-start gap-3 p-4">
        {/* Bulk checkbox */}
        <input type="checkbox" checked={bulkSelected} onChange={onBulkToggle}
          className="mt-1 shrink-0 accent-[var(--brand)] cursor-pointer" />
        {/* Status chip — click to cycle */}
        <button onClick={cycleStatus} title="Click to cycle status"
          className={`${sc.chipClass} shrink-0 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity`}>
          {sc.icon} {sc.label}
        </button>
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className={`text-sm font-medium leading-snug flex-1 ${task.status === 'done' ? 'line-through' : ''}`}
              style={{ color: 'var(--foreground)' }}>
              {task.title}
            </p>
            {urgencyBadge(task.dueDate, task.status)}
          </div>
          {/* Expandable description */}
          {hasDesc && (
            <button onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs mt-1 hover:opacity-80 transition"
              style={{ color: 'var(--text-3)' }}>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Collapse' : 'Show details'}
            </button>
          )}
          {expanded && hasDesc && (
            <p className="text-xs mt-1.5 leading-relaxed anim-fade-in" style={{ color: 'var(--text-2)' }}>
              {task.description}
            </p>
          )}
          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={pc.chipClass}><span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />{pc.label}</span>
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
                <Calendar className="w-3 h-3" />{new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.tags?.map((tag) => <TagBadge key={tag.id} tag={tag} onRemove={() => toggleTag(tag.id)} />)}
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button onClick={() => { fetchTags(); setShowTagPicker((v) => !v) }}
            className="btn-ghost w-7 h-7 p-0 rounded flex items-center justify-center" title="Tags">
            <TagIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setEditing(true)}
            className="btn-ghost w-7 h-7 p-0 rounded flex items-center justify-center" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={del}
            className="btn-ghost w-7 h-7 p-0 rounded flex items-center justify-center hover:!text-red-400" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Tag picker */}
      {showTagPicker && allTags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5 pt-2 anim-fade-in" style={{ borderTop: '1px solid var(--border-color)' }}>
          {allTags.map((tag) => (
            <button key={tag.id} onClick={() => toggleTag(tag.id)}
              className="text-xs px-2 py-0.5 rounded-full border transition-all"
              style={{ borderColor: tag.color + '50', background: tag.color + (taskTagIds.has(tag.id) ? '30' : '10'), color: tag.color }}>
              {taskTagIds.has(tag.id) ? '✓ ' : ''}{tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
