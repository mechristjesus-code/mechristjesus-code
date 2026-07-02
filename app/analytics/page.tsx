'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { CheckSquare, ArrowLeft, TrendingUp, Target, Zap, Clock } from 'lucide-react'

interface AnalyticsData {
  statusCounts:   { status: string; count: number }[]
  priorityCounts: { priority: string; count: number }[]
  trend:          { day: string; count: number }[]
}

const S_COLORS: Record<string, string> = { todo: '#94a3b8', in_progress: '#f59e0b', done: '#10b981' }
const P_COLORS: Record<string, string> = { low: '#94a3b8', medium: '#f59e0b', high: '#ef4444' }
const TOOLTIP_STYLE = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }

function Spinner() {
  return <span className="inline-block w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--brand-border)', borderTopColor: 'var(--brand)' }} />
}

export default function AnalyticsPage() {
  const router     = useRouter()
  const { user }   = useAuthStore()
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetch('/api/analytics').then((r) => r.json()).then((d) => { setData(d); setLoading(false) })
  }, [user, router])

  if (!user) return null

  const statusData = data?.statusCounts.map((s) => ({
    name:  s.status === 'in_progress' ? 'In Progress' : s.status === 'todo' ? 'To Do' : 'Done',
    value: s.count,
    color: S_COLORS[s.status] ?? '#6366f1',
  })) ?? []

  const priorityData = data?.priorityCounts.map((p) => ({
    name:  p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
    value: p.count,
    fill:  P_COLORS[p.priority] ?? '#6366f1',
  })) ?? []

  const trendData = data?.trend.map((t) => ({ day: t.day.slice(5), Tasks: t.count })) ?? []

  const total          = statusData.reduce((a, s) => a + s.value, 0)
  const doneCount      = data?.statusCounts.find((s) => s.status === 'done')?.count ?? 0
  const inProgCount    = data?.statusCounts.find((s) => s.status === 'in_progress')?.count ?? 0
  const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const recentTotal    = trendData.slice(-7).reduce((a, d) => a + d.Tasks, 0)

  const prevWeekTotal = trendData.slice(-14, -7).reduce((a, d) => a + d.Tasks, 0)
  const weekDelta     = recentTotal - prevWeekTotal
  const weekDeltaPct  = prevWeekTotal > 0 ? Math.round((weekDelta / prevWeekTotal) * 100) : null

  const kpis = [
    { label: 'Total Tasks',     value: total,                sub: 'all time',      icon: <Target     className="w-5 h-5" />, color: 'var(--brand)',   delta: null },
    { label: 'Completion Rate', value: `${completionRate}%`, sub: 'tasks done',    icon: <Zap        className="w-5 h-5" />, color: 'var(--done-fg)', delta: null },
    { label: 'In Progress',     value: inProgCount,          sub: 'active now',    icon: <Clock      className="w-5 h-5" />, color: 'var(--prog-fg)', delta: null },
    { label: 'This Week',       value: recentTotal,          sub: 'tasks created', icon: <TrendingUp className="w-5 h-5" />, color: '#8b5cf6',        delta: weekDeltaPct },
  ]

  return (
    <div className="page-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-muted)', border: '1px solid var(--brand-border)' }}>
              <CheckSquare className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>TaskFlow</span>
            <span style={{ color: 'var(--text-3)' }}>/</span>
            <span className="text-sm" style={{ color: 'var(--text-2)' }}>Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard" className="btn-ghost text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="content-wrap">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6" style={{ color: 'var(--brand)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Analytics</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner /></div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {kpis.map((k) => (
                <div key={k.label} className="card p-5 anim-fade-up">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{k.label}</span>
                    <span style={{ color: k.color }}>{k.icon}</span>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{k.value}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{k.sub}</p>
                    {k.delta !== null && (
                      <span className="text-xs font-semibold" style={{ color: k.delta >= 0 ? 'var(--done-fg)' : 'var(--high-fg)' }}>
                        {k.delta >= 0 ? '↑' : '↓'} {Math.abs(k.delta)}% vs last week
                      </span>
                    )}
                  </div>
                  {/* Sparkline mini-bars from trend data */}
                  <div className="flex items-end gap-0.5 mt-3 h-8">
                    {trendData.slice(-7).map((d, i) => {
                      const max = Math.max(...trendData.slice(-7).map((x) => x.Tasks), 1)
                      return (
                        <div key={i} className="flex-1 rounded-sm transition-all"
                          style={{ height: `${Math.max(4, (d.Tasks / max) * 100)}%`, background: k.color + '80' }} />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Completion ring + trend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Ring */}
              <div className="card p-6 flex flex-col items-center justify-center">
                <p className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Completion</p>
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--surface-2)" strokeWidth="3.2" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--done-fg)" strokeWidth="3.2"
                      strokeDasharray={`${completionRate} ${100 - completionRate}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{completionRate}%</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>done</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 w-full text-center">
                  {statusData.map((s) => (
                    <div key={s.name}>
                      <p className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{s.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 14-day trend */}
              <div className="card p-6 sm:col-span-2">
                <p className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Tasks Created — Last 14 Days</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="Tasks" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" dot={{ r: 3, fill: '#6366f1' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status pie + Priority bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card p-6">
                <p className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Status Breakdown</p>
                {!statusData.length ? (
                  <p className="text-sm" style={{ color: 'var(--text-2)' }}>No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        outerRadius={75} innerRadius={40} paddingAngle={3}>
                        {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-2)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card p-6">
                <p className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Priority Breakdown</p>
                {!priorityData.length ? (
                  <p className="text-sm" style={{ color: 'var(--text-2)' }}>No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={priorityData} barSize={44}>
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                        {priorityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
