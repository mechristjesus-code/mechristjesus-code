# Manus Demo App: Full-Stack Task Management

This project demonstrates the capabilities of the `fullstack-scaffolder` skill by providing a production-ready, modular full-stack task management application. It features a microservices architecture, a React/TypeScript frontend, and robust infrastructure setup.

## Table of Contents
- [1. Project Goal](#1-project-goal)
- [2. Architecture Overview](#2-architecture-overview)
- [3. Monorepo Structure](#3-monorepo-structure)
- [4. Backend Microservices](#4-backend-microservices)
  - [4.1. `auth` Service](#41-auth-service)
  - [4.2. `tasks` Service](#42-tasks-service)
- [5. Shared Package (`packages/shared`)](#5-shared-package-packagesshared)
- [6. Frontend Application (`apps/web`)](#6-frontend-application-appsweb)
- [7. Infrastructure](#7-infrastructure)
- [8. Getting Started](#8-getting-started)
  - [8.1. Prerequisites](#81-prerequisites)
  - [8.2. Setup](#82-setup)
  - [8.3. Running the Application](#83-running-the-application)
- [9. Development](#9-development)
- [10. References](#10-references)

## 1. Project Goal
To create a production-ready, modular full-stack task management application with a clear architecture, backend microservices, a modern frontend, and robust infrastructure.

## 2. Architecture Overview
The application follows a microservices architecture with an API Gateway pattern, database per service, and a shared utilities package, all orchestrated using Docker Compose [1].

## 3. Monorepo Structure
The project adopts a monorepo layout to manage different components:

```
manus-demo-app/
├── apps/
│   └── web/                # React/TypeScript frontend application
├── services/
│   ├── auth/               # FastAPI microservice for authentication
│   └── tasks/              # FastAPI microservice for task management
├── packages/
│   └── shared/             # Shared Python package for common utilities
├── infrastructure/
│   ├── docker-compose.dev.yml # Docker Compose for local development
│   ├── .env.example        # Environment variables template
│   └── ci-cd/              # Placeholder for CI/CD configurations
└── README.md               # Project documentation
```

## 4. Backend Microservices

### 4.1. `auth` Service
- **Technology**: FastAPI, SQLAlchemy, Pydantic
- **Functionality**: User registration, login, JWT token generation, password hashing.
- **Database**: PostgreSQL (dedicated to auth service).

### 4.2. `tasks` Service
- **Technology**: FastAPI, SQLAlchemy, Pydantic
- **Functionality**: CRUD operations for tasks (create, read, update, delete).
- **Database**: PostgreSQL (dedicated to tasks service).

## 5. Shared Package (`packages/shared`)
This Python package contains common utilities to be shared across backend services [2].
- `config.py`: Application settings and environment variable loading.
- `security.py`: JWT encoding/decoding, password hashing utilities.
- `database.py`: SQLAlchemy base, session management.
- `utils.py`: Logging, exception handling.

## 6. Frontend Application (`apps/web`)
- **Technology**: React, TypeScript, Tailwind CSS, Zustand, React Router DOM.
- **Functionality**: User interface for task management, user authentication flow.

## 7. Infrastructure
- **Docker Compose**: Orchestrates all services (PostgreSQL, Auth, Tasks, Web) for local development.
- **CI/CD**: Placeholder for GitHub Actions workflows for linting, testing, and deployment.
- **Environment Variables**: `.env.example` defines all necessary environment variables for local setup.

## 8. Getting Started

### 8.1. Prerequisites
- Docker and Docker Compose
- Node.js (for frontend development)
- Python 3.11 (for backend development)

### 8.2. Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd manus-demo-app
   ```
2. Copy the example environment variables file:
   ```bash
   cp infrastructure/.env.example .env
   # Edit .env with your desired values, especially JWT_SECRET
   ```

### 8.3. Running the Application
To start all services using Docker Compose:
```bash
docker-compose -f infrastructure/docker-compose.dev.yml up --build
```

This will:
- Start PostgreSQL databases for `auth` and `tasks` services.
- Build and run the `auth` and `tasks` FastAPI microservices.
- Build and run the `web` React frontend.

The frontend will be accessible at `http://localhost:3000`.

## 9. Development

### Backend Services
Each backend service (`auth`, `tasks`) can be developed independently. Changes will be reflected automatically due to volume mounts in `docker-compose.dev.yml`.

### Frontend Application
Navigate to `apps/web` and run `npm install` followed by `npm run dev` to run the frontend in development mode outside of Docker, allowing for faster hot-reloading.

## 10. References
[1] [Microservices Architecture Patterns](file:///home/ubuntu/skills/fullstack-scaffolder/references/architecture_patterns.md)
[2] [Shared Package Setup Template](file:///home/ubuntu/skills/fullstack-scaffolder/templates/shared_package_setup.py)
