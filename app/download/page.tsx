"use client";
import Link from "next/link";
import { useState } from "react";

const REPO = "https://github.com/mechristjesus-code/mechristjesus-code";
const RAW  = "https://raw.githubusercontent.com/mechristjesus-code/mechristjesus-code/main";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← Back</Link>
        <h1 className="font-bold text-lg">📱 Get Creator DNA OS on Your Phone</h1>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* Intro */}
        <div className="text-center mb-12">
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Three ways to run Creator DNA OS on your Android phone — choose what works best for you.
          </p>
        </div>

        {/* Option 1 — PWA */}
        <OptionCard
          number="1"
          badge="Easiest"
          badgeColor="bg-green-600"
          icon="🌐"
          title="Install as Web App (PWA)"
          subtitle="No download needed — works like a native app"
          steps={[
            "Open this website in Chrome on your Android phone",
            'Tap the ⋮ menu (top-right) → "Add to Home screen"',
            'Tap "Add" — Creator DNA OS appears on your home screen',
            "Launch it like any other app — works offline too",
          ]}
          note="Works on Android Chrome and iOS Safari. No app store required."
        />

        {/* Option 2 — Termux */}
        <OptionCard
          number="2"
          badge="Full Power"
          badgeColor="bg-purple-600"
          icon="💻"
          title="Run in Termux (Full Backend)"
          subtitle="Run the complete stack locally on your phone"
          steps={[
            "Install Termux from F-Droid (not Google Play — outdated there)",
            "Open Termux and run the one-line install command below",
            "Edit your .env file with your OpenAI API key when prompted",
            "Start the server and open localhost:3000 in your browser",
          ]}
          note="Requires ~500MB free storage. Best for developers who want full local control."
          codeBlock={`curl -fsSL ${RAW}/install.sh | bash`}
          downloadHref="/install.sh"
          downloadLabel="⬇ Download install.sh"
        />

        {/* Option 3 — Android APK */}
        <OptionCard
          number="3"
          badge="Native Feel"
          badgeColor="bg-blue-600"
          icon="📦"
          title="Build Android APK (WebView App)"
          subtitle="Compile a real .apk and install it on your phone"
          steps={[
            "Install Android Studio on your computer",
            "Clone the repo and open the android/ folder in Android Studio",
            "Click Build → Generate Signed APK (or just Run for debug)",
            "Transfer the .apk to your phone and install it",
          ]}
          note="Requires Android Studio on a PC/Mac. Produces a real installable APK."
          codeBlock={`git clone ${REPO}.git\ncd mechristjesus-code/android\n# Open in Android Studio → Build → Generate Signed Bundle/APK`}
          secondaryHref={`${REPO}/tree/main/android`}
          secondaryLabel="📂 View Android Source"
        />

        {/* Termux tips */}
        <div className="bg-gray-900 border border-yellow-500/20 rounded-2xl p-6">
          <h3 className="font-bold text-yellow-400 mb-4">⚡ Termux Quick Commands</h3>
          <div className="space-y-3 font-mono text-sm">
            {[
              { label: "Start API Gateway", cmd: "cd ~/creator-dna-os && uvicorn services.gateway.main:app --host 0.0.0.0 --port 8000" },
              { label: "Start Frontend", cmd: "cd ~/creator-dna-os/apps/web && npm run dev" },
              { label: "Edit .env", cmd: "nano ~/creator-dna-os/.env" },
              { label: "Update app", cmd: "cd ~/creator-dna-os && git pull" },
            ].map(({ label, cmd }) => (
              <div key={label}>
                <div className="text-gray-500 text-xs mb-1"># {label}</div>
                <CopyLine text={cmd} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function OptionCard({
  number, badge, badgeColor, icon, title, subtitle,
  steps, note, codeBlock, downloadHref, downloadLabel,
  secondaryHref, secondaryLabel,
}: {
  number: string; badge: string; badgeColor: string; icon: string;
  title: string; subtitle: string; steps: string[]; note: string;
  codeBlock?: string; downloadHref?: string; downloadLabel?: string;
  secondaryHref?: string; secondaryLabel?: string;
}) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center font-bold text-purple-400 flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-2xl">{icon}</span>
            <h2 className="font-bold text-xl text-white">{title}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full text-white font-semibold ${badgeColor}`}>{badge}</span>
          </div>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>

      <ol className="space-y-2 mb-5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-300">
            <span className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center text-xs text-gray-500 flex-shrink-0 mt-0.5">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {codeBlock && <CopyLine text={codeBlock} multiLine />}

      <p className="text-xs text-gray-500 mt-4 italic">{note}</p>

      {(downloadHref || secondaryHref) && (
        <div className="flex flex-wrap gap-3 mt-5">
          {downloadHref && (
            <a href={downloadHref} download className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 transition-colors px-4 py-2 rounded-xl text-sm font-semibold text-white">
              {downloadLabel}
            </a>
          )}
          {secondaryHref && (
            <a href={secondaryHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold text-white">
              {secondaryLabel}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function CopyLine({ text, multiLine = false }: { text: string; multiLine?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="relative group bg-black/40 border border-white/10 rounded-xl overflow-hidden">
      <pre className={`px-4 py-3 text-sm text-green-400 font-mono overflow-x-auto ${multiLine ? "whitespace-pre" : "whitespace-nowrap"}`}>
        {text}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 transition-colors text-xs text-gray-300 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100"
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}
