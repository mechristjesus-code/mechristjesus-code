# Skill: fullstack-scaffolder

**Full-Stack Scaffolder** — Revolutionizing Application Development

Automates creation of production-ready, modular full-stack projects with
microservices architecture, monorepos, shared packages, and Docker infrastructure.

---

## Overview

The `fullstack-scaffolder` skill rapidly generates a complete project structure
so developers skip boilerplate and focus immediately on business logic.

### Key Features

- **Rapid Project Initialization** — complete project structure in minutes
- **Modular Microservices Architecture** — independent, scalable services
- **Technology Stack** — FastAPI (backend), React/TypeScript (frontend)
- **Infrastructure as Code** — Docker Compose, environment configs
- **Best Practices** — strong typing, structured logging, secure env management
- **Shared Packages** — common utilities (DB, security, config) across services
- **CI/CD Ready** — GitHub Actions pipeline scaffold included

---

## Project Structure Generated

```
project/
├── apps/
│   └── web/                # React/TypeScript frontend (Vite)
├── services/
│   ├── auth/               # FastAPI auth microservice (JWT)
│   └── tasks/              # FastAPI tasks microservice (CRUD)
├── packages/
│   └── shared/             # Shared Python utilities
├── infrastructure/
│   ├── docker-compose.dev.yml
│   ├── .env.example
│   └── ci-cd/              # GitHub Actions workflows
└── README.md
```

---

## Architectural Patterns

### API Gateway Pattern
Single entry point routing all client requests — handles authentication,
rate limiting, and request/response transformation.

### Database per Service
Each microservice maintains its own isolated PostgreSQL database for loose
coupling and independent schema evolution.

### Shared Utilities Package
Common code (DB connections, JWT handling, password hashing, config) extracted
into a `packages/shared` Python package for reuse across all services.

### Docker Orchestration
Docker Compose defines and runs all containers (databases, services, frontend)
with volume mounts for hot-reload in development.

---

## Backend Services

### Auth Service
- **Stack**: FastAPI + SQLAlchemy + Pydantic + PostgreSQL
- **Features**: User registration, login, JWT token generation/validation
- **Security**: `passlib` password hashing, bcrypt storage
- **Port**: 8001

### Tasks Service
- **Stack**: FastAPI + SQLAlchemy + Pydantic + PostgreSQL
- **Features**: Full CRUD operations for task management
- **Port**: 8002

---

## Frontend Application

- **Stack**: React 18 + TypeScript + Tailwind CSS + Zustand
- **Build**: Vite (fast hot-reload)
- **Patterns**: Functional components, end-to-end type safety, utility-first CSS
- **State**: Zustand (lightweight, flexible)
- **Port**: 3000

---

## Infrastructure

### Docker Compose
```bash
# Start full stack (dev mode with hot-reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Environment Variables
```env
SECRET_KEY=change-me-in-production
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### CI/CD (GitHub Actions)
- Lint + type-check (Python + TypeScript)
- Run unit + integration tests
- Build and push Docker images to GHCR
- Auto-deploy to production via SSH

---

## Demo Project: manus-demo-app

A complete task management application demonstrating all skill capabilities.

**GitHub**: `mechristjesus-code/mechristjesus-code`

### Capabilities Generated
1. Full monorepo with apps + services + packages layout
2. JWT-secured auth microservice
3. CRUD task management microservice  
4. React/TypeScript frontend with login + task UI
5. Docker Compose one-command local setup
6. `.env.example` for secure config management
7. CI/CD scaffold in `infrastructure/ci-cd/`

---

## Benefits

| Benefit | Description |
|---|---|
| ⚡ Efficiency | Save days of boilerplate setup |
| 📐 Consistency | Standardized patterns across all projects |
| 📈 Scalability | Clear path from simple app to complex ecosystem |
| 🔒 Security | JWT, hashed passwords, env var management baked in |
| ☁️ Cloud-Native | Production-ready Docker + CI/CD from day one |
