# Skill: creator-dna-os

**Creator DNA OS** — Production-Ready AI Creator Platform

Empowers content creators with intelligent tools for generating, managing,
and exporting content. Modular microservices architecture with FastAPI backend,
React/TypeScript frontend, Docker orchestration, and GitHub Actions CI/CD.

---

## Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Secure registration, login, profile management via JWT |
| 📊 Dashboard | Projects overview, Creator DNA insights, quick AI tool access |
| 📁 Projects | Full CRUD project management with search |
| 🧬 Creator DNA | Writing preferences, prompt templates, brand settings — learns from edits |
| 🤖 AI Services | Generate scripts, titles, descriptions, hashtags, summaries, ideas |
| 🎬 Media Management | Import YouTube URLs, extract transcripts, generate subtitles |
| 📤 Export | Markdown, PDF, DOCX, TXT formats |
| 🔗 REST API | Full API for every service |

---

## Tech Stack

### Backend
- **Python** + **FastAPI** — high-performance async APIs
- **SQLAlchemy** — ORM for PostgreSQL
- **PostgreSQL** — primary relational database
- **Redis** — caching and rate limiting
- **JWT** — token-based authentication
- **Alembic** — database migrations

### Frontend
- **React** + **TypeScript** — type-safe UI
- **Tailwind CSS** — utility-first styling
- **Zustand** — lightweight state management
- **Vite** — fast dev server with HMR

### Infrastructure
- **Docker** + **Docker Compose** — containerized dev + prod
- **GitHub Actions** — CI/CD pipeline
- **FFmpeg** — media processing

### AI
- **OpenAI API** — GPT-4o for content generation
- **Modular AI Services** — plug-in additional models

---

## Architecture

```
User/Client
    │
    ▼ HTTP/S
API Gateway (:8000)
    │
    ├──▶ Auth Service    (:8001) ──▶ PostgreSQL
    ├──▶ AI Service      (:8002) ──▶ OpenAI API
    ├──▶ DNA Service     (:8003) ──▶ PostgreSQL
    ├──▶ Memory Service  (:8004) ──▶ PostgreSQL
    ├──▶ Media Service   (:8005) ──▶ PostgreSQL
    └──▶ Projects Service(:8006) ──▶ PostgreSQL
                │
                └──▶ Redis (cache + rate limiting)
```

---

## Folder Structure

```
creator-dna-os/
├── apps/
│   ├── web/             # React/TypeScript web app
│   └── mobile/          # React Native (placeholder)
├── services/
│   ├── gateway/         # API Gateway — routing + auth
│   ├── auth/            # Authentication service
│   ├── ai/              # AI content generation
│   ├── dna/             # Creator DNA profiles
│   ├── memory/          # User learning + history
│   ├── media/           # YouTube + media processing
│   └── projects/        # Project CRUD management
├── packages/
│   └── shared/          # config, database, security, utils
├── database/
│   ├── migrations/      # Alembic migrations
│   └── seeds/           # Seed data
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── docker-compose.dev.yml
└── .env.example
```

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/mechristjesus-code/mechristjesus-code.git
cd mechristjesus-code

# 2. Configure
cp .env.example .env
# Edit .env → set OPENAI_API_KEY and SECRET_KEY

# 3. Run everything
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Frontend → `http://localhost:3000`
API Gateway → `http://localhost:8000`
API Docs → `http://localhost:8000/docs`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT signing key — use strong random string |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for AI features |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `YOUTUBE_API_KEY` | Optional | YouTube Data API v3 for transcript extraction |
| `OPENAI_MODEL` | Optional | Default: `gpt-4o` |

---

## Security

- **JWT Authentication** — all API routes protected
- **bcrypt Password Hashing** — passwords never stored plain
- **Redis Rate Limiting** — prevents API abuse
- **Pydantic Validation** — all inputs validated at API boundary
- **CORS** — origin whitelist via `CORS_ORIGINS`
- **Env Variables** — no secrets hardcoded

---

## CI/CD Pipeline (GitHub Actions)

Triggered on push to `main`:
1. **Lint + Type-check** — Python (flake8) + TypeScript (tsc)
2. **Tests** — pytest for backend, vitest for frontend
3. **Docker Build + Push** — images to GitHub Container Registry (GHCR)
4. **Deploy** — SSH deploy to production server

Required GitHub Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`

---

## Creator DNA Feature (Core)

The DNA profile system learns from each user edit to improve AI outputs:

1. User defines **writing preferences** (tone, length, style)
2. User sets **prompt templates** (reusable AI instructions)
3. User configures **brand settings** (voice, keywords, audience)
4. System tracks **edit history** to refine future generations
5. AI outputs become more personalized over time
