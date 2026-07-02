'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem { id: string; type: ToastType; title: string; message?: string }
interface ToastCtx  { toast: (type: ToastType, title: string, message?: string) => void }

const Ctx = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

const ICON = {
  success: <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--done-fg)' }} />,
  error:   <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--high-fg)' }} />,
  info:    <Info className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {ICON[t.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{t.title}</p>
              {t.message && <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{t.message}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-40 hover:opacity-80 transition">
              <X className="w-3.5 h-3.5" style={{ color: 'var(--text-2)' }} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
