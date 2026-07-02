const features = [
  {
    icon: '🔐',
    title: 'Authentication',
    description: 'Secure user registration, login, and profile management using JWT.',
  },
  {
    icon: '📊',
    title: 'Dashboard',
    description: 'Personalized overview of projects, Creator DNA insights, and AI tools.',
  },
  {
    icon: '📁',
    title: 'Projects',
    description: 'Full CRUD for managing content projects with search capabilities.',
  },
  {
    icon: '🧬',
    title: 'Creator DNA',
    description: 'Define writing preferences, prompt templates, and brand settings.',
  },
  {
    icon: '🤖',
    title: 'AI Services',
    description: 'Generate scripts, titles, hashtags, summaries, and brainstorm ideas.',
  },
  {
    icon: '🎬',
    title: 'Media Management',
    description: 'Import YouTube URLs, extract transcripts, generate subtitles.',
  },
  {
    icon: '📤',
    title: 'Export',
    description: 'Export content to Markdown, PDF, DOCX, and TXT formats.',
  },
  {
    icon: '🔗',
    title: 'REST API',
    description: 'Robust API endpoints for every service, enabling seamless integration.',
  },
];

const stack = [
  { category: 'Backend', items: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'JWT Auth', 'Redis'] },
  { category: 'Frontend', items: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand'] },
  { category: 'Infrastructure', items: ['Docker', 'GitHub Actions', 'REST API'] },
  { category: 'AI & Video', items: ['OpenAI API', 'Modular AI Services', 'FFmpeg'] },
];

const services = [
  { name: 'Auth Service', port: '8001', desc: 'User registration & JWT', color: 'bg-blue-500' },
  { name: 'AI Service', port: '8002', desc: 'Content generation', color: 'bg-purple-500' },
  { name: 'DNA Service', port: '8003', desc: 'Creator profile & prefs', color: 'bg-green-500' },
  { name: 'Memory Service', port: '8004', desc: 'Learning & history', color: 'bg-yellow-500' },
  { name: 'Media Service', port: '8005', desc: 'YouTube & transcripts', color: 'bg-red-500' },
  { name: 'Projects Service', port: '8006', desc: 'CRUD project mgmt', color: 'bg-orange-500' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            Production-Ready AI Creator Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-6">
            Creator DNA OS
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Empower content creators with intelligent tools for generating, managing, and exporting content — built on a modular microservices architecture.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://github.com/mechristjesus-code/mechristjesus-code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 transition-colors px-6 py-3 rounded-xl font-semibold text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
            <a
              href="/install"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 transition-colors px-6 py-3 rounded-xl font-semibold text-white"
            >
              🚀 Install Everything
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 px-6 py-3 rounded-xl font-semibold text-white"
            >
              Explore Architecture
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Core Features</h2>
        <p className="text-gray-400 text-center mb-12">Everything you need to build an AI-powered creator workflow</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-900 border border-white/10 rounded-xl p-6 hover:border-purple-500/40 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="bg-gray-900/50 border-y border-white/10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Microservices Architecture</h2>
          <p className="text-gray-400 text-center mb-12">Independently deployable services connected through an API Gateway</p>

          <div className="flex justify-center mb-6">
            <div className="bg-purple-600/20 border border-purple-500/50 rounded-xl px-8 py-4 text-center">
              <div className="text-sm text-purple-300 font-mono mb-1">:8000</div>
              <div className="font-bold text-white text-lg">API Gateway</div>
              <div className="text-xs text-gray-400 mt-1">Central entry point · Auth · Rate limiting · CORS</div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-px h-8 bg-gradient-to-b from-purple-500/60 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {services.map((s) => (
              <div key={s.name} className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center hover:border-white/20 transition-colors">
                <div className={`w-2 h-2 ${s.color} rounded-full mx-auto mb-2`} />
                <div className="text-xs font-mono text-gray-500 mb-1">:{s.port}</div>
                <div className="text-sm font-semibold text-white mb-1">{s.name}</div>
                <div className="text-xs text-gray-400">{s.desc}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl px-6 py-3 text-center">
              <div className="text-green-400 font-semibold">PostgreSQL</div>
              <div className="text-xs text-gray-400">Primary database</div>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-6 py-3 text-center">
              <div className="text-red-400 font-semibold">Redis</div>
              <div className="text-xs text-gray-400">Cache & rate limiting</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl px-6 py-3 text-center">
              <div className="text-yellow-400 font-semibold">OpenAI API</div>
              <div className="text-xs text-gray-400">AI generation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Tech Stack</h2>
        <p className="text-gray-400 text-center mb-12">Built with modern, production-proven technologies</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stack.map((s) => (
            <div key={s.category} className="bg-gray-900 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-purple-400 mb-3">{s.category}</h3>
              <ul className="space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-500 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="bg-gray-900/50 border-y border-white/10 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Quick Start</h2>
          <p className="text-gray-400 text-center mb-10">Get running in minutes with Docker Compose</p>
          <div className="space-y-4">
            {[
              { step: '1', label: 'Clone the repository', code: 'git clone https://github.com/mechristjesus-code/mechristjesus-code.git' },
              { step: '2', label: 'Set up environment variables', code: 'cp .env.example .env  # Edit SECRET_KEY and OPENAI_API_KEY' },
              { step: '3', label: 'Start all services', code: 'docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build' },
            ].map(({ step, label, code }) => (
              <div key={step} className="bg-gray-900 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">{step}</span>
                  <span className="font-medium text-white">{label}</span>
                </div>
                <code className="block bg-black/40 rounded-lg px-4 py-3 text-sm text-green-400 font-mono overflow-x-auto">{code}</code>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            Frontend at <code className="text-gray-300">localhost:3000</code> · API Gateway at <code className="text-gray-300">localhost:8000</code>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 text-center text-gray-500 text-sm">
        <p>Creator DNA OS · Production-ready AI creator platform · MIT License</p>
        <p className="mt-2">
          <a href="https://github.com/mechristjesus-code/mechristjesus-code" className="text-purple-400 hover:text-purple-300 transition-colors" target="_blank" rel="noopener noreferrer">
            github.com/mechristjesus-code/mechristjesus-code
          </a>
        </p>
      </footer>
    </div>
  );
}
