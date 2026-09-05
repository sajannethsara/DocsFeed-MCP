# Contributing to DocsFeed MCP

Guidelines for setting up your local environment, managing databases, and submitting pull requests.

---

## Contribution Workflow

All active development targets the **`dev`** branch, not `main`.

1. **Fork and clone:** Fork the repository on GitHub, then clone your fork locally:
```bash
git clone https://github.com/<your-username>/docsfeed-mcp.git
cd docsfeed-mcp

```
2. **Add upstream remote:**
```bash
git remote add upstream https://github.com/your-org/docsfeed-mcp.git

```
3. **Sync before coding:** Ensure your local `dev` branch is completely up to date with `upstream/dev`:
```bash
git checkout dev
git pull upstream dev

```
4. **Create a branch:**
```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bugfix-name

```
5. **Commit your changes:** Follow Conventional Commits format (`feat: ...`, `fix: ...`, `chore: ...`).
6. **Sync again and resolve conflicts:** Fetch upstream updates before opening a PR:
```bash
git fetch upstream
git rebase upstream/dev

```
If conflicts occur, resolve them locally, stage the files, and run `git rebase --continue`.
7. **Verify build and tests:**
```bash
npm run lint
npm run test
npm run build

```
8. **Submit a Pull Request:** Push to your fork and open a PR targeting the original repository's **`dev`** branch.

---

## Prerequisites

* **Node.js:** `>= 20.0.0` (LTS) — [nodejs.org](https://nodejs.org/)
* **npm:** `>= 10.0` (or `pnpm`) — [pnpm.io/installation](https://pnpm.io/installation)
* **Git:** Latest version — [git-scm.com](https://git-scm.com/)
* **Docker:** Recommended for local PostgreSQL with `pgvector` — [docker.com](https://www.docker.com/)
* **Embedding API Key:** OpenAI or Gemini API key (recommended) — [platform.openai.com](https://platform.openai.com/) / [ai.google.dev](https://ai.google.dev/)
* **Ollama (Optional):** Alternative for running local embeddings — [ollama.ai](https://ollama.ai/)
* **Serverless PostgreSQL (Optional):** Alternative database tier — [neon.tech](https://neon.tech/) or [supabase.com](https://supabase.com/)

---

## Quickstart (Recommended: Docker Flow)

This setup uses Docker for the database and cloud APIs (OpenAI / Gemini) for embeddings.

### 1. Install dependencies

```bash
npm install

```
### 2. Configure environment

Copy the template file:

```bash
cp .env.example .env

```
Open `.env` and configure your database and embedding keys:

```env
# Local Docker Postgres (Default)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/docsfeed?schema=public"

# Embeddings (OpenAI or Gemini API recommended)
OPENAI_API_KEY="your-openai-api-key"
# or
GEMINI_API_KEY="your-gemini-api-key"

```
### 3. Start PostgreSQL container

```bash
npm run docker:up

```
*(To shut down the container later: `npm run docker:down`)*

### 4. Run migrations and seed data

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

```
### 5. Start development servers

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run individually:
npm run dev:web     # Frontend
npm run dev:server  # Backend

```
---

## Alternative Configurations

### Database: Serverless PostgreSQL (Neon / Supabase)

If you prefer not to run Docker locally:

1. Provision a PostgreSQL instance with `pgvector` on Neon or Supabase.
2. Update `.env` with your remote connection string:
```env
DATABASE_URL="postgresql://user:password@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"

```

3. Run `npm run prisma:migrate && npm run prisma:seed`.

### Embeddings: Local via Ollama

If you prefer offline embeddings instead of OpenAI/Gemini:

1. Install and start [Ollama](https://ollama.ai/).
2. Pull your desired embedding model:
```bash
ollama pull nomic-embed-text

```

3. Set your provider to local in `.env`:
```env
EMBEDDING_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"

```

---

## Default Seeded Accounts

The seed script (`npm run prisma:seed`) provisions the following credentials for testing:

* **Demo User:** `demo@docsfeed.dev`
* **Password:** `password123`
* **Sample MCP Servers:**
* `NestJS Official Docs` — Status: `READY` | Key: `df_live_nest_9f83a2bc81e74a1`
* `Next.js App Router` — Status: `READY` | Key: `df_live_next_1d48c0ba49e29a3`
* `Prisma ORM Docs` — Status: `CRAWLING` | Key: `df_live_prisma_7b29a1ee32c84f5`

# Happy Coding! 🚀


