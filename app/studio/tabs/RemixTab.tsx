"use client";
import { useRef, useState } from "react";
import { fileToBase64, ErrorBox, ProgressBar } from "../page";
import type { RemixMode } from "@/app/api/studio/youtube/remix/route";

type Status = "idle" | "loading" | "polling" | "done" | "error";

interface RemixResult {
  remixText: string;
  thumbnailUrl: string | null;
  actorTaskId: string | null;
  originalTitle: string;
  mode: RemixMode;
}

const MODES: { key: RemixMode; icon: string; label: string; desc: string }[] = [
  { key: "ai_script",     icon: "✍️",  label: "AI Rewrite",     desc: "Rewrite the whole script — same topic, fresh angle" },
  { key: "shorts_cut",    icon: "⚡",  label: "Shorts Cutter",  desc: "Extract top 3 clip ideas optimized for YouTube Shorts" },
  { key: "reaction",      icon: "😲",  label: "Reaction Script",desc: "Generate a reaction/commentary script on the video" },
  { key: "style_transfer",icon: "🎨",  label: "Style Transfer", desc: "Regenerate the thumbnail in a completely new visual style" },
  { key: "actor_swap",    icon: "🎭",  label: "Actor Swap",     desc: "Replace the on-screen actor with your own face" },
  { key: "mashup",        icon: "🔀",  label: "Mashup",         desc: "Blend two videos into one brand-new concept" },
];

const STYLES: string[] = [
  "Cyberpunk neon", "Anime illustration", "Minimalist flat design",
  "3D render", "Retro 80s", "Cinematic movie poster",
  "Watercolor painting", "Bold typographic",
];

