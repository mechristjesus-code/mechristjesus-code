"use client";
import { useRef, useState } from "react";
import { fileToBase64, ProgressBar, ErrorBox } from "../page";

type Status = "idle" | "uploading" | "generating" | "polling" | "done" | "error";

const SCENE_PRESETS = [
  "Professional studio with soft light",
  "Neon-lit cyberpunk city at night",
  "Outdoor nature scene with bokeh background",
  "Modern tech office environment",
  "Cinematic wide-angle movie set",
  "Minimalist white background",
];

const SCRIPT_PRESETS = [
  "Welcome to my channel! Today we're diving into something incredible…",
  "Here's the thing nobody talks about when it comes to this topic…",
  "I tested this for 30 days straight — here's what actually happened.",
  "Stop doing this — and start doing this instead.",
  "Three things changed my life this year. Let me break them down.",
];

export function ActorTab() {
  const [faceFile,   setFaceFile]   = useState<File | null>(null);
  const [facePreview,setFacePreview]= useState<string | null>(null);
  const [script,     setScript]     = useState("");
  const [scene,      setScene]      = useState(SCENE_PRESETS[0]);
  const [customScene,setCustomScene]= useState("");
  const [duration,   setDuration]   = useState(5);
  const [status,     setStatus]     = useState<Status>("idle");
  const [progress,   setProgress]   = useState(0);
  const [videoUrl,   setVideoUrl]   = useState<string | null>(null);
  const [errMsg,     setErrMsg]     = useState("");
  const photoRef  = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleFaceFile(f: File) {
    setFaceFile(f);
    setFacePreview(URL.createObjectURL(f));
    setVideoUrl(null); setStatus("idle");
  }

  async function generate() {
    if (!faceFile || !script.trim()) return;
    setStatus("uploading"); setProgress(10); setErrMsg("");
    try {
      const { base64, mime } = await fileToBase64(faceFile);
      setStatus("generating"); setProgress(25);
      const res  = await fetch("/api/studio/actor", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faceBase64: base64, faceMime: mime, script,
          scene: customScene || scene, duration,
        }),
      });
      const j = await res.json();
      if (!res.ok || j.error) throw new Error(j.error);
      const { taskId } = j;
      setStatus("polling"); setProgress(40);
      let elapsed = 0;
      pollRef.current = setInterval(async () => {
        elapsed += 5;
        setProgress(Math.min(40 + elapsed * 2, 92));
        const p  = await fetch(`/api/studio/poll?taskId=${encodeURIComponent(taskId)}`);
        const pj = await p.json();
        if (pj.status === "done") {
          clearInterval(pollRef.current!);
          setProgress(100); setVideoUrl(pj.videoUrl); setStatus("done");
        } else if (pj.status === "failed") {
          clearInterval(pollRef.current!);
          throw new Error("Video render failed");
        }
      }, 5000);
    } catch (e: unknown) {
      if (pollRef.current) clearInterval(pollRef.current);
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  const busy = ["uploading","generating","polling"].includes(status);
  const canGo = !!faceFile && !!script.trim() && !busy;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="🎭" title="AI Actor — You on Screen"
        subtitle="Upload your face photo, write a script, choose a scene — AI puts you in the video as the actor."
      />

      {/* Face upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Your Face Photo</label>
        <div className="grid grid-cols-2 gap-3">
          <FaceUploadBox preview={facePreview} onClick={() => photoRef.current?.click()} label="📁 Upload Photo" />
          <FaceUploadBox preview={null} onClick={() => cameraRef.current?.click()} label="📷 Take Selfie" secondary />
        </div>
        <input ref={photoRef}  type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFaceFile(f); }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFaceFile(f); }} />
      </div>

      {/* Script */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Script / What You Say</label>
        <textarea value={script} onChange={(e) => setScript(e.target.value)}
          placeholder="Write what your AI actor version will say or perform…"
          rows={4}
          className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/60 transition-colors" />
        <div className="flex gap-2 mt-2 flex-wrap">
          {SCRIPT_PRESETS.map((p) => (
            <button key={p} onClick={() => setScript(p)}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400 hover:text-white transition-colors">
              {p.slice(0, 40)}…
            </button>
          ))}
        </div>
      </div>

      {/* Scene */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Scene / Background</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {SCENE_PRESETS.map((s) => (
            <button key={s} onClick={() => setScene(s)}
              className={`text-xs px-3 py-2 rounded-xl border transition-all text-left ${
                scene === s && !customScene
                  ? "bg-purple-600/30 border-purple-500/60 text-white"
                  : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20"
              }`}>{s}</button>
          ))}
        </div>
        <input value={customScene} onChange={(e) => setCustomScene(e.target.value)}
          placeholder="Or describe a custom scene…"
          className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors" />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Duration</label>
        <div className="flex gap-2">
          {[3,5,8,10].map((d) => (
            <button key={d} onClick={() => setDuration(d)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                duration === d ? "bg-purple-600/30 border-purple-500/60 text-white"
                               : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20"
              }`}>{d}s</button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button onClick={generate} disabled={!canGo}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
          canGo ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}>
        {busy ? "⏳ Rendering your AI actor video…" : "🎭 Generate AI Actor Video"}
      </button>

      {busy && (
        <ProgressBar value={progress}
          label={status === "polling" ? "AI is rendering (~30–90s)…" : "Processing…"} />
      )}
      {status === "error" && <ErrorBox msg={errMsg} onRetry={() => setStatus("idle")} />}
      {status === "done" && videoUrl && <VideoResult url={videoUrl} label="🎭 Your AI Actor Video" />}
    </div>
  );
}

function FaceUploadBox({ preview, onClick, label, secondary }: {
  preview: string | null; onClick: () => void; label: string; secondary?: boolean;
}) {
  return (
    <div onClick={onClick}
      className={`border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all min-h-32 flex items-center justify-center ${
        secondary ? "border-white/10 hover:border-white/20" : "border-purple-500/30 hover:border-purple-400/60"
      }`}>
      {preview && !secondary ? (
        <img src={preview} alt="face" className="w-full h-full object-cover" />
      ) : (
        <div className="text-center p-4">
          <div className="text-3xl mb-2">{secondary ? "📷" : "🤳"}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </div>
      )}
    </div>
  );
}

function VideoResult({ url, label }: { url: string; label: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-green-400">{label}</h3>
        <a href={url} download target="_blank" rel="noopener noreferrer"
          className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-colors">
          ⬇ Download MP4
        </a>
      </div>
      <video src={url} controls autoPlay loop playsInline
        className="w-full rounded-2xl border border-white/10 shadow-2xl" />
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
