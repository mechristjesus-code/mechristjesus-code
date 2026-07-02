'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Dna, MessageSquare, Youtube, Cpu, Users2, Brain,
  CheckSquare, Plus, X, LogOut, Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'
import { ThemeToggle } from '@/components/ThemeToggle'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Persona {
  id: string
  name: string
  emoji: string
  role: string
  systemPrompt: string
  model: string
  isDefault?: boolean
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/creator',          label: 'OS Home',    icon: <Cpu          className="w-4 h-4" /> },
  { href: '/creator/chat',     label: 'AI Chat',    icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/creator/studio',   label: 'Studio',     icon: <Youtube      className="w-4 h-4" /> },
  { href: '/creator/dna',      label: 'My DNA',     icon: <Dna          className="w-4 h-4" /> },
  { href: '/creator/personas', label: 'AI Team',    icon: <Users2       className="w-4 h-4" /> },
  { href: '/creator/modules',  label: 'AI Modules', icon: <Brain        className="w-4 h-4" /> },
  { href: '/dashboard',        label: 'Task Board', icon: <CheckSquare  className="w-4 h-4" /> },
]

const MODEL_OPTIONS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo',
  'ollama/llama3',
  'ollama/mistral',
]

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreatePersonaModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (p: Persona) => void
}) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    emoji: '🤖',
    role: '',
    systemPrompt: '',
    model: 'gpt-4o-mini',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim()) {
      toast('error', 'Name and role are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/ai/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create persona')
      onCreated(data.persona ?? data)
      toast('success', `${form.emoji} ${form.name} added to your AI Team!`)
      onClose()
    } catch (err: unknown) {
      toast('error', err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="card w-full max-w-md anim-scale-in" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>New Persona</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-2)' }}>Name *</label>
              <input className="input-base w-full" placeholder="e.g. Script Writer" value={form.name} onChange={set('name')} required />
            </div>
            <div style={{ width: 80 }}>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-2)' }}>Emoji</label>
              <input className="input-base w-full text-center text-xl" maxLength={2} placeholder="🤖" value={form.emoji} onChange={set('emoji')} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-2)' }}>Role *</label>
            <input className="input-base w-full" placeholder="e.g. YouTube Script Specialist" value={form.role} onChange={set('role')} required />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-2)' }}>System Prompt</label>
            <textarea
              className="input-base w-full resize-none"
              rows={4}
              placeholder="You are a YouTube script specialist with deep expertise in viral hooks..."
              value={form.systemPrompt}
              onChange={set('systemPrompt')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-2)' }}>Model</label>
            <select className="input-base w-full" value={form.model} onChange={set('model')}>
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost text-xs flex-1 py-2 justify-center">Cancel</button>
            <button type="submit" className="btn-primary text-xs flex-1 py-2 justify-center" disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {saving ? 'Creating…' : 'Create Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Persona Card ─────────────────────────────────────────────────────────────
function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <div className="card p-5 flex flex-col gap-3 anim-fade-up">
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none shrink-0">{persona.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{persona.name}</p>
            {persona.isDefault && (
              <span className="chip text-xs font-semibold"
                style={{ background: 'var(--brand-muted)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}>
                Default
              </span>
            )}
          </div>
          <span className="chip text-xs mt-1 inline-block"
            style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-color)' }}>
            {persona.role}
          </span>
        </div>
      </div>
      {persona.systemPrompt && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-2)' }}>
          {persona.systemPrompt.slice(0, 100)}{persona.systemPrompt.length > 100 ? '…' : ''}
        </p>
      )}
      <Link
        href={`/creator/chat?persona=${persona.id}`}
        className="btn-ghost text-xs flex items-center gap-1.5 mt-auto pt-2 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <MessageSquare className="w-3.5 h-3.5" /> Chat with this persona →
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PersonasPage() {
  const { user, logout } = useAuthStore()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/ai/personas')
      .then((r) => r.json())
      .then((d) => { setPersonas(d.personas ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar hidden sm:flex">
        <div className="sidebar-logo">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>
            <Dna className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Creator DNA OS</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>v1.0</p>
          </div>
        </div>
        <div className="sidebar-section mt-1">
          <p className="sidebar-label">Workspace</p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item${item.href === '/creator/personas' ? ' active' : ''}`}
            >
              {item.icon}{item.label}
            </Link>
          ))}
        </div>
        {user && (
          <div className="sidebar-footer">
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
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
        )}
      </aside>

      {/* Main */}
      <div className="main-area">
        <div className="main-topbar">
          <div className="flex items-center gap-3">
            <Users2 className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h1 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>AI Team</h1>
            {!loading && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--brand-muted)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}>
                {personas.length} persona{personas.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setShowModal(true)} className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Persona
            </button>
          </div>
        </div>

        <div className="main-content space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
            </div>
          ) : personas.length === 0 ? (
            <div className="card p-10 text-center flex flex-col items-center gap-4">
              <span className="text-5xl">🤖</span>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>No personas yet</p>
                <p className="text-xs" style={{ color: 'var(--text-2)' }}>Create your first AI team member to get started</p>
              </div>
              <button onClick={() => setShowModal(true)} className="btn-primary text-xs px-4 py-2 rounded-lg flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Create first persona
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personas.map((p) => <PersonaCard key={p.id} persona={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CreatePersonaModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => setPersonas((prev) => [...prev, p])}
        />
      )}
    </div>
  )
}
