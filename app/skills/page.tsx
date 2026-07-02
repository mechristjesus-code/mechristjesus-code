"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Skill, Capability } from "@/lib/skills-store";

// ── Types ─────────────────────────────────────────────────────
type Panel = "list" | "detail";
type GenStatus = "idle" | "generating" | "done" | "error";

const CATEGORY_COLORS: Record<string, string> = {
  Content:       "bg-purple-900/40 text-purple-300 border-purple-500/30",
  Code:          "bg-blue-900/40 text-blue-300 border-blue-500/30",
  Analysis:      "bg-yellow-900/40 text-yellow-300 border-yellow-500/30",
  Media:         "bg-pink-900/40 text-pink-300 border-pink-500/30",
  Automation:    "bg-green-900/40 text-green-300 border-green-500/30",
  Research:      "bg-cyan-900/40 text-cyan-300 border-cyan-500/30",
  Communication: "bg-orange-900/40 text-orange-300 border-orange-500/30",
  Data:          "bg-teal-900/40 text-teal-300 border-teal-500/30",
};

// ── Main page ─────────────────────────────────────────────────
export default function SkillsPage() {
  const [skills,       setSkills]       = useState<Skill[]>([]);
  const [selected,     setSelected]     = useState<Skill | null>(null);
  const [panel,        setPanel]        = useState<Panel>("list");
  const [genStatus,    setGenStatus]    = useState<GenStatus>("idle");
  const [genError,     setGenError]     = useState("");
  const [extraPrompt,  setExtraPrompt]  = useState("");
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState("");
  const [dragOver,     setDragOver]     = useState(false);
  const [search,       setSearch]       = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-seed built-in skills then fetch
    fetch("/api/skills/seed", { method: "POST" }).finally(fetchSkills);
  }, []);

  async function fetchSkills() {
    const res = await fetch("/api/skills/list");
    const json = await res.json();
    setSkills(json.skills ?? []);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/skills/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Upload failed");
      await fetchSkills();
      openSkill(json.skill);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate(skill: Skill) {
    setGenStatus("generating");
    setGenError("");
    try {
      const res  = await fetch("/api/skills/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ skillId: skill.id, extraPrompt }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Generation failed");
      setSelected(json.skill);
      await fetchSkills();
      setGenStatus("done");
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : String(e));
      setGenStatus("error");
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/skills/list", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
    if (selected?.id === id) { setSelected(null); setPanel("list"); }
    await fetchSkills();
  }

  function openSkill(skill: Skill) {
    setSelected(skill);
    setPanel("detail");
    setGenStatus("idle");
    setExtraPrompt("");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SkillsHeader />
      <div className="flex flex-1 overflow-hidden max-w-6xl w-full mx-auto px-4 py-6 gap-6">
        {/* Left: skill list + upload */}
        <SkillSidebar
          skills={skills.filter((s) =>
            !search.trim() ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase())
          )}
          search={search}
          onSearch={setSearch}
          selected={selected}
          uploading={uploading}
          uploadError={uploadError}
          dragOver={dragOver}
          fileRef={fileRef}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleUpload(f);
          }}
          onFileChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          onSelect={openSkill}
          onDelete={handleDelete}
        />

        {/* Right: detail panel */}
        <div className="flex-1 min-w-0">
          {panel === "list" || !selected
            ? <EmptyState onUploadClick={() => fileRef.current?.click()} />
            : <SkillDetail
                skill={selected}
                genStatus={genStatus}
                genError={genError}
                extraPrompt={extraPrompt}
                onExtraPrompt={setExtraPrompt}
                onGenerate={() => handleGenerate(selected)}
                onDelete={() => handleDelete(selected.id)}
              />
          }
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function SkillsHeader() {
  return (
    <header className="bg-gray-900/80 border-b border-white/10 px-6 py-4 flex items-center gap-4">
      <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← Back</Link>
      <span className="text-xl">🧠</span>
      <h1 className="font-bold text-lg">Skills Hub</h1>
      <span className="ml-auto text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded-full">
        AI Auto-Generate
      </span>
    </header>
  );
}

function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-4 py-20">
      <div className="text-6xl">🧠</div>
      <h2 className="text-xl font-bold text-white">Upload a Skill File</h2>
      <p className="text-gray-400 text-sm max-w-sm">
        Upload any <strong className="text-white">.md, .txt, .pdf, .json, or .yaml</strong> file.
        AI will read it and auto-generate a full set of capabilities.
      </p>
      <button onClick={onUploadClick}
        className="mt-2 bg-purple-600 hover:bg-purple-500 transition-colors px-6 py-3 rounded-xl font-semibold text-sm">
        📁 Upload Skill File
      </button>
    </div>
  );
}

