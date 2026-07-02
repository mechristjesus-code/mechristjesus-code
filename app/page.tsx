import Link from 'next/link'
import {
  CheckSquare, ArrowRight, Shield, Zap, LayoutGrid,
  Users, Tag, BarChart2, Activity, Check
} from 'lucide-react'

const FEATURES = [
  { icon: CheckSquare, color: '#6366f1', title: 'Full Task CRUD',       desc: 'Create, edit, prioritize and delete tasks in seconds with inline editing.' },
  { icon: LayoutGrid,  color: '#8b5cf6', title: 'Kanban + List Views',  desc: 'Switch between list and drag-and-drop Kanban board at any time.' },
  { icon: Tag,         color: '#0ea5e9', title: 'Tags & Categories',    desc: 'Color-coded tags help you group tasks any way you like.' },
  { icon: Users,       color: '#10b981', title: 'Team Collaboration',   desc: 'Create teams, share invite codes, assign tasks to teammates.' },
  { icon: Activity,    color: '#f59e0b', title: 'Activity Feed',        desc: 'Every action logged — always know what changed and when.' },
  { icon: BarChart2,   color: '#ec4899', title: 'Analytics Dashboard',  desc: 'Trend charts, status breakdown, and completion rate at a glance.' },
]

const TESTIMONIALS = [
  { name: 'Alex M.', role: 'Product Manager', quote: 'TaskFlow replaced three tools for our team. The Kanban view alone saved us hours of standups.' },
  { name: 'Priya S.', role: 'Engineer Lead',   quote: 'Clean, fast, and the analytics dashboard is genuinely useful — not just a pretty chart.' },
  { name: 'Jordan L.', role: 'Founder',         quote: 'Onboarded the whole team in 10 minutes. Invite codes are genius.' },
]

export default function Home() {
  return (
    <div className="page-shell">
      {/* ── Nav ── */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="flex items-center gap-2.5">
            <div style={{ background: 'var(--brand-muted)', border: '1px solid var(--brand-border)' }} className="w-8 h-8 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>TaskFlow</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="content-wrap pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-8 text-xs font-semibold" style={{ background: 'var(--brand-muted)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}>
          <Zap className="w-3 h-3" /> Full-stack · Open architecture · Production ready
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6" style={{ color: 'var(--foreground)' }}>
          The task manager your<br />
          <span style={{ color: 'var(--brand)' }}>team will actually use.</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Kanban boards, team workspaces, color tags, analytics and a full activity feed — all in one place, all working out of the box.
        </p>

        <div className="flex items-center gap-3 justify-center flex-wrap mb-10">
          <Link href="/register" className="btn-primary px-6 py-3 text-base rounded-xl">
            Start free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="btn-ghost px-6 py-3 text-base rounded-xl">Sign in</Link>
        </div>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-6 mb-16 flex-wrap">
          {['No credit card', 'Unlimited tasks', 'Team workspaces', 'Dark mode'].map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
              <Check className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} /> {t}
            </span>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-4xl border" style={{ borderColor: 'var(--border-color)' }}>
          {/* Mockup topbar */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border-color)' }}>
            <span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-amber-400" /><span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="flex-1 mx-4 h-5 rounded" style={{ background: 'var(--surface-3)' }} />
          </div>
          {/* Mockup content */}
          <div className="grid grid-cols-4 text-left" style={{ background: 'var(--surface)', minHeight: 260 }}>
            {/* Sidebar */}
            <div className="col-span-1 p-4 space-y-2" style={{ borderRight: '1px solid var(--border-color)', background: 'var(--sidebar-bg)' }}>
              {['Tasks','Activity','Teams','Tags'].map((n, i) => (
                <div key={n} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs" style={{ background: i === 0 ? 'var(--brand-muted)' : 'transparent', color: i === 0 ? 'var(--brand)' : 'var(--text-2)', fontWeight: i === 0 ? 600 : 400 }}>
                  <span className="w-3 h-3 rounded" style={{ background: ['#6366f1','#f59e0b','#10b981','#ec4899'][i] + '60' }} />{n}
                </div>
              ))}
            </div>
            {/* Main */}
            <div className="col-span-3 p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[['12','Total'],['4','To Do'],['3','In Prog'],['5','Done']].map(([v, l]) => (
                  <div key={l} className="rounded-lg p-2 text-center" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{v}</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{l}</p>
                  </div>
                ))}
              </div>
              {[
                { title: 'Build landing page', status: 'done',        pri: 'high',   tag: '#6366f1' },
                { title: 'Set up CI/CD pipeline', status: 'in_progress', pri: 'medium', tag: '#10b981' },
                { title: 'Write unit tests',  status: 'todo',        pri: 'low',    tag: '#f59e0b' },
              ].map((t) => (
                <div key={t.title} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-color)' }}>
                  <span className="text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap" style={{
                    background: t.status === 'done' ? 'var(--done-bg)' : t.status === 'in_progress' ? 'var(--prog-bg)' : 'var(--todo-bg)',
                    color:      t.status === 'done' ? 'var(--done-fg)' : t.status === 'in_progress' ? 'var(--prog-fg)' : 'var(--todo-fg)',
                    borderColor:t.status === 'done' ? 'var(--done-fg)' : t.status === 'in_progress' ? 'var(--prog-fg)' : 'var(--todo-fg)',
                  }}>
                    {t.status === 'done' ? '✓ Done' : t.status === 'in_progress' ? '⟳ In Progress' : '○ To Do'}
                  </span>
                  <span className="text-xs flex-1 font-medium" style={{ color: 'var(--foreground)', textDecoration: t.status === 'done' ? 'line-through' : 'none', opacity: t.status === 'done' ? 0.6 : 1 }}>{t.title}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: t.tag + '20', color: t.tag }}>{t.pri}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ticker ── */}
      <section className="content-wrap py-12" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[['6', 'Core features'],['∞', 'Tasks supported'],['100%', 'Open source'],['0', 'Monthly cost']].map(([v, l]) => (
            <div key={l}>
              <p className="text-4xl font-bold mb-1" style={{ color: 'var(--brand)' }}>{v}</p>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="content-wrap py-16" style={{ borderTop: '1px solid var(--border-color)' }}>
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--foreground)' }}>Everything you need, nothing you don&apos;t</h2>
        <p className="text-center mb-12 text-sm" style={{ color: 'var(--text-2)' }}>Six core features that cover the full lifecycle of your work.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.color + '18', border: `1px solid ${f.color}30` }}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold mb-1.5 text-sm" style={{ color: 'var(--foreground)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="content-wrap py-16" style={{ borderTop: '1px solid var(--border-color)' }}>
        <h2 className="text-2xl font-bold text-center mb-12" style={{ color: 'var(--foreground)' }}>Loved by teams</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card p-6">
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-2)' }}>&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand)' }}>{t.name[0]}</div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="content-wrap py-20 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="rounded-2xl p-12" style={{ background: 'var(--brand-muted)', border: '1px solid var(--brand-border)' }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Ready to ship more?</h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-2)' }}>Create an account in 30 seconds. No setup, no configuration.</p>
          <Link href="/register" className="btn-primary px-8 py-3 text-base rounded-xl inline-flex">
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="content-wrap py-8" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4 text-xs" style={{ color: 'var(--text-3)' }}>
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>TaskFlow</span>
          <span>Built with Next.js, PostgreSQL &amp; Drizzle ORM</span>
        </div>
      </footer>
    </div>
  )
}
