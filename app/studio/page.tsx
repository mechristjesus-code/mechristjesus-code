"use client";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";

// ── Tab type ───────────────────────────────────────────────────
type Tab = "actor" | "generate" | "youtube" | "remix" | "monetize";

// ── Shared helpers ─────────────────────────────────────────────
export function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(",");
      const mime = header.match(/:(.*?);/)?.[1] ?? file.type;
      res({ base64, mime });
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span><span>{value}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-700"
          style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ErrorBox({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
      <span className="text-xl">⚠️</span>
      <div className="flex-1">
        <div className="font-semibold text-red-300 mb-1">Something went wrong</div>
        <div className="text-xs text-red-400/80 font-mono break-all">{msg}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="text-xs bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 px-3 py-1.5 rounded-lg text-red-300 font-semibold flex-shrink-0">
          Retry
        </button>
      )}
    </div>
  );
}

// ── Tab imports (defined below) ────────────────────────────────
import { ActorTab }    from "./tabs/ActorTab";
import { GenerateTab } from "./tabs/GenerateTab";
import { YouTubeTab }  from "./tabs/YouTubeTab";
import { RemixTab }    from "./tabs/RemixTab";
import { MonetizeTab } from "./tabs/MonetizeTab";

// ── Main page ──────────────────────────────────────────────────
const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: "actor",    icon: "🎭", label: "AI Actor"  },
  { key: "generate", icon: "🎬", label: "Generate"  },
  { key: "youtube",  icon: "▶️",  label: "YouTube"   },
  { key: "remix",    icon: "🔀", label: "Remix"     },
  { key: "monetize", icon: "💰", label: "Monetize"  },
];

export default function StudioPage() {
  const [tab, setTab] = useState<Tab>("actor");

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← Back</Link>
        <span className="text-xl">🎬</span>
        <h1 className="font-bold text-lg">Creator Studio</h1>
        <span className="ml-auto text-xs text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded-full">
          AI Powered
        </span>
      </header>

      {/* Tab bar */}
      <div className="bg-gray-900/60 border-b border-white/10 px-4">
        <div className="flex max-w-4xl mx-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                tab === t.key
                  ? "border-purple-500 text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {tab === "actor"    && <ActorTab />}
        {tab === "generate" && <GenerateTab />}
        {tab === "youtube"  && <YouTubeTab />}
        {tab === "remix"    && <RemixTab />}
        {tab === "monetize" && <MonetizeTab />}
      </div>
    </div>
  );
}
