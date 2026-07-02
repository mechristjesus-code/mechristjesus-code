import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/studio",   label: "🎬 Studio"  },
  { href: "/skills",   label: "🧠 Skills"  },
  { href: "/install",  label: "🚀 Install" },
  { href: "/download", label: "📱 Mobile"  },
];

const STUDIO_FEATURES = [
  { icon: "🎭", title: "AI Actor",       desc: "Upload your face — AI puts you on screen as the actor in any scene or background." },
  { icon: "🔀", title: "YouTube Remix",  desc: "Paste any YouTube URL. AI rewrites the script, swaps the actor, or transfers the style." },
  { icon: "🎬", title: "Generate",       desc: "Create AI photos or videos of yourself in any style — Cinematic, Anime, Cyberpunk, and more." },
  { icon: "💰", title: "Monetize",       desc: "Auto-generate SEO title, description, tags, thumbnail — then upload directly to YouTube." },
];

const PLATFORM_FEATURES = [
  { icon: "🧠", title: "Skills Hub",         desc: "Upload any skill file. AI reads it and auto-generates structured capability cards." },
  { icon: "🔐", title: "Auth & Projects",     desc: "JWT-secured auth, full CRUD project management with search." },
  { icon: "🧬", title: "Creator DNA",         desc: "Define your writing style, prompt templates, and brand voice. AI learns from your edits." },
  { icon: "📤", title: "Export Anywhere",     desc: "Export content to Markdown, PDF, DOCX, or TXT with one click." },
  { icon: "📱", title: "Mobile Ready",        desc: "Install as PWA, run via Termux on Android, or build a native APK with one command." },
  { icon: "⚡", title: "Microservices",       desc: "6 independent FastAPI services — Auth, AI, DNA, Memory, Media, Projects — behind an API Gateway." },
];

const SKILLS = [
  { name: "fullstack-scaffolder", tags: ["Microservices", "FastAPI", "React", "Docker"],    desc: "Auto-scaffold production full-stack monorepos" },
  { name: "creator-dna-os",       tags: ["AI", "Content", "YouTube", "OpenAI"],             desc: "Complete AI creator platform skills" },
  { name: "var-syntax",           tags: ["Documents", "Variables", "Logic", "Automation"],  desc: "Document variable syntax reference" },
];

const STACK = [
  { label: "Backend",        items: ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "JWT"] },
  { label: "Frontend",       items: ["React 18", "TypeScript", "Tailwind CSS", "Zustand"] },
  { label: "AI & Media",     items: ["OpenAI GPT-4o", "Doubao Seedance", "GPT-Image-2", "FFmpeg"] },
  { label: "Infrastructure", items: ["Docker Compose", "GitHub Actions", "Android APK", "PWA"] },
];