function SkillSidebar({
  skills, search, onSearch, selected, uploading, uploadError, dragOver,
  fileRef, onDragOver, onDragLeave, onDrop, onFileChange, onSelect, onDelete,
}: {
  skills: Skill[]; search: string; onSearch: (v: string) => void;
  selected: Skill | null; uploading: boolean;
  uploadError: string; dragOver: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (s: Skill) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col gap-3">
      {/* Upload zone */}
      <div
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          dragOver ? "border-purple-400 bg-purple-900/20" : "border-white/15 hover:border-purple-500/50"
        }`}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
            <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Uploading…
          </div>
        ) : (
          <>
            <div className="text-2xl mb-1">📤</div>
            <div className="text-xs text-gray-400">Drop skill file here<br />.md .txt .json .yaml .pdf</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file"
        accept=".md,.txt,.pdf,.json,.yaml,.yml,.toml"
        className="hidden" onChange={onFileChange} />
      {uploadError && <p className="text-xs text-red-400 px-1">{uploadError}</p>}

      {/* Search */}
      <input
        value={search} onChange={(e) => onSearch(e.target.value)}
        placeholder="🔍 Search skills…"
        className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
      />

      {/* Skill list */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[60vh]">
        {skills.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">No skills yet — upload one above</p>
        )}
        {skills.map((s) => (
          <SkillListItem
            key={s.id} skill={s}
            active={selected?.id === s.id}
            onSelect={() => onSelect(s)}
            onDelete={() => onDelete(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SkillListItem({ skill, active, onSelect, onDelete }: {
  skill: Skill; active: boolean;
  onSelect: () => void; onDelete: () => void;
}) {
  return (
    <div
      className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
        active ? "bg-purple-900/30 border-purple-500/50" : "bg-gray-900 border-white/10 hover:border-white/20"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg mt-0.5">{skill.source === "upload" ? "📄" : "✨"}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white truncate">{skill.name}</div>
          <div className="text-xs text-gray-500 truncate mt-0.5">{skill.description}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-600 uppercase font-mono">{skill.fileType}</span>
            {skill.capabilities.length > 0 && (
              <span className="text-xs text-purple-400">{skill.capabilities.length} caps</span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 text-xs px-1"
      >✕</button>
    </div>
  );
}

function SkillDetail({ skill, genStatus, genError, extraPrompt, onExtraPrompt, onGenerate, onDelete }: {
  skill: Skill; genStatus: GenStatus; genError: string;
  extraPrompt: string; onExtraPrompt: (v: string) => void;
  onGenerate: () => void; onDelete: () => void;
}) {
  const busy = genStatus === "generating";
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{skill.name}</h2>
          <p className="text-gray-400 text-sm mt-1">{skill.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono text-gray-600 uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded">{skill.fileType}</span>
            <span className="text-xs text-gray-600">{new Date(skill.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={onDelete} className="text-xs text-gray-600 hover:text-red-400 transition-colors border border-white/10 px-3 py-1.5 rounded-lg">
          Delete
        </button>
      </div>

      {/* Raw preview */}
      <RawPreview content={skill.rawContent} />

      {/* Generate capabilities */}
      <GeneratePanel
        hasCapabilities={skill.capabilities.length > 0}
        genStatus={genStatus}
        genError={genError}
        extraPrompt={extraPrompt}
        onExtraPrompt={onExtraPrompt}
        onGenerate={onGenerate}
        busy={busy}
      />

      {/* Capabilities grid */}
      {skill.capabilities.length > 0 && (
        <CapabilitiesGrid capabilities={skill.capabilities} />
      )}
    </div>
  );
}

function RawPreview({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = expanded ? content : content.slice(0, 400);
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Skill Content</span>
        <button onClick={() => setExpanded(!expanded)}
          className="text-xs text-purple-400 hover:text-purple-300">{expanded ? "Collapse" : "Expand"}</button>
      </div>
      <pre className="px-4 py-3 text-xs text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
        {preview}{!expanded && content.length > 400 ? "…" : ""}
      </pre>
    </div>
  );
}

function GeneratePanel({ hasCapabilities, genStatus, genError, extraPrompt, onExtraPrompt, onGenerate, busy }: {
  hasCapabilities: boolean; genStatus: GenStatus; genError: string;
  extraPrompt: string; onExtraPrompt: (v: string) => void;
  onGenerate: () => void; busy: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <h3 className="font-bold text-white">AI Capability Generator</h3>
        {hasCapabilities && <span className="text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded-full">Generated</span>}
      </div>
      <p className="text-gray-400 text-sm">
        AI reads your skill file and auto-generates a structured set of capabilities — titles, descriptions, categories, examples, and tags.
      </p>
      <textarea
        value={extraPrompt}
        onChange={(e) => onExtraPrompt(e.target.value)}
        placeholder="Optional: add context or focus area (e.g. 'focus on content creation use cases')"
        rows={2}
        className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
      />
      <button
        onClick={onGenerate}
        disabled={busy}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
          busy ? "bg-gray-800 text-gray-600 cursor-not-allowed"
               : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
        }`}
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Analyzing skill & generating capabilities…
          </span>
        ) : hasCapabilities ? "♻️ Regenerate Capabilities" : "✨ Generate Capabilities"}
      </button>
      {genStatus === "error" && <p className="text-xs text-red-400">{genError}</p>}
      {genStatus === "done" && <p className="text-xs text-green-400">✓ Capabilities generated successfully</p>}
    </div>
  );
}

function CapabilitiesGrid({ capabilities }: { capabilities: Capability[] }) {
  return (
    <div>
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <span>🎯</span> Capabilities
        <span className="text-xs text-gray-500 font-normal">({capabilities.length})</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {capabilities.map((cap) => (
          <CapabilityCard key={cap.id} cap={cap} />
        ))}
      </div>
    </div>
  );
}

function CapabilityCard({ cap }: { cap: Capability }) {
  const color = CATEGORY_COLORS[cap.category] ?? "bg-gray-800 text-gray-300 border-white/10";
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-white text-sm leading-tight">{cap.title}</h4>
        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-semibold ${color}`}>
          {cap.category}
        </span>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed">{cap.description}</p>
      <div className="bg-black/30 rounded-lg px-3 py-2">
        <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Example: </span>
        <span className="text-xs text-gray-300 italic">{cap.example}</span>
      </div>
      <div className="flex flex-wrap gap-1 pt-1">
        {cap.tags.map((t) => (
          <span key={t} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5 text-gray-500">
            #{t}
          </span>
        ))}
      </div>
    </div>
  );
}
