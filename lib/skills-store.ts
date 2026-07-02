// In-memory skill store (edge-compatible, resets on cold start)
// In production, swap this Map for a DB-backed store

export interface Capability {
  id:          string;
  title:       string;
  description: string;
  category:    string;
  example:     string;
  tags:        string[];
}

export interface Skill {
  id:          string;
  name:        string;
  description: string;
  source:      "upload" | "generated";
  fileType:    string;   // "md" | "pdf" | "txt" | "json" | "yaml"
  rawContent:  string;   // extracted text
  capabilities: Capability[];
  createdAt:   string;
}

const store = new Map<string, Skill>();

export function listSkills(): Skill[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSkill(id: string): Skill | undefined {
  return store.get(id);
}

export function saveSkill(skill: Skill): Skill {
  store.set(skill.id, skill);
  return skill;
}

export function deleteSkill(id: string): boolean {
  return store.delete(id);
}
