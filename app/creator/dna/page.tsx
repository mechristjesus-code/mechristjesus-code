'use client'
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import {
  Dna, LayoutDashboard, Clapperboard, BarChart2, Settings,
  LogOut, X, Loader2, Palette
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'
import { ThemeToggle } from '@/components/ThemeToggle'

interface DnaData {
  niche: string
  targetAudience: string
  brandVoice: string
  writingStyle: string
  speakingStyle: string
  vocabulary: string[]
  avoidWords: string[]
  contentGoals: string[]
  editingRules: string[]
  brandColors: string[]
}

const EMPTY_DNA: DnaData = {
  niche: '', targetAudience: '', brandVoice: '',
  writingStyle: 'casual', speakingStyle: 'casual',
  vocabulary: [], avoidWords: [], contentGoals: [],
  editingRules: [], brandColors: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'],
}

const CONTENT_GOALS = [
  'Grow YouTube channel', 'Build personal brand', 'Sell products',
  'Educate audience', 'Entertain', 'Drive website traffic',
]

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

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  function add() {
    const t = input.trim()
    if (t && !values.includes(t)) onChange([...values, t])
    setInput('')
  }
  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border-color)', minHeight: 44 }}>
      {values.map(v => (
        <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--brand-muted)', color: 'var(--brand)', borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 500 }}>
          {v}
          <button onClick={() => onChange(values.filter(x => x !== v))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', lineHeight: 1, padding: 0 }}><X size={11} /></button>
        </span>
      ))}
      <input
        value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} onBlur={add}
        placeholder={placeholder ?? 'Type and press Enter'}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--foreground)', minWidth: 120, flex: 1 }}
      />
    </div>
  )
}

function dnaStrength(d: DnaData): number {
  let score = 0
  if (d.niche.trim()) score += 12
  if (d.targetAudience.trim()) score += 12
  if (d.brandVoice.trim()) score += 12
  if (d.writingStyle) score += 6
  if (d.speakingStyle) score += 6
  if (d.vocabulary.length > 0) score += 10
  if (d.avoidWords.length > 0) score += 8
  if (d.contentGoals.length > 0) score += 14
  if (d.editingRules.length > 0) score += 10
  const filledColors = d.brandColors.filter(Boolean).length
  score += Math.min(10, filledColors * 2)
  return Math.min(100, score)
}

export default function DnaPage() {
  const { toast } = useToast()
  const [dna, setDna] = useState<DnaData>(EMPTY_DNA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const colorRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    fetch('/api/ai/dna')
      .then(r => r.json())
      .then(d => setDna({ ...EMPTY_DNA, ...d }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set<K extends keyof DnaData>(key: K, val: DnaData[K]) {
    setDna(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/ai/dna', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dna),
      })
      if (!res.ok) throw new Error('Save failed')
      toast('success', 'DNA saved!')
    } catch (e: unknown) {
      toast('error', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const strength = dnaStrength(dna)
  const strengthColor = strength >= 70 ? 'var(--done-fg)' : strength >= 40 ? 'var(--prog-fg)' : 'var(--brand)'

  return (
    <div className="app-shell">
      <Sidebar active="My DNA" />
      <div className="main-area">
        <header className="main-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Dna size={18} style={{ color: 'var(--brand)' }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>Creator DNA</span>
          </div>
          <ThemeToggle />
        </header>
        <div className="main-content anim-fade-up" style={{ maxWidth: 720 }}>
          {/* DNA Strength */}
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>DNA Strength</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: strengthColor }}>{strength}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${strength}%`, background: strengthColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
              {strength < 40 ? 'Fill in more sections to strengthen your creator profile.' : strength < 70 ? 'Good start! A few more details will improve AI output quality.' : 'Your DNA profile is strong — AI outputs will be highly personalised.'}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[120, 100, 80, 90].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 14 }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Section 1: Voice & Style */}
              <div className="card p-5 space-y-4" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>🎙 Voice &amp; Style</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Niche</label>
                    <input className="input-base" placeholder="e.g. Tech reviews, Fitness" value={dna.niche} onChange={e => set('niche', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Target Audience</label>
                    <input className="input-base" placeholder="e.g. Developers 25–35" value={dna.targetAudience} onChange={e => set('targetAudience', e.target.value)} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Brand Voice</label>
                    <input className="input-base" placeholder="e.g. Bold, witty, straight to the point" value={dna.brandVoice} onChange={e => set('brandVoice', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Writing Style</label>
                    <select className="input-base" value={dna.writingStyle} onChange={e => set('writingStyle', e.target.value)}>
                      {['casual', 'professional', 'conversational', 'technical', 'storytelling'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Speaking Style</label>
                    <select className="input-base" value={dna.speakingStyle} onChange={e => set('speakingStyle', e.target.value)}>
                      {['casual', 'formal', 'energetic', 'calm', 'humorous'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Vocabulary */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>💬 Vocabulary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Preferred Words</label>
                    <TagInput values={dna.vocabulary} onChange={v => set('vocabulary', v)} placeholder="Add word + Enter" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Words to Avoid</label>
                    <TagInput values={dna.avoidWords} onChange={v => set('avoidWords', v)} placeholder="Add word + Enter" />
                  </div>
                </div>
              </div>

              {/* Section 3: Content Goals */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>🎯 Content Goals</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {CONTENT_GOALS.map(goal => (
                    <label key={goal} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={dna.contentGoals.includes(goal)}
                        onChange={e => set('contentGoals', e.target.checked ? [...dna.contentGoals, goal] : dna.contentGoals.filter(g => g !== goal))}
                        style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }}
                      />
                      {goal}
                    </label>
                  ))}
                </div>
              </div>

              {/* Section 4: Editing Rules */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>✏️ Editing Rules</h3>
                <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>One rule per line</label>
                <textarea
                  className="input-base"
                  rows={5}
                  placeholder={"Always use short sentences\nNo passive voice\nEnd with a call to action"}
                  value={dna.editingRules.join('\n')}
                  onChange={e => set('editingRules', e.target.value.split('\n'))}
                  style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
                />
              </div>

              {/* Section 5: Brand Colors */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>
                  <Palette size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--brand)' }} />
                  Brand Colors
                </h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <button
                        onClick={() => colorRefs.current[i]?.click()}
                        style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: dna.brandColors[i] ?? '#e5e7eb',
                          border: '2px solid var(--border-color)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title={dna.brandColors[i] ?? 'Pick color'}
                      />
                      <input
                        type="color"
                        ref={el => { colorRefs.current[i] = el }}
                        value={dna.brandColors[i] ?? '#6366f1'}
                        onChange={e => {
                          const updated = [...dna.brandColors]
                          updated[i] = e.target.value
                          set('brandColors', updated)
                        }}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 32 }}>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', fontSize: 15 }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Dna size={15} />}
                  {saving ? 'Saving…' : 'Save DNA'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
