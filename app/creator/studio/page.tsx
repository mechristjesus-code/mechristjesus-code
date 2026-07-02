'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Youtube, FileText, Tag, AlignLeft, Hash, Copy, Download,
  Plus, Clipboard, ChevronRight, Loader2, LayoutDashboard,
  Dna, Clapperboard, BarChart2, Settings, LogOut
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Project {
  id: string
  title: string
  type: string
  sourceUrl?: string
  transcript?: string
  script?: string
  youtubeTitle?: string
  description?: string
  hashtags?: string
}

type Step = 1 | 2 | 3
type Workflow = 'youtube_script' | 'youtube_title' | 'youtube_description' | 'hashtags'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/creator/studio', icon: Clapperboard, label: 'Studio' },
  { href: '/creator/dna', icon: Dna, label: 'My DNA' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

function Sidebar({ active }: { active: string }) {
  const { user, logout } = useAuthStore()
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Clapperboard size={22} style={{ color: 'var(--brand)' }} />
        <span>CreatorOS</span>
      </div>
      <nav className="sidebar-section" style={{ flex: 1 }}>
        <p className="sidebar-label">Menu</p>
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`sidebar-item${active === label ? ' active' : ''}`}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-section">
        <p className="sidebar-label">Account</p>
        <div className="sidebar-item" style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'default' }}>
          {user?.email ?? 'Guest'}
        </div>
        <button className="sidebar-item btn-ghost" style={{ width: '100%', textAlign: 'left' }} onClick={logout}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: active || done ? 1 : 0.4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? 'var(--done-fg)' : active ? 'var(--brand)' : 'var(--surface-2)',
        color: done || active ? '#fff' : 'var(--text-3)', fontWeight: 700, fontSize: 13,
      }}>{done ? '✓' : n}</div>
      <span style={{ fontWeight: active ? 600 : 400, color: active ? 'var(--foreground)' : 'var(--text-2)', fontSize: 14 }}>{label}</span>
    </div>
  )
}

function SkeletonBox({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14, borderRadius: 6, width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  )
}

