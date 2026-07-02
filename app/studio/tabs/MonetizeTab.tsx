"use client";
import { useState } from "react";
import { ErrorBox, ProgressBar } from "../page";

type Status = "idle"|"generating"|"done"|"error"|"uploading";

const NICHES = [
  "Tech & AI","Personal Finance","Fitness & Health","Gaming",
  "Education","Entertainment","Lifestyle","Business & Entrepreneur",
];

interface MonetizeMeta {
  title: string; description: string; tags: string[];
  category: string; thumbnailPrompt: string;
  monetizationTips: string[]; bestUploadTime: string; estimatedCPM: string;
}

export function MonetizeTab() {
  const [topic,       setTopic]       = useState("");
  const [script,      setScript]      = useState("");
  const [niche,       setNiche]       = useState("Tech & AI");
  const [status,      setStatus]      = useState<Status>("idle");
  const [progress,    setProgress]    = useState(0);
  const [meta,        setMeta]        = useState<MonetizeMeta|null>(null);
  const [thumbnail,   setThumbnail]   = useState<string|null>(null);
  const [errMsg,      setErrMsg]      = useState("");
  const [videoUrl,    setVideoUrl]    = useState("");
  const [ytToken,     setYtToken]     = useState("");
  const [ytPrivacy,   setYtPrivacy]   = useState("private");
  const [uploadResult,setUploadResult]= useState<{youtubeUrl:string}|null>(null);
  const [copied,      setCopied]      = useState<string|null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setStatus("generating"); setProgress(20); setErrMsg(""); setMeta(null); setThumbnail(null);
    try {
      const res  = await fetch("/api/studio/monetize", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ topic, script, niche }),
      });
      setProgress(70);
      const j = await res.json();
      if (!res.ok||j.error) throw new Error(j.error);
      setMeta(j.meta); setThumbnail(j.thumbnailUrl);
      setProgress(100); setStatus("done");
    } catch(e:unknown) {
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  async function uploadToYT() {
    if (!videoUrl||!ytToken||!meta) return;
    setStatus("uploading"); setErrMsg("");
    try {
      const res  = await fetch("/api/studio/youtube/upload", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          videoUrl, accessToken: ytToken,
          title: meta.title, description: meta.description,
          tags: meta.tags, categoryId:"22",
          privacyStatus: ytPrivacy,
        }),
      });
      const j = await res.json();
      if (!res.ok||j.error) throw new Error(j.error.detail ?? j.error);
      setUploadResult({ youtubeUrl: j.youtubeUrl });
      setStatus("done");
    } catch(e:unknown) {
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(()=>setCopied(null), 2000);
  }

  const busy = status==="generating"||status==="uploading";

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-3xl">💰</span>
        <div>
          <h2 className="text-xl font-bold text-white">Monetize & Upload to YouTube</h2>
          <p className="text-gray-400 text-sm mt-1">AI generates optimized title, description, tags, thumbnail — then uploads directly to your channel.</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Video Topic / Title Idea</label>
          <input value={topic} onChange={(e)=>setTopic(e.target.value)}
            placeholder="e.g. 5 AI tools that replaced my entire workflow in 2025"
            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Script / Summary (optional)</label>
          <textarea value={script} onChange={(e)=>setScript(e.target.value)}
            placeholder="Paste your video script or key points…"
            rows={3}
            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/60 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Channel Niche</label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n)=>(
              <button key={n} onClick={()=>setNiche(n)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                  niche===n ? "bg-purple-600/30 border-purple-500/60 text-white"
                            : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20"
                }`}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={generate} disabled={!topic.trim()||busy}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
          topic.trim()&&!busy
            ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}>
        {status==="generating" ? "⏳ Generating metadata & thumbnail…" : "💰 Generate SEO Metadata + Thumbnail"}
      </button>

      {status==="generating" && <ProgressBar value={progress} label="AI generating title, tags, thumbnail…" />}
      {status==="error" && <ErrorBox msg={errMsg} onRetry={()=>setStatus("idle")} />}

      {/* Results */}
      {meta && (
        <div className="space-y-4">
          <MetaField label="📌 Title" value={meta.title} onCopy={()=>copy(meta.title,"title")} copied={copied==="title"} />
          <MetaField label="📝 Description" value={meta.description} multiline onCopy={()=>copy(meta.description,"desc")} copied={copied==="desc"} />
          <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-400 mb-2">🏷️ Tags ({meta.tags.length})</div>
            <div className="flex flex-wrap gap-1.5">
              {meta.tags.map((t)=>(
                <span key={t} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5 text-gray-300">#{t}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon="📂" label="Category" value={meta.category} />
            <InfoCard icon="⏰" label="Best Upload Time" value={meta.bestUploadTime} />
            <InfoCard icon="💵" label="Est. CPM Range" value={meta.estimatedCPM} />
          </div>

          {meta.monetizationTips?.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4">
              <div className="font-semibold text-green-400 mb-2">💡 Monetization Tips</div>
              <ul className="space-y-1">
                {meta.monetizationTips.map((tip,i)=>(
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-green-500 flex-shrink-0">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {thumbnail && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">🖼️ AI Thumbnail</span>
                <a href={thumbnail} download target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-colors">⬇ Download</a>
              </div>
              <img src={thumbnail} alt="thumbnail" className="w-full rounded-xl border border-white/10" />
            </div>
          )}

          {/* YouTube Upload */}
          <div className="bg-red-900/15 border border-red-500/25 rounded-2xl p-5 space-y-3">
            <div className="font-bold text-white flex items-center gap-2">
              <span>▶️</span> Upload to YouTube
            </div>
            <p className="text-xs text-gray-400">
              Paste your video URL and connect Google to get your access token automatically.
            </p>
            <a href="/api/auth/google" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 transition-colors px-4 py-2 rounded-xl text-sm font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Connect Google Account
            </a>
            <input value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)}
              placeholder="Video URL (OSS link or localhost)…"
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors" />
            <input value={ytToken} onChange={(e)=>setYtToken(e.target.value)}
              placeholder="Google OAuth2 access token — click 'Connect Google' below to get one…"
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors" />
            <div className="flex gap-2">
              {["private","unlisted","public"].map((p)=>(
                <button key={p} onClick={()=>setYtPrivacy(p)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    ytPrivacy===p ? "bg-red-600/30 border-red-500/60 text-white"
                                  : "bg-gray-900 border-white/10 text-gray-400"
                  }`}>{p}</button>
              ))}
            </div>
            <button onClick={uploadToYT} disabled={!videoUrl||!ytToken||status==="uploading"}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                videoUrl&&ytToken&&status!=="uploading"
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}>
              {status==="uploading" ? "⏳ Uploading to YouTube…" : "▶️ Upload to YouTube"}
            </button>
            {uploadResult && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 text-center">
                <div className="text-green-400 font-bold mb-1">✅ Uploaded!</div>
                <a href={uploadResult.youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-blue-400 underline">{uploadResult.youtubeUrl}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaField({ label, value, multiline, onCopy, copied }: {
  label:string; value:string; multiline?:boolean; onCopy:()=>void; copied:boolean;
}) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        <button onClick={onCopy}
          className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1 rounded-lg transition-colors text-gray-300">
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      {multiline
        ? <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{value}</p>
        : <p className="text-sm font-semibold text-white">{value}</p>
      }
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon:string; label:string; value:string }) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-3">
      <div className="text-xs text-gray-500 mb-1">{icon} {label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
