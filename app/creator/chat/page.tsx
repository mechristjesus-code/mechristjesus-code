'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dna, MessageSquare, Home, FlaskConical, Layers, Users, LayoutDashboard,
  Send, Trash2, LogOut, ChevronRight, Bot
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Persona { id: string; name: string; emoji?: string; description?: string; }
interface Message { id: string; role: 'user' | 'assistant'; content: string; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatorChatPage() {
  return <ChatPageInner />;
}

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auth guard
  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);

  // Load personas
  useEffect(() => {
    fetch('/api/ai/personas')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const list: Persona[] = Array.isArray(data) ? data : (data.personas ?? []);
        setPersonas(list);
        const preselect = searchParams.get('persona');
        if (preselect) setSelectedPersonaId(preselect);
        else if (list.length > 0) setSelectedPersonaId(list[0].id);
      })
      .catch(() => toast('error', 'Failed to load personas'));
  }, [searchParams]); // eslint-disable-line

  // Scroll to bottom on new messages
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streaming]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const selectedPersona = personas.find(p => p.id === selectedPersonaId);

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming || !selectedPersonaId) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, personaId: selectedPersonaId, projectId: null }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(await res.text());

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const raw = trimmed.slice(5).trim();
          if (raw === '[DONE]') continue;
          try {
            const json = JSON.parse(raw);
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + delta } : m
              ));
            }
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        toast('error', 'Chat error', (err as Error).message);
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      }
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, selectedPersonaId, toast]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!user) return null;

  const navItems = [
    { href: '/creator', label: 'OS Home', icon: Home },
    { href: '/creator/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/creator/studio', label: 'Studio', icon: FlaskConical },
    { href: '/creator/dna', label: 'My DNA', icon: Dna },
    { href: '/creator/personas', label: 'AI Team', icon: Users },
    { href: '/creator/modules', label: 'AI Modules', icon: Layers },
    { href: '/dashboard', label: 'Task Board', icon: LayoutDashboard },
  ];

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Dna size={22} style={{ color: 'var(--brand)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--foreground)' }}>Creator DNA OS</span>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div className="sidebar-section">
            <div className="sidebar-label">Navigation</div>
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`sidebar-item${href === '/creator/chat' ? ' active' : ''}`}>
                <Icon size={16} />
                <span>{label}</span>
                {href === '/creator/chat' && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </Link>
            ))}
          </div>

          {personas.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-label">Personas</div>
              {personas.map(p => (
                <button key={p.id}
                  className={`sidebar-item${p.id === selectedPersonaId ? ' active' : ''}`}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setSelectedPersonaId(p.id)}>
                  <span style={{ fontSize: '1rem' }}>{p.emoji ?? '🤖'}</span>
                  <span style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>
            {user.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</span>
          <ThemeToggle />
          <button className="btn-ghost" style={{ padding: '4px', borderRadius: 6 }} onClick={logout} title="Sign out"><LogOut size={14} /></button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="main-area">
        <header className="main-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={18} style={{ color: 'var(--brand)' }} />
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>AI Chat</h1>
            {selectedPersona && (
              <span className="chip" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{selectedPersona.emoji ?? '🤖'}</span>
                <span>{selectedPersona.name}</span>
              </span>
            )}
          </div>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }} onClick={clearChat}>
            <Trash2 size={14} /> Clear
          </button>
        </header>

        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 && !streaming && (
              <div className="anim-fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.55, textAlign: 'center' }}>
                <Bot size={48} style={{ color: 'var(--brand)' }} />
                <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', maxWidth: 280 }}>Select a persona and start chatting…</p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className="anim-scale-in" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'user' ? (
                  <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: '16px 16px 4px 16px', background: 'var(--brand)', color: 'var(--high-fg)', fontSize: '0.9rem', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                ) : (
                  <div className="card" style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--foreground)' }}>
                    {msg.content || (streaming && (
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                        {[0, 1, 2].map(i => (
                          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                        ))}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator for first token */}
            {streaming && messages[messages.length - 1]?.content === '' && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div className="card" style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--surface)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              className="input-base"
              rows={1}
              placeholder={selectedPersona ? `Message ${selectedPersona.name}…` : 'Select a persona first…'}
              value={input}
              disabled={!selectedPersonaId || streaming}
              onChange={e => { setInput(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, resize: 'none', minHeight: 42, maxHeight: 160, lineHeight: 1.5, paddingTop: 10, paddingBottom: 10, overflow: 'auto' }}
            />
            <button
              className="btn-primary"
              disabled={!input.trim() || streaming || !selectedPersonaId}
              onClick={sendMessage}
              style={{ padding: '10px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={15} />
            </button>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