export default function StudioPage() {
  const { toast } = useToast()
  const [step, setStep] = useState<Step>(1)
  const [projects, setProjects] = useState<Project[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [ytUrl, setYtUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [fetching, setFetching] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [generating, setGenerating] = useState<Workflow | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/ai/projects')
      .then(r => r.json())
      .then(d => setProjects(Array.isArray(d) ? d : d.projects ?? []))
      .catch(() => {})
      .finally(() => setLoadingProjects(false))
  }, [])

  async function handleFetch() {
    if (!ytUrl.trim() || !newTitle.trim()) { toast('error', 'Enter a title and YouTube URL'); return }
    setFetching(true)
    try {
      const res = await fetch('/api/ai/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, type: 'youtube', sourceUrl: ytUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      const proj: Project = data.project ?? data
      setProject(proj)
      setProjects(prev => [proj, ...prev])
      setResults({
        script: proj.script ?? '',
        youtubeTitle: proj.youtubeTitle ?? '',
        description: proj.description ?? '',
        hashtags: proj.hashtags ?? '',
      })
      toast('success', 'Project created!')
      setStep(2)
    } catch (e: unknown) {
      toast('error', (e as Error).message)
    } finally {
      setFetching(false)
    }
  }

  async function handleGenerate(workflow: Workflow) {
    if (!project) return
    setGenerating(workflow)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow, userInput: project.title, transcript: project.transcript, projectId: project.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      const key = workflow === 'youtube_title' ? 'youtubeTitle' : workflow === 'youtube_script' ? 'script' : workflow === 'youtube_description' ? 'description' : 'hashtags'
      setResults(prev => ({ ...prev, [key]: data.result ?? data.content ?? '' }))
      toast('success', 'Generated!')
    } catch (e: unknown) {
      toast('error', (e as Error).message)
    } finally {
      setGenerating(null)
    }
  }

  async function handleSave() {
    if (!project) return
    setSaving(true)
    try {
      const res = await fetch(`/api/ai/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      })
      if (!res.ok) throw new Error('Save failed')
      toast('success', 'Saved!')
    } catch (e: unknown) {
      toast('error', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function copyField(key: string) {
    navigator.clipboard.writeText(results[key] ?? '')
    toast('success', 'Copied!')
  }

  function exportTxt() {
    const content = `TITLE\n${results.youtubeTitle ?? ''}\n\nSCRIPT\n${results.script ?? ''}\n\nDESCRIPTION\n${results.description ?? ''}\n\nHASHTAGS\n${results.hashtags ?? ''}`
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${project?.title ?? 'export'}.txt`
    a.click()
  }

  const GENERATE_BTNS: { label: string; icon: string; workflow: Workflow; key: string }[] = [
    { label: 'Script', icon: '📝', workflow: 'youtube_script', key: 'script' },
    { label: 'Title', icon: '🏷️', workflow: 'youtube_title', key: 'youtubeTitle' },
    { label: 'Description', icon: '📄', workflow: 'youtube_description', key: 'description' },
    { label: 'Hashtags', icon: '#️⃣', workflow: 'hashtags', key: 'hashtags' },
  ]

  return (
    <div className="app-shell">
      <Sidebar active="Studio" />
      <div className="main-area">
        <header className="main-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clapperboard size={18} style={{ color: 'var(--brand)' }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>Studio</span>
          </div>
          <ThemeToggle />
        </header>
        <div className="main-content anim-fade-up" style={{ maxWidth: 860 }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <StepBadge n={1} label="Source" active={step === 1} done={step > 1} />
            <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
            <StepBadge n={2} label="Generate" active={step === 2} done={step > 2} />
            <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
            <StepBadge n={3} label="Export" active={step === 3} done={false} />
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 14, fontSize: 15 }}>New Project from YouTube</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input className="input-base" placeholder="Project title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input-base" style={{ flex: 1 }} placeholder="YouTube URL" value={ytUrl} onChange={e => setYtUrl(e.target.value)} />
                    <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 13 }}
                      onClick={async () => { const t = await navigator.clipboard.readText(); setYtUrl(t) }}>
                      <Clipboard size={14} /> Paste
                    </button>
                  </div>
                  <button className="btn-primary" onClick={handleFetch} disabled={fetching} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {fetching ? <Loader2 size={15} className="animate-spin" /> : <Youtube size={15} />}
                    {fetching ? 'Fetching…' : 'Fetch Transcript'}
                  </button>
                </div>
              </div>

              {project?.transcript && (
                <div className="card" style={{ padding: 20 }}>
                  <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Transcript Preview</p>
                  <div style={{ maxHeight: 140, overflow: 'auto', background: 'var(--surface-2)', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    {project.transcript.slice(0, 500)}{project.transcript.length > 500 ? '…' : ''}
                  </div>
                  <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => setStep(2)}>
                    Continue to Generate <ChevronRight size={14} />
                  </button>
                </div>
              )}

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>Past Projects</p>
                </div>
                {loadingProjects ? (
                  <SkeletonBox lines={3} />
                ) : projects.length === 0 ? (
                  <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No projects yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {projects.map(p => (
                      <button key={p.id} className="btn-ghost" style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onClick={() => { setProject(p); setResults({ script: p.script ?? '', youtubeTitle: p.youtubeTitle ?? '', description: p.description ?? '', hashtags: p.hashtags ?? '' }); setStep(2) }}>
                        <FileText size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{p.title}</span>
                        <ChevronRight size={13} style={{ marginLeft: 'auto', color: 'var(--text-3)' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && project && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Project: <strong style={{ color: 'var(--foreground)' }}>{project.title}</strong></p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-ghost" style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => setStep(3)}>Export →</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {GENERATE_BTNS.map(({ label, icon, workflow, key }) => (
                  <div key={workflow} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{icon} {label}</span>
                      <button className="btn-primary" style={{ fontSize: 12, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
                        onClick={() => handleGenerate(workflow)} disabled={generating === workflow}>
                        {generating === workflow ? <Loader2 size={12} className="animate-spin" /> : null}
                        {generating === workflow ? 'Generating…' : 'Generate'}
                      </button>
                    </div>
                    {generating === workflow ? (
                      <SkeletonBox lines={4} />
                    ) : (
                      <textarea
                        value={results[key] ?? ''}
                        onChange={e => setResults(prev => ({ ...prev, [key]: e.target.value }))}
                        className="input-base"
                        rows={key === 'script' ? 8 : 4}
                        placeholder={`${label} will appear here…`}
                        style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && project && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 600, fontSize: 16 }}>Export</p>
                <button className="btn-ghost" style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => setStep(2)}>← Back to Generate</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {GENERATE_BTNS.map(({ label, icon, key }) => (
                  <div key={key} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{icon} {label}</span>
                      <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => copyField(key)}>
                        <Copy size={13} /> Copy
                      </button>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 120, overflow: 'auto' }}>
                      {results[key] || <span style={{ color: 'var(--text-3)' }}>Not generated yet</span>}
                    </p>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={exportTxt} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Download size={15} /> Export as .txt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
