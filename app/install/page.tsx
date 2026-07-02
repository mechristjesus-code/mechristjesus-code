"use client";
import { useState } from "react";
import Link from "next/link";

const RAW = "https://raw.githubusercontent.com/mechristjesus-code/mechristjesus-code/main";

type Phase = "idle" | "running" | "done";

const STEPS = [
  { id: 1, icon: "📦", label: "Update Termux & install core packages" },
  { id: 2, icon: "📥", label: "Clone Creator DNA OS repository" },
  { id: 3, icon: "🐍", label: "Install Python backend dependencies" },
  { id: 4, icon: "⚛️",  label: "Install Node.js frontend dependencies" },
  { id: 5, icon: "⚙️",  label: "Set up environment variables (.env)" },
  { id: 6, icon: "🌐", label: "Configure PWA browser shortcut" },
  { id: 7, icon: "📱", label: "Generate APK build script" },
];

export default function InstallPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const CMD = `curl -fsSL ${RAW}/setup-all.sh | bash`;

  function copyCmd() {
    navigator.clipboard.writeText(CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function simulate() {
    setPhase("running");
    setActive(1);
    let i = 1;
    const tick = () => {
      if (i <= STEPS.length) {
        setActive(i);
        i++;
        setTimeout(tick, 700 + Math.random() * 400);
      } else {
        setActive(STEPS.length + 1);
        setPhase("done");
      }
    };
    setTimeout(tick, 600);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900/80 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← Back</Link>
        <h1 className="font-bold text-lg">🚀 Unified Installer — All 3 Options at Once</h1>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="text-5xl mb-4">🧬</div>
          <h2 className="text-3xl font-bold mb-3">One Command. Everything Installed.</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Run a single command in Termux and it sets up your <strong className="text-white">backend server</strong>,
            your <strong className="text-white">PWA shortcut</strong>, and your <strong className="text-white">APK builder</strong> — all at the same time.
          </p>
        </div>

        {/* What gets installed */}
        <WhatYouGet />

        {/* The command */}
        <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-1">Step 1 — Open Termux and run:</h3>
          <p className="text-gray-400 text-sm mb-4">
            Install <a href="https://f-droid.org/packages/com.termux/" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Termux from F-Droid</a> first, then paste this command.
          </p>
          <div className="relative group bg-black/50 border border-white/10 rounded-xl overflow-hidden">
            <pre className="px-4 py-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-nowrap">{CMD}</pre>
            <button
              onClick={copyCmd}
              className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-500 transition-colors text-xs text-white px-3 py-1.5 rounded-lg font-semibold"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <a
            href="/setup-all.sh"
            download
            className="inline-flex items-center gap-2 mt-4 bg-white/10 hover:bg-white/15 transition-colors border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold"
          >
            ⬇ Download setup-all.sh
          </a>
        </div>

        {/* Progress simulator */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg">Install Progress</h3>
            {phase === "idle" && (
              <button
                onClick={simulate}
                className="bg-purple-600 hover:bg-purple-500 transition-colors px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Preview Steps
              </button>
            )}
            {phase === "done" && (
              <span className="text-green-400 font-semibold text-sm">✅ Complete!</span>
            )}
          </div>

          <div className="space-y-3">
            {STEPS.map((s) => {
              const isDone    = active > s.id;
              const isActive  = active === s.id && phase === "running";
              const isPending = active < s.id;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                    isDone   ? "bg-green-900/20 border-green-500/30" :
                    isActive ? "bg-purple-900/30 border-purple-500/50 animate-pulse" :
                               "bg-white/5 border-white/5 opacity-40"
                  }`}
                >
                  <span className="text-xl w-7 text-center">{s.icon}</span>
                  <span className={`text-sm flex-1 ${isDone ? "text-green-300" : isActive ? "text-white" : "text-gray-500"}`}>
                    {s.label}
                  </span>
                  <span className="text-sm w-5 text-center">
                    {isDone ? "✓" : isActive ? <Spinner /> : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {phase === "done" && <SuccessBlock />}
        </div>

        {/* After install steps */}
        <AfterInstall />

      </div>
    </div>
  );
}

function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />;
}

function WhatYouGet() {
  const items = [
    { icon: "💻", color: "border-purple-500/40 bg-purple-900/10", title: "Termux Backend", desc: "FastAPI gateway + all 6 microservices running locally on your phone" },
    { icon: "🌐", color: "border-green-500/40 bg-green-900/10",   title: "PWA Shortcut",  desc: "Browser shortcut file → add to home screen, works like a native app" },
    { icon: "📦", color: "border-blue-500/40 bg-blue-900/10",     title: "APK Builder",   desc: "build-apk.sh script ready to compile a real Android APK with one command" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.title} className={`border rounded-xl p-4 ${it.color}`}>
          <div className="text-2xl mb-2">{it.icon}</div>
          <div className="font-bold text-white mb-1">{it.title}</div>
          <div className="text-xs text-gray-400">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}

function SuccessBlock() {
  return (
    <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-xl p-5">
      <div className="font-bold text-green-400 mb-3">🎉 Installation finished! Next steps:</div>
      <ol className="space-y-2 text-sm text-gray-300">
        <li className="flex gap-2"><span className="text-green-400 font-bold">1.</span> Edit your .env: <code className="text-yellow-300 bg-black/30 px-1 rounded">nano ~/creator-dna-os/.env</code></li>
        <li className="flex gap-2"><span className="text-green-400 font-bold">2.</span> Start everything: <code className="text-yellow-300 bg-black/30 px-1 rounded">bash ~/creator-dna-os/start.sh</code></li>
        <li className="flex gap-2"><span className="text-green-400 font-bold">3.</span> Open <code className="text-yellow-300 bg-black/30 px-1 rounded">localhost:3000</code> in Chrome → Add to Home Screen</li>
        <li className="flex gap-2"><span className="text-green-400 font-bold">4.</span> (Optional) Build APK: <code className="text-yellow-300 bg-black/30 px-1 rounded">bash ~/creator-dna-os/build-apk.sh</code></li>
      </ol>
    </div>
  );
}

function AfterInstall() {
  const cmds = [
    { label: "Start everything",    cmd: "bash ~/creator-dna-os/start.sh" },
    { label: "Edit your API key",   cmd: "nano ~/creator-dna-os/.env" },
    { label: "Build the APK",       cmd: "bash ~/creator-dna-os/build-apk.sh" },
    { label: "Update to latest",    cmd: "git -C ~/creator-dna-os pull && bash ~/creator-dna-os/start.sh" },
  ];
  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
      <h3 className="font-bold text-lg mb-4">⚡ After Install — Quick Commands</h3>
      <div className="space-y-3">
        {cmds.map(({ label, cmd }) => (
          <CopyRow key={label} label={label} cmd={cmd} />
        ))}
      </div>
    </div>
  );
}

function CopyRow({ label, cmd }: { label: string; cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1"># {label}</div>
      <div className="relative group bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center">
        <pre className="px-4 py-2.5 text-sm text-green-400 font-mono overflow-x-auto flex-1 whitespace-nowrap">{cmd}</pre>
        <button
          onClick={() => { navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex-shrink-0 px-3 py-2 text-xs bg-white/10 hover:bg-white/20 transition-colors text-gray-300 border-l border-white/10"
        >
          {copied ? "✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}