// ── Page ──────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Hero />
      <StudioSection />
      <PlatformSection />
      <SkillsSection />
      <StackSection />
      <QuickStart />
      <Footer />
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <span className="text-2xl">🧬</span>
          <span className="hidden sm:inline">Creator DNA OS</span>
        </Link>
        <div className="flex items-center gap-1 flex-wrap">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              {l.label}
            </Link>
          ))}
          <a href="https://github.com/mechristjesus-code/mechristjesus-code"
            target="_blank" rel="noopener noreferrer"
            className="ml-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-white font-semibold transition-all">
            GitHub ↗
          </a>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-950/60 to-gray-950 border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,60,230,0.25),transparent)]" />
      <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-6">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          Production-Ready AI Creator Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
          <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Creator DNA OS
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Put <strong className="text-white">yourself</strong> in any AI video. Remix YouTube. Auto-upload with full monetization metadata.
          Build skills. Run everything on your phone.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/studio"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-7 py-3.5 rounded-2xl font-bold text-white shadow-lg shadow-purple-900/40 transition-all">
            🎬 Open Creator Studio
          </Link>
          <Link href="/skills"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 px-7 py-3.5 rounded-2xl font-bold text-white transition-all">
            🧠 Skills Hub
          </Link>
          <Link href="/install"
            className="inline-flex items-center gap-2 bg-green-600/80 hover:bg-green-500 px-7 py-3.5 rounded-2xl font-bold text-white transition-all">
            🚀 Install on Phone
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap gap-4 justify-center text-sm text-gray-500">
          {["FastAPI Microservices", "React + TypeScript", "OpenAI GPT-4o", "Android APK", "PWA", "GitHub Actions CI/CD"].map((t) => (
            <span key={t} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Studio Section ────────────────────────────────────────────
function StudioSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <SectionLabel emoji="🎬" label="Creator Studio" />
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">You. On Screen. Anywhere.</h2>
      <p className="text-gray-400 mb-10 max-w-xl">Upload your photo once. AI does the rest — actor videos, remixed content, YouTube uploads, monetization.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {STUDIO_FEATURES.map((f) => (
          <Link key={f.title} href="/studio"
            className="group bg-gray-900 border border-white/10 hover:border-purple-500/40 rounded-2xl p-6 transition-all">
            <div className="text-3xl mb-3">{f.icon}</div>
            <div className="font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">{f.title}</div>
            <div className="text-sm text-gray-400 leading-relaxed">{f.desc}</div>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link href="/studio"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-semibold text-white transition-all">
          Open Creator Studio →
        </Link>
      </div>
    </section>
  );
}

// ── Platform Section ──────────────────────────────────────────
function PlatformSection() {
  return (
    <section className="bg-gray-900/50 border-y border-white/10 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionLabel emoji="🧬" label="Platform" />
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything You Need</h2>
        <p className="text-gray-400 mb-10 max-w-xl">Full microservices backend, AI tools, mobile support — all in one repo.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_FEATURES.map((f) => (
            <div key={f.title} className="bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-white mb-1">{f.title}</div>
              <div className="text-sm text-gray-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Skills Section ────────────────────────────────────────────
function SkillsSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <SectionLabel emoji="🧠" label="Skills Library" />
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">3 Skills Included</h2>
      <p className="text-gray-400 mb-10 max-w-xl">Upload any skill file to the Skills Hub — AI auto-generates capability cards instantly.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {SKILLS.map((s) => (
          <div key={s.name} className="bg-gray-900 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
            <div className="font-mono text-xs text-purple-400 mb-2 uppercase tracking-wider">{s.name}</div>
            <div className="text-sm text-gray-300 mb-3 leading-relaxed">{s.desc}</div>
            <div className="flex flex-wrap gap-1.5">
              {s.tags.map((t) => (
                <span key={t} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5 text-gray-500">#{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link href="/skills"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-3 rounded-xl font-semibold text-white transition-all">
          Open Skills Hub →
        </Link>
      </div>
    </section>
  );
}

// ── Stack Section ─────────────────────────────────────────────
function StackSection() {
  return (
    <section className="bg-gray-900/50 border-y border-white/10 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionLabel emoji="⚙️" label="Tech Stack" />
        <h2 className="text-3xl font-bold text-white mb-10">Built with Modern Tech</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {STACK.map((s) => (
            <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-5">
              <div className="font-bold text-purple-400 mb-3 text-sm uppercase tracking-wide">{s.label}</div>
              <ul className="space-y-1.5">
                {s.items.map((item) => (
                  <li key={item} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-500 rounded-full flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Quick Start ───────────────────────────────────────────────
function QuickStart() {
  const steps = [
    { n: "1", label: "Clone the repo", code: "git clone https://github.com/mechristjesus-code/mechristjesus-code.git" },
    { n: "2", label: "Set your API key", code: "cp .env.example .env  # add OPENAI_API_KEY + SECRET_KEY" },
    { n: "3", label: "Start everything", code: "docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build" },
  ];
  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <SectionLabel emoji="🚀" label="Quick Start" />
      <h2 className="text-3xl font-bold text-white mb-10">Up in 3 Steps</h2>
      <div className="space-y-4">
        {steps.map(({ n, label, code }) => (
          <div key={n} className="bg-gray-900 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{n}</span>
              <span className="font-semibold text-white">{label}</span>
            </div>
            <code className="block bg-black/40 rounded-xl px-4 py-3 text-sm text-green-400 font-mono overflow-x-auto">{code}</code>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        Frontend at <code className="text-gray-300">localhost:3000</code> · API Gateway at <code className="text-gray-300">localhost:8000</code>
      </p>
      <div className="mt-6 text-center">
        <Link href="/install"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl font-semibold text-white transition-all">
          🚀 Or use the Unified Installer →
        </Link>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-center text-gray-500 text-sm">
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        {[
          { href: "/studio",   label: "Creator Studio" },
          { href: "/skills",   label: "Skills Hub"     },
          { href: "/install",  label: "Installer"      },
          { href: "/download", label: "Mobile Apps"    },
          { href: "https://github.com/mechristjesus-code/mechristjesus-code", label: "GitHub" },
        ].map((l) => (
          <a key={l.label} href={l.href}
            className="hover:text-white transition-colors"
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}>
            {l.label}
          </a>
        ))}
      </div>
      <p>Creator DNA OS · AI Creator Platform · MIT License</p>
    </footer>
  );
}

// ── Helper ────────────────────────────────────────────────────
function SectionLabel({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">
      <span>{emoji}</span>{label}
    </div>
  );
}
