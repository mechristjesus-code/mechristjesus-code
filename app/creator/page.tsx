'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Dna, MessageSquare, Youtube, Cpu, Users2, FolderOpen,
  Brain, Mic, Zap, ChevronRight, Plus, LogOut, CheckSquare,
  BarChart2, Sparkles,
} from 'lucide-react'

interface Project { id: string; title: string; type: string; status: string; updatedAt: string }
interface Persona  { id: string; name: string; emoji: string; role: string }

const NAV_ITEMS = [
  { href: '/creator',          label: 'OS Home',    icon: <Cpu        className="w-4 h-4" />, exact: true },
  { href: '/creator/chat',     label: 'AI Chat',    icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/creator/studio',   label: 'Studio',     icon: <Youtube    className="w-4 h-4" /> },
  { href: '/creator/dna',      label: 'My DNA',     icon: <Dna        className="w-4 h-4" /> },
  { href: '/creator/personas', label: 'AI Team',    icon: <Users2     className="w-4 h-4" /> },
  { href: '/creator/modules',  label: 'AI Modules', icon: <Brain      className="w-4 h-4" /> },
  { href: '/dashboard',        label: 'Task Board', icon: <CheckSquare className="w-4 h-4" /> },
]

export default function CreatorOSPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [personas,  setPersonas]  = useState<Persona[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    Promise.all([
      fetch('/api/ai/projects').then((r) => r.json()),
      fetch('/api/ai/personas').then((r) => r.json()),
    ]).then(([pd, pe]) => {
      setProjects(pd.projects ?? [])
      setPersonas(pe.personas ?? [])
      setLoading(false)
    })
  }, [user, router])

  if (!user) return null

  const modules = [
    { label: 'AI Chat',    desc: 'DNA-aware conversations',    href: '/creator/chat',     icon: '💬', color: '#6366f1' },
    { label: 'Studio',     desc: 'YouTube → Script pipeline',  href: '/creator/studio',   icon: '🎬', color: '#ec4899' },
    { label: 'My DNA',     desc: 'Style & voice editor',       href: '/creator/dna',      icon: '🧬', color: '#10b981' },
    { label: 'AI Team',    desc: '6 specialized assistants',   href: '/creator/personas', icon: '🤖', color: '#f59e0b' },
    { label: 'AI Modules', desc: '5 GitHub integrations',      href: '/creator/modules',  icon: '⚙️', color: '#8b5cf6' },
    { label: 'Analytics',  desc: 'Usage & performance stats',  href: '/analytics',        icon: '📊', color: '#0ea5e9' },
  ]

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar hidden sm:flex">
        <div className="sidebar-logo">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>
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
            <Link key={item.href} href={item.href} className="sidebar-item">
              {item.icon}{item.label}
            </Link>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
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

      {/* Main */}
      <div className="main-area">
        <div className="main-topbar">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h1 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Creator DNA OS</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--brand-muted)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}>v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/creator/studio" className="btn-primary text-xs px-3 py-1.5 rounded-lg">
              <Plus className="w-3.5 h-3.5" /> New Project
            </Link>
          </div>
        </div>

        <div className="main-content space-y-8">
          {/* Welcome banner */}
          <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)', color: '#fff' }}>
            <div className="relative z-10">
              <p className="text-xs font-semibold opacity-80 mb-1">Welcome back,</p>
              <h2 className="text-2xl font-bold mb-2">{user.username} 👋</h2>
              <p className="text-sm opacity-80 max-w-lg">Your Creator DNA OS is ready. Use AI-powered tools to turn YouTube videos into original scripts, build your brand voice, and manage your entire content workflow.</p>
              <div className="flex gap-3 mt-4 flex-wrap">
                <Link href="/creator/studio" className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-medium transition">
                  <Youtube className="w-4 h-4" /> Start from YouTube
                </Link>
                <Link href="/creator/chat" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-medium transition border border-white/20">
                  <MessageSquare className="w-4 h-4" /> Open AI Chat
                </Link>
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-10" style={{ background: '#fff' }} />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full opacity-10" style={{ background: '#fff' }} />
          </div>

          {/* Module grid */}
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Core Modules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {modules.map((m) => (
                <Link key={m.href} href={m.href} className="card card-hover p-4 flex flex-col gap-3 anim-fade-up group">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{m.icon}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" style={{ color: m.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{m.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{m.desc}</p>
                  </div>
                  <div className="h-0.5 rounded-full w-8" style={{ background: m.color }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent projects + AI Team side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Recent Projects</h3>
                <Link href="/creator/studio" className="text-xs" style={{ color: 'var(--brand)' }}>New +</Link>
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-14" />)}</div>
              ) : projects.length === 0 ? (
                <div className="card p-6 text-center">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-2)' }}>No projects yet</p>
                  <Link href="/creator/studio" className="btn-primary text-xs px-3 py-1.5 rounded-lg mt-3 inline-flex"><Plus className="w-3 h-3" /> Create first project</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 5).map((p) => (
                    <Link key={p.id} href={`/creator/studio?project=${p.id}`} className="card card-hover flex items-center gap-3 px-4 py-3 anim-fade-up">
                      <span className="text-lg">{p.type === 'youtube' ? '▶️' : p.type === 'tiktok' ? '🎵' : '📝'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{p.title}</p>
                        <p className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{p.status} · {new Date(p.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-3)' }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* AI Team */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>My AI Team</h3>
                <Link href="/creator/personas" className="text-xs" style={{ color: 'var(--brand)' }}>Manage</Link>
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-10" />)}</div>
              ) : (
                <div className="space-y-2">
                  {personas.slice(0, 6).map((p) => (
                    <Link key={p.id} href={`/creator/chat?persona=${p.id}`} className="card card-hover flex items-center gap-3 px-4 py-2.5 anim-fade-up">
                      <span className="text-base">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                      </div>
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-3)' }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* GitHub AI Modules banner */}
          <div className="card p-5" style={{ borderColor: 'var(--brand-border)', background: 'var(--brand-muted)' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand)', color: '#fff' }}>
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>GitHub AI Integrations</p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>
                  5 open-source AI modules are registered: <strong>Whisper</strong> (speech-to-text), <strong>Ollama</strong> (local LLMs), <strong>Piper</strong> (TTS), <strong>Whisplay</strong> (edge chatbot), and <strong>PiSugar</strong> (edge power). All can be self-hosted for full privacy.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['🎙️ Whisper','🦙 Ollama','🔊 Piper','🍓 Whisplay','🔋 PiSugar'].map((m) => (
                    <span key={m} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}>{m}</span>
                  ))}
                </div>
              </div>
              <Link href="/creator/modules" className="btn-ghost text-xs px-3 py-1.5 rounded-lg shrink-0">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
