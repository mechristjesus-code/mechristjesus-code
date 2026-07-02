"use client";
import { useState } from "react";
import { ErrorBox } from "../page";

type YTStatus = "idle"|"searching"|"fetching"|"done"|"error";

interface YTVideo {
  videoId: string; title: string; description: string;
  thumbnail: string; channel: string; publishedAt: string; mock?: boolean;
}

const REPURPOSE_OPTIONS = [
  "short-form script (60 seconds)",
  "Twitter/X thread (5 tweets)",
  "YouTube Shorts script",
  "LinkedIn post",
  "Email newsletter excerpt",
  "TikTok script with hooks",
];

export function YouTubeTab() {
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState<YTVideo[]>([]);
  const [selected,    setSelected]    = useState<YTVideo|null>(null);
  const [repurposeAs, setRepurposeAs] = useState(REPURPOSE_OPTIONS[0]);
  const [transcript,  setTranscript]  = useState("");
  const [repurposed,  setRepurposed]  = useState("");
  const [videoTitle,  setVideoTitle]  = useState("");
  const [status,      setStatus]      = useState<YTStatus>("idle");
  const [errMsg,      setErrMsg]      = useState("");
  const [isMock,      setIsMock]      = useState(false);

  async function search() {
    if (!query.trim()) return;
    setStatus("searching"); setErrMsg(""); setResults([]); setSelected(null);
    try {
      const res  = await fetch(`/api/studio/youtube/search?q=${encodeURIComponent(query)}&max=8`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error);
      setResults(json.items ?? []);
      setIsMock(!!json.mock);
      setStatus("idle");
    } catch(e:unknown) {
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  async function fetchTranscript(video: YTVideo) {
    setSelected(video); setTranscript(""); setRepurposed("");
    if (video.mock) {
      setTranscript("[Demo mode — add YouTube API key to see real transcripts]");
      setRepurposed("Add your YOUTUBE_API_KEY to .env and GOOGLE_CLIENT_ID for full features.");
      return;
    }
    setStatus("fetching"); setErrMsg("");
    try {
      const res  = await fetch("/api/studio/youtube/transcript", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ videoId: video.videoId, repurposeAs }),
      });
      const j = await res.json();
      if (!res.ok||j.error) throw new Error(j.error);
      setTranscript(j.transcript ?? "");
      setRepurposed(j.repurposed ?? "");
      setVideoTitle(j.videoTitle ?? video.title);
      setStatus("done");
    } catch(e:unknown) {
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-3xl">▶️</span>
        <div>
          <h2 className="text-xl font-bold text-white">YouTube Research & Repurpose</h2>
          <p className="text-gray-400 text-sm mt-1">Search YouTube, pull transcripts, and AI-repurpose into new content formats.</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input value={query} onChange={(e)=>setQuery(e.target.value)}
          onKeyDown={(e)=>e.key==="Enter" && search()}
          placeholder="Search YouTube videos (e.g. AI content creation tips)…"
          className="flex-1 bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors" />
        <button onClick={search} disabled={status==="searching"}
          className="bg-red-600 hover:bg-red-500 transition-colors px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap disabled:opacity-50">
          {status==="searching" ? "⏳" : "🔍 Search"}
        </button>
      </div>

      {isMock && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl px-4 py-3 text-xs text-yellow-400">
          ⚠️ Demo mode — add <code className="bg-black/30 px-1 rounded">YOUTUBE_API_KEY</code> to .env for real YouTube search.
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map((v) => (
            <VideoCard key={v.videoId} video={v}
              active={selected?.videoId===v.videoId}
              onClick={()=>fetchTranscript(v)} />
          ))}
        </div>
      )}

      {status==="error" && <ErrorBox msg={errMsg} onRetry={()=>setStatus("idle")} />}

      {/* Transcript + repurpose */}
      {selected && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
            <div className="font-semibold text-white mb-1">{videoTitle || selected.title}</div>
            <div className="text-xs text-gray-500 mb-3">#{selected.videoId}</div>

            {/* Repurpose selector */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-400 mb-1">Repurpose as:</label>
              <div className="flex flex-wrap gap-2">
                {REPURPOSE_OPTIONS.map((o)=>(
                  <button key={o} onClick={()=>setRepurposeAs(o)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      repurposeAs===o ? "bg-purple-600/30 border-purple-500/50 text-white"
                                     : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}>{o}</button>
                ))}
              </div>
            </div>

            {status==="fetching" && (
              <div className="flex items-center gap-2 text-purple-400 text-sm py-4">
                <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Fetching transcript & repurposing…
              </div>
            )}

            {transcript && (
              <div className="space-y-3">
                <CollapsibleText title="📄 Original Transcript" text={transcript} />
                {repurposed && (
                  <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-purple-300">✨ AI Repurposed ({repurposeAs})</span>
                      <button onClick={()=>navigator.clipboard.writeText(repurposed)}
                        className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1 rounded-lg transition-colors">
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{repurposed}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VideoCard({ video, active, onClick }: { video: YTVideo; active: boolean; onClick: ()=>void }) {
  return (
    <div onClick={onClick}
      className={`cursor-pointer rounded-xl border overflow-hidden transition-all ${
        active ? "border-red-500/60 ring-1 ring-red-500/30" : "border-white/10 hover:border-white/20"
      }`}>
      <img src={video.thumbnail} alt={video.title}
        className="w-full aspect-video object-cover" />
      <div className="p-3 bg-gray-900">
        <div className="text-sm font-semibold text-white line-clamp-2 mb-1">{video.title}</div>
        <div className="text-xs text-gray-500">{video.channel}</div>
      </div>
    </div>
  );
}

function CollapsibleText({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-gray-800/50 border border-white/5 rounded-xl overflow-hidden">
      <button onClick={()=>setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
        {title}
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <pre className="px-4 pb-4 text-xs text-gray-400 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
          {text}
        </pre>
      )}
    </div>
  );
}
