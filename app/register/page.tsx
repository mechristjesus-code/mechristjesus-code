'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { CheckSquare, Mail, Lock, User, ArrowRight, Check } from 'lucide-react'

const PERKS = ['Unlimited tasks', 'Team workspaces', 'Kanban board', 'Analytics']

export default function RegisterPage() {
  const router  = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Registration failed'); return }
      setUser(data.user)
      router.push('/dashboard')
    } catch { setError('Network error. Please try again.') }
    finally  { setLoading(false) }
  }

  return (
    <div className="page-shell flex min-h-screen">
      {/* Left */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12" style={{ background: 'var(--brand)', color: '#fff' }}>
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-6 h-6 opacity-90" />
          <span className="font-bold text-lg tracking-tight">TaskFlow</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-snug mb-6 opacity-95">Everything your team<br />needs to ship faster.</h2>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm opacity-90">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs opacity-40">© 2024 TaskFlow</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-muted)', border: '1px solid var(--brand-border)' }}>
              <CheckSquare className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            </div>
            <span className="font-bold" style={{ color: 'var(--foreground)' }}>TaskFlow</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Create your account</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-2)' }}>Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-3)' }} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="yourname" className="input-base pl-9" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-3)' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="input-base pl-9" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Password <span style={{ color: 'var(--text-3)' }}>(min. 6 chars)</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-3)' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="input-base pl-9" />
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-2.5 text-sm" style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-lg mt-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-2)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
