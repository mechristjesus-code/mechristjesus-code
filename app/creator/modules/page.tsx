'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Dna, MessageSquare, Youtube, Cpu, Users2, Brain,
  CheckSquare, ChevronDown, ChevronUp, LogOut, ExternalLink,
  Star, GitBranch, Zap, Copy, Check, RefreshCw, Wifi, WifiOff,
  AlertCircle, Terminal, Activity,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useToast } from '@/components/Toast'
import type { AiModule } from '@/lib/creator/modules-registry'

// ─── types ───────────────────────────────────────────────────────────────────
type Category    = 'all' | AiModule['category']
type ConnStatus  = 'idle' | 'testing' | 'online' | 'offline' | 'not_configured' | 'error'

interface ModuleWithStatus extends AiModule {
  connStatus:  ConnStatus
  connMsg:     string
  latencyMs:   number | null
}

// ─── constants ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/creator',          label: 'OS Home',    icon: <Cpu           className="w-4 h-4" /> },
  { href: '/creator/chat',     label: 'AI Chat',    icon: <MessageSquare className="w-4 h-4" /> },
  { href: '/creator/studio',   label: 'Studio',     icon: <Youtube       className="w-4 h-4" /> },
  { href: '/creator/dna',      label: 'My DNA',     icon: <Dna           className="w-4 h-4" /> },
  { href: '/creator/personas', label: 'AI Team',    icon: <Users2        className="w-4 h-4" /> },
  { href: '/creator/modules',  label: 'AI Modules', icon: <Brain         className="w-4 h-4" /> },
  { href: '/dashboard',        label: 'Task Board', icon: <CheckSquare   className="w-4 h-4" /> },
]

const FILTER_TABS: { key: Category; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'speech',   label: '🎙️ Speech'  },
  { key: 'language', label: '🦙 LLM'    },
  { key: 'tts',      label: '🔊 TTS'    },
  { key: 'edge',     label: '🍓 Edge'   },
  { key: 'utility',  label: '⚙️ Utility' },
]

const LANG_COLORS: Record<string, string> = {
  Python: '#3776ab', Go: '#00acd7', 'C++': '#f34b7d',
  TypeScript: '#3178c6', Rust: '#ce422b',
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmtStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return String(n)
}

export default function ModulesPage() {
  const { user, logout }   = useAuthStore()
  const { toast }          = useToast()
  const [activeFilter, setActiveFilter] = useState<Category>('all')
  const [modules, setModules]           = useState<ModuleWithStatus[]>([])
  const [loading, setLoading]           = useState(true)
  const [showEnvPanel, setShowEnvPanel] = useState(false)

  const loadModules = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/ai/modules')
      const data = await res.json()
      setModules((data.modules ?? []).map((m: AiModule) => ({
        ...m, connStatus: 'idle' as ConnStatus, connMsg: '', latencyMs: null,
      })))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadModules() }, [loadModules])

  const testConnection = async (moduleId: string) => {
    setModules((prev) => prev.map((m) => m.id === moduleId ? { ...m, connStatus: 'testing' } : m))
    try {
      const res  = await fetch('/api/ai/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId }) })
      const data = await res.json()
      setModules((prev) => prev.map((m) => m.id === moduleId ? { ...m, connStatus: data.status as ConnStatus, connMsg: data.message ?? '', latencyMs: data.latencyMs ?? null } : m))
      toast(data.status === 'online' ? 'success' : 'info', data.message ?? data.status)
    } catch {
      setModules((prev) => prev.map((m) => m.id === moduleId ? { ...m, connStatus: 'offline', connMsg: 'Request failed' } : m))
    }
  }

  const filtered = activeFilter === 'all' ? modules : modules.filter((m) => m.category === activeFilter)

  if (!user) return null

  return (
    <div className="app-shell">
      <Sidebar user={user} logout={logout} />
      <div className="main-area">
        <Topbar count={modules.length} onRefresh={loadModules} onToggleEnv={() => setShowEnvPanel((v) => !v)} showEnvPanel={showEnvPanel} />
        <div className="main-content space-y-6">
          <InfoBanner />
          {showEnvPanel && <EnvPanel modules={modules} toast={toast} />}
          <ArchDiagram />
          <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          {loading ? <LoadingSkeleton /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered.map((mod) => <ModuleCard key={mod.id} mod={mod} onTest={testConnection} toast={toast} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ user, logout }: { user: { username: string; email: string }; logout: () => void }) {
  return (
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
          <Link key={item.href} href={item.href} className={`sidebar-item${item.href === '/creator/modules' ? ' active' : ''}`}>
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
          <button onClick={logout} className="btn-ghost text-xs flex-1 justify-center py-1.5"><LogOut className="w-3.5 h-3.5" /> Sign out</button>
        </div>
      </div>
    </aside>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ count, onRefresh, onToggleEnv, showEnvPanel }: { count: number; onRefresh: () => void; onToggleEnv: () => void; showEnvPanel: boolean }) {
  return (
    <div className="main-topbar">
      <div className="flex items-center gap-3">
        <Brain className="w-5 h-5" style={{ color: 'var(--brand)' }} />
        <h1 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>AI Modules</h1>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--brand-muted)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}>
          {count} integrations
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onToggleEnv} className={`btn-ghost text-xs flex items-center gap-1.5 ${showEnvPanel ? 'ring-1 ring-[var(--brand)]' : ''}`}>
          <Terminal className="w-3.5 h-3.5" /> .env Config
        </button>
        <button onClick={onRefresh} className="btn-ghost text-xs flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Stats
        </button>
        <ThemeToggle />
      </div>
    </div>
  )
}

