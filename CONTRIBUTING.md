# Contributing to DocsFeed MCP

Thank you for your interest in contributing to **DocsFeed MCP**! This guide walks you through setting up your development environment, database management, testing, and understanding our project conventions.

---

## Architecture Highlight: Zero-Redis, Serverless Postgres Ready

DocsFeed MCP is designed for simplicity and modern serverless infrastructure:
- **Primary Database**: PostgreSQL with `pgvector` (fully compatible with serverless providers like [Neon](https://neon.tech/) and [Supabase](https://supabase.com/)).
- **Background Jobs**: Powered by **`pg-boss`** directly on PostgreSQL. **No Redis or extra caching services required.**
- **Docker is Optional**: You can develop completely without Docker by connecting to a free serverless PostgreSQL database (e.g. Neon), or optionally run local PostgreSQL via Docker Compose.

---

## Table of Contents

- [1. Prerequisites & Tooling](#1-prerequisites--tooling)
- [2. Quickstart Guide (Serverless Flow - Recommended)](#2-quickstart-guide-serverless-flow---recommended)
- [3. Alternative Setup: Local Docker Flow](#3-alternative-setup-local-docker-flow)
- [4. Environment Variables](#4-environment-variables)
- [5. Database Management & Seeding](#5-database-management--seeding)
- [6. Running the Development Servers](#6-running-the-development-servers)
- [7. Testing & Quality Checks](#7-testing--quality-checks)
- [8. Project Architecture & Directory Layout](#8-project-architecture--directory-layout)
- [9. Contribution Workflow](#9-contribution-workflow)
- [10. Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites & Tooling

| Tool | Recommended Version | Purpose | Download / Sign-up Link |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (LTS) | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** or **pnpm** | `npm >= 10.0` or `pnpm >= 9.0` | Package manager / Monorepo workspaces | [pnpm.io/installation](https://pnpm.io/installation) |
| **Serverless PostgreSQL** | Free tier | PostgreSQL database with pgvector & pg-boss | [neon.tech](https://neon.tech/) or [supabase.com](https://supabase.com/) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |
| **Docker** *(Optional)* | Latest | Optional alternative for local PostgreSQL | [docker.com](https://www.docker.com/) |
| **Ollama** *(Optional)* | Latest | Local embeddings runner (no API key needed) | [ollama.ai](https://ollama.ai/) |

> [!TIP]
> If you plan to use local embeddings instead of OpenAI, install [Ollama](https://ollama.ai/) and pull the embedding model:
> ```bash
> ollama pull nomic-embed-text
> ```

---

## 2. Quickstart Guide (Serverless Flow - Recommended)

Follow these steps to get started in minutes without needing Docker or Redis:

### 1. Clone the repository
```bash
git clone https://github.com/your-org/docsfeed-mcp.git
cd docsfeed-mcp
```

### 2. Install dependencies
Run from the root directory to install all dependencies for both `server` and `web` workspaces:
```bash
npm install
# or if using pnpm:
# pnpm install
```

### 3. Setup environment variables
Copy the template configuration file:
- **macOS / Linux:**
  ```bash
  cp .env.example .env
  ```
- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```

Open `.env` and paste your Serverless PostgreSQL connection string (from Neon or Supabase):
```env
DATABASE_URL="postgresql://user:password@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 4. Apply database schema migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed sample data
Populate the database with sample users and MCP servers:
```bash
npm run prisma:seed
```

### 6. Start the development servers
```bash
npm run dev
```

The services will be available at:
- 🌐 **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- ⚙️ **NestJS API Server:** [http://localhost:4000](http://localhost:4000)
- 📖 **Swagger API Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 3. Alternative Setup: Local Docker Flow

If you prefer running a local PostgreSQL instance with `pgvector` instead of a serverless database:

1. Start the PostgreSQL container:
   ```bash
   npm run docker:up
   ```
2. Set your `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/docsfeed?schema=public"
   ```
3. Run migrations and seed:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```
4. Start dev servers:
   ```bash
   npm run dev
   ```

*(To stop the local container: `npm run docker:down`)*

---

## 4. Environment Variables

Below is the reference `.env` configuration:

```env
# Application Environment
NODE_ENV=development
PORT=4000

# PostgreSQL (Serverless Neon / Supabase or Local Docker)
DATABASE_URL="postgresql://user:password@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Authentication (JWT Secret for Dashboard Session)
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Embedding Providers Configuration
EMBEDDING_PROVIDER="local" # "local" or "openai"
LOCAL_EMBEDDING_URL="http://localhost:11434"
OPENAI_API_KEY=""
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"

# Web Dashboard (Next.js)
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## 5. Database Management & Seeding

We use [Prisma ORM](https://www.prisma.io/) to manage data models located in `server/prisma/schema.prisma`.

### Common Prisma Commands

Run these from root or inside the `server/` workspace:

- **Apply Migrations (Development):**
  ```bash
  npm run prisma:migrate
  ```
- **Regenerate Prisma Client:**
  ```bash
  npm run prisma:generate
  ```
- **Seed Sample Data:**
  ```bash
  npm run prisma:seed
  ```
- **Open Prisma Studio (Web GUI for Database):**
  ```bash
  npm run prisma:studio
  ```
  *(Opens GUI at [http://localhost:5555](http://localhost:5555))*

### Default Seeded Accounts

The seed script creates a test user and sample MCP servers:

- **Demo User:** `demo@docsfeed.dev`
- **Password:** `password123`
- **Sample MCP Servers:**
  - `NestJS Official Docs` (Status: `READY`, API Key: `df_live_nest_9f83a2bc81e74a1`)
  - `Next.js App Router` (Status: `READY`, API Key: `df_live_next_1d48c0ba49e29a3`)
  - `Prisma ORM Docs` (Status: `CRAWLING`, API Key: `df_live_prisma_7b29a1ee32c84f5`)

---

## 6. Running the Development Servers

You can run both workspaces together or each one independently:

### All Workspaces (Concurrently)
```bash
npm run dev
```

### Backend Only (`server/` - NestJS)
```bash
npm run dev:server
# or
cd server && npm run dev
```

### Frontend Only (`web/` - Next.js)
```bash
npm run dev:web
# or
cd web && npm run dev
```

---

## 7. Testing & Quality Checks

Ensure your code adheres to linting and formatting standards before opening a pull request:

```bash
# Run linting across all packages
npm run lint

# Run unit and integration tests
npm run test

# Format code with Prettier
npx prettier --write .
```

---

## 8. Project Architecture & Directory Layout

```
docsfeed-mcp/
├── .github/workflows/         # CI pipelines
├── docs/                      # Proposal and architecture docs
├── server/                    # NestJS backend + MCP server
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (User, McpServer, Page)
│   │   └── seed.ts            # Database seeder
│   └── src/
│       ├── auth/              # JWT auth, login, signup
│       ├── users/             # User management
│       ├── mcp-servers/       # User MCP servers, CRUD, keys, tools
│       ├── embeddings/        # Pluggable embeddings (OpenAI, Local/Ollama)
│       ├── database/          # Prisma client module
│       └── common/            # Shared guards, decorators, filters
├── web/                       # Next.js 15 + shadcn/ui frontend
│   └── src/
│       ├── app/               # Next.js App Router pages
│       ├── components/        # UI components
│       ├── hooks/             # Custom React hooks
│       └── lib/               # Utility functions & API client
├── docker-compose.yml         # Optional local PostgreSQL (pgvector)
└── package.json               # Monorepo workspaces config
```

---

## 9. Contribution Workflow

1. **Branch naming**: Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
2. **Commit conventions**: Use Conventional Commits (`feat: ...`, `fix: ...`, `chore: ...`).
3. **Verify locally**: Ensure `npm run lint`, `npm run test`, and `npm run build` pass without errors.
4. **Open a Pull Request**: Submit your PR targeting `main`.

---

## 10. Troubleshooting

### 1. Database Connection Issues
- **Serverless (Neon / Supabase):** Verify your connection string in `.env` includes `?sslmode=require` if required by the cloud provider.
- **Local Docker:** If port `5432` is occupied by another local service, change the port mapping in `docker-compose.yml` (e.g. `5433:5432`) and update `DATABASE_URL`.

### 2. pg-boss Job Queue
- `pg-boss` automatically manages its own schema and tables (`pgboss.*`) inside your existing PostgreSQL database on startup. No extra configuration or manual migrations are required.

### 3. Prisma Schema Out of Sync
- Run `npm run prisma:generate` followed by `npm run prisma:migrate`.

---

Happy Coding! 🚀
