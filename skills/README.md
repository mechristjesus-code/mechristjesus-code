# Skills Library

This directory contains all skills uploaded to the Creator DNA OS repository.
Each skill is a structured knowledge document that can be loaded into the
Skills Hub (`/skills`) for AI capability generation.

## Available Skills

| Skill | Description | File |
|---|---|---|
| [fullstack-scaffolder](./fullstack-scaffolder/SKILL.md) | Auto-scaffold production full-stack monorepos with FastAPI + React microservices | SKILL.md |
| [creator-dna-os](./creator-dna-os/SKILL.md) | Complete AI creator platform — auth, projects, DNA profiles, AI generation, media | SKILL.md |
| [var-syntax](./var-syntax/SKILL.md) | Document variable syntax reference — conditionals, calculations, formatting, masking | SKILL.md |

## How to Use

### In the Skills Hub (Web UI)
1. Go to `/skills` in the app
2. Click **Upload Skill File**
3. Upload any `SKILL.md` from this directory
4. Click **✨ Generate Capabilities** — AI reads the file and builds a capability set

### Via Termux / CLI
```bash
# Upload a skill via API
curl -X POST http://localhost:13000/api/skills/upload \
  -F "file=@skills/fullstack-scaffolder/SKILL.md"
```

## Adding New Skills

Create a new folder under `skills/` with a `SKILL.md`:
```
skills/
└── my-new-skill/
    └── SKILL.md    ← describe what the skill does, syntax, examples
```

The Skills Hub AI will auto-generate capabilities from any `.md` file.