// ─── InfoBanner ───────────────────────────────────────────────────────────────
function InfoBanner() {
  return (
    <div className="rounded-xl px-5 py-4" style={{ background: 'var(--brand-muted)', border: '1px solid var(--brand-border)' }}>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
        <span className="font-semibold" style={{ color: 'var(--brand)' }}>ℹ️ Self-hosted AI modules — </span>
        Each module runs on your own hardware or server. Clone the repos, follow the setup guide, then set the <code className="font-mono text-xs" style={{ color: 'var(--high-fg)' }}>*_HOST</code> environment variables in <code className="font-mono text-xs" style={{ color: 'var(--high-fg)' }}>.env</code> to connect them. Use <strong>Test Connection</strong> to verify each service is reachable.
      </p>
    </div>
  )
}

// ─── EnvPanel ─────────────────────────────────────────────────────────────────
function EnvPanel({ modules, toast }: { modules: ModuleWithStatus[]; toast: (t: 'success'|'error'|'info', msg: string) => void }) {
  const allVars = modules.flatMap((m) => m.envVars.map((v) => ({ ...v, module: m.name, icon: m.icon })))
  const snippet = allVars.map((v) => `${v.key}=${v.example}  # ${v.description}`).join('\n')
  const copy = () => { navigator.clipboard.writeText(snippet); toast('success', 'Copied .env snippet!') }
  return (
    <div className="card p-5 space-y-3 anim-scale-in">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Terminal className="w-4 h-4" style={{ color: 'var(--brand)' }} /> Environment Variables
        </p>
        <button onClick={copy} className="btn-ghost text-xs flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copy all</button>
      </div>
      <div className="rounded-lg overflow-auto" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}>
        <pre className="text-xs font-mono p-4 leading-relaxed" style={{ color: '#86efac', whiteSpace: 'pre-wrap' }}>{snippet}</pre>
      </div>
      <div className="space-y-2">
        {allVars.map((v) => (
          <div key={v.key} className="flex items-start gap-3 text-xs">
            <span className="shrink-0">{v.icon}</span>
            <code className="font-mono font-semibold shrink-0" style={{ color: 'var(--brand)' }}>{v.key}</code>
            <span style={{ color: 'var(--text-2)' }}>{v.description}</span>
            {v.required && <span className="shrink-0 chip" style={{ background: '#fef2f2', color: 'var(--high-fg)', border: '1px solid #fca5a5', fontSize: '0.6rem' }}>required</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ArchDiagram ─────────────────────────────────────────────────────────────
function ArchDiagram() {
  const branches = [
    { label: 'Whisper',  sub: 'Speech → Text', color: '#3776ab' },
    { label: 'Ollama',   sub: 'Local LLM',      color: '#00acd7' },
    { label: 'Piper',    sub: 'Text → Speech',  color: '#f34b7d' },
    { label: 'Whisplay', sub: 'Edge chatbot',   color: '#10b981' },
    { label: 'PiSugar',  sub: 'Power mgmt',     color: '#ce422b' },
  ]
  return (
    <div className="card p-5">
      <p className="font-semibold text-sm mb-4" style={{ color: 'var(--foreground)' }}>
        <GitBranch className="w-4 h-4 inline mr-1.5" style={{ color: 'var(--brand)' }} />
        Architecture — One core, five modules
      </p>
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-xl px-5 py-2 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          Core AI Engine (Creator DNA OS)
        </div>
        <div className="w-px h-4" style={{ background: 'var(--border-color)' }} />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
          {branches.map((n) => (
            <div key={n.label} className="rounded-lg p-2.5 text-center" style={{ background: n.color + '18', border: `1px solid ${n.color}40` }}>
              <p className="text-xs font-semibold" style={{ color: n.color }}>{n.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{n.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── FilterTabs ───────────────────────────────────────────────────────────────
function FilterTabs({ activeFilter, setActiveFilter }: { activeFilter: Category; setActiveFilter: (c: Category) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTER_TABS.map((tab) => (
        <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
          className={activeFilter === tab.key ? 'btn-primary text-xs px-3 py-1.5 rounded-full' : 'btn-ghost text-xs px-3 py-1.5 rounded-full'}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── LoadingSkeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex gap-3"><div className="skeleton w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-32" /><div className="skeleton h-3 w-20" /></div></div>
          <div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-3/4" />
          <div className="flex gap-2"><div className="skeleton h-5 w-20 rounded-full" /><div className="skeleton h-5 w-24 rounded-full" /></div>
        </div>
      ))}
    </div>
  )
}

// ─── ModuleCard ───────────────────────────────────────────────────────────────
function ModuleCard({ mod, onTest, toast }: { mod: ModuleWithStatus; onTest: (id: string) => void; toast: (t: 'success'|'error'|'info', msg: string) => void }) {
  const [showSetup, setShowSetup] = useState(false)
  const [copied,    setCopied]    = useState(false)

  const badgeCfg = {
    'self-hosted': { label: 'Self-hosted', bg: '#f97316', fg: '#fff' },
    'available':   { label: 'Available',   bg: '#10b981', fg: '#fff' },
    'coming-soon': { label: 'Coming soon', bg: 'var(--surface-2)', fg: 'var(--text-2)' },
  }[mod.status]

  const connIcon: Record<ConnStatus, React.ReactNode> = {
    idle:           <Wifi        className="w-3.5 h-3.5" />,
    testing:        <RefreshCw   className="w-3.5 h-3.5 animate-spin" />,
    online:         <Wifi        className="w-3.5 h-3.5" style={{ color: '#10b981' }} />,
    offline:        <WifiOff     className="w-3.5 h-3.5" style={{ color: 'var(--high-fg)' }} />,
    not_configured: <AlertCircle className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />,
    error:          <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--high-fg)' }} />,
  }

  const copyClone = () => {
    navigator.clipboard.writeText(`git clone ${mod.cloneUrl}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast('success', 'Clone command copied!')
  }

  const langColor = LANG_COLORS[mod.language] ?? '#6366f1'

  return (
    <div className="card flex flex-col gap-4 p-5 anim-fade-up hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0 leading-none">{mod.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{mod.name}</p>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>{mod.latestVersion}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="chip text-xs flex items-center gap-1" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-color)' }}>
              <Star className="w-2.5 h-2.5" /> {fmtStars(mod.stars)}
            </span>
            <span className="chip text-xs font-semibold" style={{ background: langColor + '18', color: langColor, border: `1px solid ${langColor}40` }}>{mod.language}</span>
            <span className="chip text-xs" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-color)' }}>{mod.license}</span>
            <span className="chip text-xs font-semibold" style={{ background: badgeCfg.bg, color: badgeCfg.fg, border: 'none' }}>{badgeCfg.label}</span>
          </div>
        </div>
      </div>
      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{mod.description}</p>
      {/* Used-for */}
      <div className="flex flex-wrap gap-1.5">
        {mod.usedFor.map((tag) => (
          <span key={tag} className="chip text-xs" style={{ background: 'var(--brand-muted)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}>{tag}</span>
        ))}
      </div>
      {/* Connection status */}
      {mod.connStatus !== 'idle' && (
        <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2 anim-fade-in" style={{
          background: mod.connStatus === 'online' ? 'rgba(16,185,129,0.08)' : mod.connStatus === 'not_configured' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${mod.connStatus === 'online' ? '#10b98130' : mod.connStatus === 'not_configured' ? '#f59e0b30' : '#ef444430'}`,
        }}>
          {connIcon[mod.connStatus]}
          <span style={{ color: 'var(--foreground)' }}>{mod.connMsg}</span>
          {mod.latencyMs !== null && <span className="ml-auto font-mono" style={{ color: 'var(--text-3)' }}>{mod.latencyMs}ms</span>}
        </div>
      )}
      {/* Env vars inline */}
      {mod.envVars.length > 0 && (
        <div className="space-y-1 rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}>
          {mod.envVars.map((v) => (
            <div key={v.key} className="flex items-center gap-2 text-xs">
              <code className="font-mono shrink-0" style={{ color: 'var(--brand)' }}>{v.key}</code>
              <span className="truncate" style={{ color: 'var(--text-3)' }}>{v.example}</span>
              {v.required && <span className="shrink-0 text-xs font-bold" style={{ color: 'var(--high-fg)' }}>*</span>}
            </div>
          ))}
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-1 flex-wrap" style={{ borderTop: '1px solid var(--border-color)' }}>
        <a href={mod.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center gap-1">
          <ExternalLink className="w-3.5 h-3.5" /> GitHub
        </a>
        <button onClick={copyClone} className="btn-ghost text-xs flex items-center gap-1">
          {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#10b981' }} /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Clone'}
        </button>
        <button onClick={() => onTest(mod.id)} disabled={mod.connStatus === 'testing'} className="btn-ghost text-xs flex items-center gap-1 ml-auto">
          <Activity className="w-3.5 h-3.5" />
          {mod.connStatus === 'testing' ? 'Testing…' : 'Test Connection'}
        </button>
        <button onClick={() => setShowSetup((v) => !v)} className="btn-ghost text-xs flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5" />
          Setup {showSetup ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>
      {/* Setup guide */}
      {showSetup && (
        <div className="rounded-lg overflow-hidden anim-scale-in" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <p className="text-xs font-semibold" style={{ color: '#94a3b8' }}>Setup Guide</p>
            <button onClick={() => { navigator.clipboard.writeText(mod.setupSteps.join('\n')); toast('success', 'Commands copied!') }}
              className="text-xs flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <ol className="list-none m-0 p-0 pb-3">
            {mod.setupSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-1">
                <span className="text-xs font-bold shrink-0 mt-0.5" style={{ color: '#6366f1' }}>{i + 1}</span>
                <code className="text-xs font-mono leading-relaxed break-all" style={{ color: step.startsWith('#') ? '#94a3b8' : '#86efac' }}>{step}</code>
              </li>
            ))}
          </ol>
          <div className="px-4 pb-3">
            <a href={mod.cloneUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium text-white"
              style={{ background: '#6366f1' }}>
              <Zap className="w-3.5 h-3.5" /> Clone on GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