export function RemixTab() {
  const [videoUrl,   setVideoUrl]   = useState("");
  const [videoUrl2,  setVideoUrl2]  = useState("");
  const [mode,       setMode]       = useState<RemixMode>("ai_script");
  const [style,      setStyle]      = useState(STYLES[0]);
  const [faceFile,   setFaceFile]   = useState<File | null>(null);
  const [facePreview,setFacePreview]= useState<string | null>(null);
  const [status,     setStatus]     = useState<Status>("idle");
  const [progress,   setProgress]   = useState(0);
  const [result,     setResult]     = useState<RemixResult | null>(null);
  const [videoResult,setVideoResult]= useState<string | null>(null);
  const [errMsg,     setErrMsg]     = useState("");
  const [copied,     setCopied]     = useState(false);
  const faceRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function parseVideoId(input: string): string {
    try {
      const url = new URL(input.startsWith("http") ? input : `https://${input}`);
      return url.searchParams.get("v") ?? url.pathname.split("/").pop() ?? input;
    } catch { return input; }
  }

  async function remix() {
    const videoId  = parseVideoId(videoUrl.trim());
    const videoId2 = videoUrl2.trim() ? parseVideoId(videoUrl2.trim()) : undefined;
    if (!videoId) return;
    setStatus("loading"); setProgress(15); setErrMsg("");
    setResult(null); setVideoResult(null);
    try {
      let faceBase64: string | undefined;
      let faceMime:   string | undefined;
      if (mode === "actor_swap" && faceFile) {
        const enc = await fileToBase64(faceFile);
        faceBase64 = enc.base64; faceMime = enc.mime;
      }
      setProgress(30);
      const res = await fetch("/api/studio/youtube/remix", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, videoId2, mode, style, faceBase64, faceMime }),
      });
      const j = await res.json();
      if (!res.ok || j.error) throw new Error(j.error);
      setResult(j); setProgress(j.actorTaskId ? 50 : 100);

      if (j.actorTaskId) {
        setStatus("polling");
        let elapsed = 0;
        pollRef.current = setInterval(async () => {
          elapsed += 5;
          setProgress(Math.min(50 + elapsed * 2, 92));
          const p  = await fetch(`/api/studio/poll?taskId=${encodeURIComponent(j.actorTaskId)}`);
          const pj = await p.json();
          if (pj.status === "done") {
            clearInterval(pollRef.current!);
            setVideoResult(pj.videoUrl); setProgress(100); setStatus("done");
          } else if (pj.status === "failed") {
            clearInterval(pollRef.current!); throw new Error("Video render failed");
          }
        }, 5000);
      } else {
        setStatus("done");
      }
    } catch (e: unknown) {
      if (pollRef.current) clearInterval(pollRef.current);
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  const busy   = status === "loading" || status === "polling";
  const canGo  = !!videoUrl.trim() && !busy &&
    (mode !== "actor_swap" || !!faceFile) &&
    (mode !== "mashup" || !!videoUrl2.trim());

  return (
    <div className="space-y-6">
      <SectionHeader />

      {/* Mode picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Remix Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className={`text-left px-3 py-3 rounded-xl border transition-all ${
                mode === m.key
                  ? "bg-red-600/20 border-red-500/60 text-white"
                  : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}>
              <div className="text-lg mb-1">{m.icon}</div>
              <div className="text-xs font-bold">{m.label}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <VideoInputs
        mode={mode} videoUrl={videoUrl} videoUrl2={videoUrl2}
        setVideoUrl={setVideoUrl} setVideoUrl2={setVideoUrl2}
      />

      {mode === "style_transfer" && (
        <StylePicker style={style} styles={STYLES} onChange={setStyle} />
      )}

      {mode === "actor_swap" && (
        <ActorFacePicker
          facePreview={facePreview} faceRef={faceRef}
          onFile={(f) => { setFaceFile(f); setFacePreview(URL.createObjectURL(f)); }}
        />
      )}

      <button onClick={remix} disabled={!canGo}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
          canGo
            ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}>
        {busy ? "⏳ Remixing…" : "🔀 Remix This Video"}
      </button>

      {busy && (
        <ProgressBar value={progress}
          label={status === "polling" ? "Rendering actor video (~30–90s)…" : "AI remixing content…"} />
      )}
      {status === "error" && <ErrorBox msg={errMsg} onRetry={() => setStatus("idle")} />}
      {result && <RemixResult result={result} videoResult={videoResult} copied={copied} onCopy={() => { navigator.clipboard.writeText(result.remixText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} />}
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-start gap-3">
      <span className="text-3xl">🔀</span>
      <div>
        <h2 className="text-xl font-bold text-white">YouTube Remix</h2>
        <p className="text-gray-400 text-sm mt-1">
          Paste any YouTube video URL. AI remixes it — rewrite the script, swap the actor with your face, transfer styles, cut Shorts, generate reactions, or mashup two videos.
        </p>
      </div>
    </div>
  );
}

function VideoInputs({ mode, videoUrl, videoUrl2, setVideoUrl, setVideoUrl2 }: {
  mode: RemixMode; videoUrl: string; videoUrl2: string;
  setVideoUrl: (v: string) => void; setVideoUrl2: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          YouTube Video URL {mode === "mashup" ? "(Video 1)" : ""}
        </label>
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or video ID"
          className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/60 transition-colors" />
      </div>
      {mode === "mashup" && (
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Video 2 URL</label>
          <input value={videoUrl2} onChange={(e) => setVideoUrl2(e.target.value)}
            placeholder="https://youtube.com/watch?v=... (second video to mashup)"
            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition-colors" />
        </div>
      )}
    </div>
  );
}

function StylePicker({ style, styles, onChange }: {
  style: string; styles: string[]; onChange: (s: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Thumbnail Style</label>
      <div className="flex flex-wrap gap-2">
        {styles.map((s) => (
          <button key={s} onClick={() => onChange(s)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              style === s
                ? "bg-purple-600/30 border-purple-500/60 text-white"
                : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20"
            }`}>{s}</button>
        ))}
      </div>
    </div>
  );
}

function ActorFacePicker({ facePreview, faceRef, onFile }: {
  facePreview: string | null;
  faceRef: React.RefObject<HTMLInputElement | null>;
  onFile: (f: File) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Your Face (for Actor Swap)</label>
      <div onClick={() => faceRef.current?.click()}
        className="border-2 border-dashed border-purple-500/30 hover:border-purple-400/60 rounded-2xl overflow-hidden cursor-pointer transition-all min-h-28 flex items-center justify-center">
        {facePreview
          ? <img src={facePreview} alt="face" className="max-h-40 object-contain" />
          : <div className="text-center p-4"><div className="text-3xl mb-1">🤳</div><div className="text-xs text-gray-400">Upload your face photo</div></div>
        }
      </div>
      <input ref={faceRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

function RemixResult({ result, videoResult, copied, onCopy }: {
  result: RemixResult; videoResult: string | null; copied: boolean; onCopy: () => void;
}) {
  const modeLabel = MODES.find((m) => m.key === result.mode)?.label ?? result.mode;
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-bold text-red-400">🔀 Remix: {modeLabel}</span>
            <div className="text-xs text-gray-500 mt-0.5">from: {result.originalTitle}</div>
          </div>
          <button onClick={onCopy}
            className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-colors">
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{result.remixText}</p>
      </div>

      {result.thumbnailUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">🎨 Remixed Thumbnail</span>
            <a href={result.thumbnailUrl} download target="_blank" rel="noopener noreferrer"
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-colors">
              ⬇ Download
            </a>
          </div>
          <img src={result.thumbnailUrl} alt="remixed thumbnail"
            className="w-full rounded-2xl border border-white/10" />
        </div>
      )}

      {videoResult && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-400">🎭 Actor Swap Video</span>
            <a href={videoResult} download target="_blank" rel="noopener noreferrer"
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-colors">
              ⬇ Download MP4
            </a>
          </div>
          <video src={videoResult} controls autoPlay loop playsInline
            className="w-full rounded-2xl border border-white/10 shadow-2xl" />
        </div>
      )}
    </div>
  );
}
