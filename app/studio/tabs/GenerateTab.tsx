"use client";
import { useRef, useState } from "react";
import { fileToBase64, ProgressBar, ErrorBox } from "../page";

type GenMode = "photo" | "video";
type Status  = "idle" | "uploading" | "generating" | "polling" | "done" | "error";
type StyleKey = "cinematic"|"anime"|"oil"|"cyberpunk"|"watercolor"|"magazine"|"cartoon"|"realistic";

const STYLES: { key: StyleKey; emoji: string; label: string }[] = [
  { key:"cinematic",  emoji:"🎬", label:"Cinematic"   },
  { key:"anime",      emoji:"✨", label:"Anime"        },
  { key:"oil",        emoji:"🖼️", label:"Oil Painting" },
  { key:"cyberpunk",  emoji:"🌆", label:"Cyberpunk"    },
  { key:"watercolor", emoji:"🎨", label:"Watercolor"   },
  { key:"magazine",   emoji:"📸", label:"Magazine"     },
  { key:"cartoon",    emoji:"🎠", label:"Cartoon"      },
  { key:"realistic",  emoji:"📷", label:"Realistic"    },
];

export function GenerateTab() {
  const [mode,      setMode]      = useState<GenMode>("photo");
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string|null>(null);
  const [prompt,    setPrompt]    = useState("");
  const [style,     setStyle]     = useState<StyleKey>("cinematic");
  const [duration,  setDuration]  = useState(5);
  const [status,    setStatus]    = useState<Status>("idle");
  const [progress,  setProgress]  = useState(0);
  const [resultUrl, setResultUrl] = useState<string|null>(null);
  const [errMsg,    setErrMsg]    = useState("");
  const fileRef   = useRef<HTMLInputElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval>|null>(null);

  function handleFile(f: File) {
    setFile(f); setPreview(URL.createObjectURL(f));
    setResultUrl(null); setStatus("idle");
  }

  async function generate() {
    if (!file || !prompt.trim()) return;
    setStatus("uploading"); setProgress(10); setErrMsg("");
    try {
      const { base64, mime } = await fileToBase64(file);
      setStatus("generating"); setProgress(30);

      if (mode === "photo") {
        const res  = await fetch("/api/studio/image", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ imageBase64:base64, imageMime:mime, prompt, style }),
        });
        const j = await res.json();
        if (!res.ok||j.error) throw new Error(j.error);
        const url = j.ossUrl ?? (j.b64 ? `data:image/png;base64,${j.b64}` : null);
        setResultUrl(url); setProgress(100); setStatus("done");
      } else {
        const res  = await fetch("/api/studio/video", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ imageBase64:base64, imageMime:mime, prompt, duration }),
        });
        const j = await res.json();
        if (!res.ok||j.error) throw new Error(j.error);
        setStatus("polling"); setProgress(40);
        let elapsed=0;
        pollRef.current = setInterval(async()=>{
          elapsed+=5; setProgress(Math.min(40+elapsed*2,92));
          const p  = await fetch(`/api/studio/poll?taskId=${encodeURIComponent(j.taskId)}`);
          const pj = await p.json();
          if (pj.status==="done") {
            clearInterval(pollRef.current!);
            setProgress(100); setResultUrl(pj.videoUrl); setStatus("done");
          } else if (pj.status==="failed") { clearInterval(pollRef.current!); throw new Error("Render failed"); }
        }, 5000);
      }
    } catch(e:unknown) {
      if(pollRef.current) clearInterval(pollRef.current);
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  const busy  = ["uploading","generating","polling"].includes(status);
  const canGo = !!file && !!prompt.trim() && !busy;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-3xl">🎬</span>
        <div>
          <h2 className="text-xl font-bold text-white">Generate Photo or Video</h2>
          <p className="text-gray-400 text-sm mt-1">Upload yourself, pick a style and prompt — AI creates the scene.</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-900 border border-white/10 rounded-xl p-1 gap-1">
        {(["photo","video"] as GenMode[]).map((m) => (
          <button key={m} onClick={()=>setMode(m)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode===m ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}>
            {m==="photo" ? "📸 Photo" : "🎬 Video"}
          </button>
        ))}
      </div>

      {/* Upload */}
      <div onClick={()=>fileRef.current?.click()}
        className="border-2 border-dashed border-white/15 hover:border-purple-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all min-h-40">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="upload" className="w-full max-h-64 object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 hover:opacity-100 bg-black/60 px-3 py-1.5 rounded-lg text-sm font-semibold">Change</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
            <div className="text-4xl">🤳</div>
            <div className="text-sm text-gray-400">Upload a photo of yourself<br/>or drag & drop here</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e)=>{const f=e.target.files?.[0]; if(f) handleFile(f);}} />

      {/* Prompt */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Prompt</label>
        <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)}
          placeholder={mode==="photo" ? "Me on Mars in a spacesuit, epic sunset sky…" : "Me walking through neon Tokyo at night…"}
          rows={3}
          className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/60 transition-colors" />
      </div>

      {/* Styles (photo only) */}
      {mode==="photo" && (
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Style</label>
          <div className="grid grid-cols-4 gap-2">
            {STYLES.map((s)=>(
              <button key={s.key} onClick={()=>setStyle(s.key)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  style===s.key ? "bg-purple-600/30 border-purple-500/60 text-white"
                                : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}>
                <span className="text-xl">{s.emoji}</span>{s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration (video only) */}
      {mode==="video" && (
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Duration</label>
          <div className="flex gap-2">
            {[3,5,8,10].map((d)=>(
              <button key={d} onClick={()=>setDuration(d)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  duration===d ? "bg-purple-600/30 border-purple-500/60 text-white"
                               : "bg-gray-900 border-white/10 text-gray-400"
                }`}>{d}s</button>
            ))}
          </div>
        </div>
      )}

      <button onClick={generate} disabled={!canGo}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
          canGo ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}>
        {busy ? "⏳ Generating…" : mode==="photo" ? "✨ Generate Photo" : "🎬 Generate Video"}
      </button>

      {busy && <ProgressBar value={progress} label={status==="polling" ? "Rendering video (~30–90s)…" : "Processing…"} />}
      {status==="error" && <ErrorBox msg={errMsg} onRetry={()=>setStatus("idle")} />}
      {status==="done" && resultUrl && (
        mode==="photo"
          ? <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-400">✅ Your AI Photo</span>
                <a href={resultUrl} download target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg font-semibold">⬇ Download</a>
              </div>
              <img src={resultUrl} alt="result" className="w-full rounded-2xl border border-white/10" />
            </div>
          : <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-400">✅ Your AI Video</span>
                <a href={resultUrl} download target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg font-semibold">⬇ Download</a>
              </div>
              <video src={resultUrl} controls autoPlay loop playsInline
                className="w-full rounded-2xl border border-white/10" />
            </div>
      )}
    </div>
  );
}
