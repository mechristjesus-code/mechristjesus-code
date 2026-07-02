"use client";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────
type Mode       = "photo" | "video";
type Status     = "idle" | "uploading" | "generating" | "polling" | "done" | "error";
type StyleKey   = "cinematic"|"anime"|"oil"|"cyberpunk"|"watercolor"|"magazine"|"cartoon"|"realistic";

interface Result { imageUrl?: string; videoUrl?: string; }

// ── Constants ─────────────────────────────────────────────────
const STYLES: { key: StyleKey; label: string; emoji: string }[] = [
  { key: "cinematic",  label: "Cinematic",  emoji: "🎬" },
  { key: "anime",      label: "Anime",      emoji: "✨" },
  { key: "oil",        label: "Oil Painting",emoji:"🖼️" },
  { key: "cyberpunk",  label: "Cyberpunk",  emoji: "🌆" },
  { key: "watercolor", label: "Watercolor", emoji: "🎨" },
  { key: "magazine",   label: "Magazine",   emoji: "📸" },
  { key: "cartoon",    label: "Cartoon",    emoji: "🎠" },
  { key: "realistic",  label: "Realistic",  emoji: "📷" },
];

const DURATIONS = [3, 5, 8, 10];

// ── Helpers ───────────────────────────────────────────────────
function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(",");
      const mime = header.match(/:(.*?);/)?.[1] ?? file.type;
      res({ base64, mime });
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// ── Main component ────────────────────────────────────────────
export default function StudioPage() {
  const [mode,     setMode]     = useState<Mode>("photo");
  const [preview,  setPreview]  = useState<string | null>(null);
  const [file,     setFile]     = useState<File | null>(null);
  const [prompt,   setPrompt]   = useState("");
  const [style,    setStyle]    = useState<StyleKey>("cinematic");
  const [duration, setDuration] = useState(5);
  const [status,   setStatus]   = useState<Status>("idle");
  const [result,   setResult]   = useState<Result>({});
  const [errMsg,   setErrMsg]   = useState("");
  const [progress, setProgress] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file pick (upload or camera)
  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult({});
    setErrMsg("");
    setStatus("idle");
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  // Generate image
  async function generateImage() {
    if (!file || !prompt.trim()) return;
    setStatus("uploading");
    setProgress(10);
    setErrMsg("");
    try {
      const { base64, mime } = await fileToBase64(file);
      setStatus("generating");
      setProgress(40);
      const res  = await fetch("/api/studio/image", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageBase64: base64, imageMime: mime, prompt, style }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Generation failed");
      setProgress(100);
      const url = json.ossUrl ?? (json.b64 ? `data:image/png;base64,${json.b64}` : null);
      setResult({ imageUrl: url ?? undefined });
      setStatus("done");
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  // Generate video (async + polling)
  async function generateVideo() {
    if (!file || !prompt.trim()) return;
    setStatus("uploading");
    setProgress(10);
    setErrMsg("");
    try {
      const { base64, mime } = await fileToBase64(file);
      setStatus("generating");
      setProgress(25);
      const res  = await fetch("/api/studio/video", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageBase64: base64, imageMime: mime, prompt, duration }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to start video");
      const { taskId } = json;
      setStatus("polling");
      setProgress(40);
      let elapsed = 0;
      pollRef.current = setInterval(async () => {
        elapsed += 5;
        setProgress(Math.min(40 + elapsed * 2, 90));
        const poll = await fetch(`/api/studio/poll?taskId=${encodeURIComponent(taskId)}`);
        const pj   = await poll.json();
        if (pj.status === "done") {
          clearInterval(pollRef.current!);
          setProgress(100);
          setResult({ videoUrl: pj.videoUrl });
          setStatus("done");
        } else if (pj.status === "failed") {
          clearInterval(pollRef.current!);
          throw new Error("Video generation failed");
        }
      }, 5000);
    } catch (e: unknown) {
      if (pollRef.current) clearInterval(pollRef.current);
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  const canGenerate = !!file && !!prompt.trim() && status !== "generating" && status !== "polling" && status !== "uploading";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <StudioHeader />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Mode toggle */}
        <ModeToggle mode={mode} onChange={(m) => { setMode(m); setResult({}); setStatus("idle"); }} />

        {/* Upload zone */}
        <UploadZone
          preview={preview}
          fileInputRef={fileInputRef}
          cameraInputRef={cameraInputRef}
          onFileChange={onFileChange}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f && f.type.startsWith("image/")) handleFile(f);
          }}
        />

        {/* Prompt */}
        <PromptBox prompt={prompt} onChange={setPrompt} mode={mode} />

        {/* Style picker (photo only) */}
        {mode === "photo" && <StylePicker style={style} onChange={setStyle} />}

        {/* Duration picker (video only) */}
        {mode === "video" && <DurationPicker duration={duration} onChange={setDuration} />}

        {/* Generate button */}
        <GenerateButton
          mode={mode}
          status={status}
          canGenerate={canGenerate}
          onClick={mode === "photo" ? generateImage : generateVideo}
          progress={progress}
        />

        {/* Error */}
        {status === "error" && <ErrorBox msg={errMsg} onRetry={() => setStatus("idle")} />}

        {/* Result */}
        {status === "done" && result.imageUrl && <ImageResult url={result.imageUrl} />}
        {status === "done" && result.videoUrl && <VideoResult url={result.videoUrl} />}

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function StudioHeader() {
  return (
    <>
      <header className="bg-gray-900/80 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← Back</Link>
        <h1 className="font-bold text-lg">🎬 Creator Studio</h1>
        <span className="ml-auto text-xs text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded-full">AI Powered</span>
      </header>
      <div className="bg-gradient-to-r from-purple-900/30 via-gray-900 to-blue-900/20 border-b border-white/5 px-6 py-5 text-center">
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Upload or take a photo of yourself. Add a prompt. AI will generate a brand-new image or video with <strong className="text-white">you</strong> in it.
        </p>
      </div>
    </>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex bg-gray-900 border border-white/10 rounded-xl p-1 gap-1">
      {(["photo", "video"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === m ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
          }`}
        >
          {m === "photo" ? "📸 Generate Photo" : "🎬 Generate Video"}
        </button>
      ))}
    </div>
  );
}

function UploadZone({ preview, fileInputRef, cameraInputRef, onFileChange, onDrop }: {
  preview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Your Photo</label>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-white/20 rounded-2xl overflow-hidden bg-gray-900 hover:border-purple-500/50 transition-colors"
        style={{ minHeight: 220 }}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Your upload" className="w-full max-h-80 object-cover rounded-2xl" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 transition-colors px-3 py-1.5 rounded-xl text-xs font-semibold text-white border border-white/20"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div className="text-5xl">🤳</div>
            <div>
              <p className="text-white font-semibold mb-1">Upload a photo of yourself</p>
              <p className="text-gray-500 text-sm">Drag & drop, upload from gallery, or take a selfie</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 hover:bg-purple-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                📁 Choose Photo
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="bg-white/10 hover:bg-white/20 transition-colors border border-white/15 px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                📷 Take Selfie
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef}    type="file" accept="image/*"           className="hidden" onChange={onFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFileChange} />
    </div>
  );
}

function PromptBox({ prompt, onChange, mode }: { prompt: string; onChange: (v: string) => void; mode: Mode }) {
  const placeholders = {
    photo: "e.g. Me on the surface of Mars wearing a spacesuit, epic sunset sky...",
    video: "e.g. Me walking through a neon-lit Tokyo street at night, hair blowing in the wind...",
  };
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        {mode === "photo" ? "What do you want the image to look like?" : "Describe the video scene"}
      </label>
      <textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholders[mode]}
        rows={3}
        className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/60 transition-colors"
      />
      <div className="flex gap-2 mt-2 flex-wrap">
        {(mode === "photo"
          ? ["Me on Mars", "Me as a superhero", "Me in ancient Rome", "Me in a fantasy kingdom"]
          : ["Me walking in Tokyo neon", "Me at a concert crowd", "Me in a sci-fi spaceship", "Me on a beach at sunset"]
        ).map((ex) => (
          <button key={ex} onClick={() => onChange(ex)}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400 hover:text-white transition-colors">
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

function StylePicker({ style, onChange }: { style: StyleKey; onChange: (s: StyleKey) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Visual Style</label>
      <div className="grid grid-cols-4 gap-2">
        {STYLES.map((s) => (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
              style === s.key
                ? "bg-purple-600/30 border-purple-500/60 text-white"
                : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <span className="text-xl">{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DurationPicker({ duration, onChange }: { duration: number; onChange: (d: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Video Duration</label>
      <div className="flex gap-2">
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              duration === d
                ? "bg-purple-600/30 border-purple-500/60 text-white"
                : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20"
            }`}
          >
            {d}s
          </button>
        ))}
      </div>
    </div>
  );
}

