'use client'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    const stored    = localStorage.getItem('tf-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark    = stored ? stored === 'dark' : prefersDark
    apply(isDark)
    setDark(isDark)
  }, [])

  function apply(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark)
  }

  const toggle = () => {
    const next = !dark
    apply(next)
    localStorage.setItem('tf-theme', next ? 'dark' : 'light')
    setDark(next)
  }

  if (dark === null) return <div className="w-8 h-8" />

  return (
    <button onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'} className="btn-ghost w-8 h-8 p-0 rounded-lg flex items-center justify-center">
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