function GenerateButton({ mode, status, canGenerate, onClick, progress }: {
  mode: Mode; status: Status; canGenerate: boolean; onClick: () => void; progress: number;
}) {
  const labels: Record<Status, string> = {
    idle:       mode === "photo" ? "✨ Generate Photo" : "🎬 Generate Video",
    uploading:  "Uploading photo...",
    generating: mode === "photo" ? "Generating image..." : "Starting video...",
    polling:    "Rendering video... (this takes ~30–90s)",
    done:       "✅ Done! Generate another",
    error:      "Try Again",
  };
  const busy = status === "uploading" || status === "generating" || status === "polling";

  return (
    <div className="space-y-3">
      <button
        onClick={onClick}
        disabled={!canGenerate}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
          canGenerate
            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/30"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}
      >
        {labels[status]}
      </button>

      {busy && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{status === "polling" ? "AI is rendering your video…" : "Processing…"}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorBox({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
      <span className="text-red-400 text-xl">⚠️</span>
      <div className="flex-1">
        <div className="font-semibold text-red-300 mb-1">Generation failed</div>
        <div className="text-sm text-red-400/80 font-mono">{msg}</div>
      </div>
      <button onClick={onRetry} className="text-xs bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 px-3 py-1.5 rounded-lg text-red-300 font-semibold">
        Retry
      </button>
    </div>
  );
}

function ImageResult({ url }: { url: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-green-400">✅ Your AI Photo</h3>
        <a href={url} download="creator-dna-result.png" target="_blank" rel="noopener noreferrer"
          className="text-xs bg-white/10 hover:bg-white/20 transition-colors border border-white/10 px-3 py-1.5 rounded-lg font-semibold">
          ⬇ Download
        </a>
      </div>
      <img src={url} alt="AI generated result" className="w-full rounded-2xl border border-white/10 shadow-2xl" />
    </div>
  );
}

function VideoResult({ url }: { url: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-green-400">✅ Your AI Video</h3>
        <a href={url} download="creator-dna-video.mp4" target="_blank" rel="noopener noreferrer"
          className="text-xs bg-white/10 hover:bg-white/20 transition-colors border border-white/10 px-3 py-1.5 rounded-lg font-semibold">
          ⬇ Download
        </a>
      </div>
      <video src={url} controls autoPlay loop playsInline
        className="w-full rounded-2xl border border-white/10 shadow-2xl" />
    </div>
  );
}
