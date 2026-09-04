# DocsFeed MCP — Project Proposal & Setup Specification

**Status:** Pre-development / Bootstrap
**License target:** Open Source (MIT or Apache-2.0 — decide before first public commit)
**Audience:** Coding agent / contributors performing initial repo setup

---

## 1. Vision

docsfeed MCP lets a user submit a link to any software/system documentation site. The
system crawls it, converts it into structured, cross-linked Markdown, embeds it, and
exposes it as a per-user, authenticated **MCP (Model Context Protocol) server** —
so any MCP-compatible AI client (Claude, IDEs, agents) can query that documentation
as a live tool (`search_docs`, `get_page`, `list_sections`, etc.).

A single user can own multiple "doc sources," each becoming its own MCP server
instance with its own endpoint and API key, manageable through a Next.js dashboard.

---

## 2. Goals & Non-Goals

**Goals (v1 / MVP)**
- Submit a URL → crawl → structured Markdown → embed → queryable MCP server.
- Dashboard to create, inspect, re-crawl, and delete doc sources.
- Per-doc-source authenticated MCP endpoint (API key based).
- Pluggable embedding provider (start with 1–2 providers, architecture supports N).
- Background job visibility (crawl progress, embedding progress, failures).

**Non-Goals (defer to v2+)**
- Multi-tenant teams/orgs (start with single-user ownership).
- Real-time webhook-triggered re-crawls (start with manual + scheduled).
- Self-hosted embedding model inference UI (config only, not model management).
- Fine-grained per-page permissions.

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| API framework | **NestJS** (Express adapter) | Modular DI, good fit for provider-adapter pattern |
| Web UI | **Next.js + shadcn/ui** | Dashboard: create/manage/inspect MCP servers |
| API docs | **@nestjs/swagger** | Auto-generated OpenAPI spec |
| Queue / workers | **pg-boss** (Postgres queue) | Native PostgreSQL queue, zero Redis dependency |
| Crawling | **Crawlee + Playwright** | Domain bounding, retries, JS-hydrated SPA support |
| HTML→MD | **Turndown** (+ custom rules) | Structured Markdown conversion |
| Primary DB | **PostgreSQL (Serverless Neon / Supabase)** | Users, MCP servers, pages metadata |
| Vector store | **pgvector** (Postgres extension) | Keeps infra simple for MVP; swappable later |
| Auth | **JWT (dashboard) + API keys (MCP endpoints)** | Two distinct auth surfaces, see §7 |
| ORM | **Prisma** | Type-safe schema, good migration story, pairs well with NestJS |
| MCP transport | **@modelcontextprotocol/sdk** (HTTP/SSE) | Official SDK for server implementation |
| Containerization | **Docker (Optional alternative)** | Optional local PostgreSQL with pgvector |
| CI | **GitHub Actions** | Lint, typecheck, test, build on PR |

> **Decision needed before setup:** pgvector vs. dedicated vector DB (Qdrant).
> Recommendation: start with pgvector — one less service to run/host, sufficient
> for moderate scale, and keeps the OSS self-host story simple. Revisit if
> per-source corpus size regularly exceeds a few hundred thousand chunks.

---

## 4. Respecting Current Folder Structure

Current top-level layout:

```
docsfeed-mcp/
│   CONTRIBUTING.md
│   README.md
│
├───docs
│       Architecture.md
│
├───server
└───web
```

This is a **monorepo with two apps** (`server`, `web`) plus root-level project
docs. The proposal below fills in `server/` and `web/` without altering the
existing top-level shape. A root `package.json` (with workspaces) and a shared
`.env.example` are added.

```
docsfeed-mcp/
│   CONTRIBUTING.md
│   README.md
│   LICENSE                        # add before going public
│   package.json                   # npm/pnpm workspaces root
│   pnpm-workspace.yaml            # if using pnpm
│   docker-compose.yml             # postgres + redis + server + web (dev)
│   .env.example
│   .gitignore
│
├───docs
│       Architecture.md
│       PROJECT_PROPOSAL.md        # this document
│       API.md                     # generated/curated API reference
│       MCP_PROTOCOL.md            # how docsfeed maps docs to MCP tools
│
├───.github
│   └───workflows
│           ci.yml
│
├───server                         # NestJS app
│   │   package.json
│   │   nest-cli.json
│   │   tsconfig.json
│   │
│   ├───prisma
│   │       schema.prisma
│   │       migrations/
│   │
│   └───src
│       │   main.ts
│       │   app.module.ts
│       │
│       ├───common                 # guards, interceptors, filters, decorators
│       │       api-key.guard.ts
│       │       jwt.guard.ts
│       │       http-exception.filter.ts
│       │
│       ├───config                 # env validation, typed config modules
│       │       configuration.ts
│       │       validation.schema.ts
│       │
│       ├───auth
│       │       auth.module.ts
│       │       auth.service.ts
│       │       auth.controller.ts
│       │
│       ├───users
│       │       users.module.ts
│       │       users.service.ts
│       │
│       ├───doc-sources             # a "project" the user creates (1 = 1 MCP server)
│       │       doc-sources.module.ts
│       │       doc-sources.controller.ts
│       │       doc-sources.service.ts
│       │       dto/
│       │
│       ├───crawler
│       │   │   crawler.module.ts
│       │   │   crawler.service.ts       # enqueues crawl jobs
│       │   │   crawler.processor.ts     # BullMQ worker
│       │   └───lib
│       │           crawlee-config.ts
│       │           html-to-markdown.ts  # Turndown rules + link rewriting
│       │           doc-tree-builder.ts  # builds hierarchical page graph
│       │
│       ├───embeddings
│       │   │   embeddings.module.ts
│       │   │   embeddings.service.ts    # provider-agnostic facade
│       │   │   embeddings.factory.ts    # resolves provider per doc-source config
│       │   │
│       │   ├───interfaces
│       │   │       embedding-provider.interface.ts
│       │   │
│       │   └───providers
│       │       ├───openai
│       │       │       openai.provider.ts
│       │       │       openai.config.ts
│       │       ├───cohere
│       │       │       cohere.provider.ts
│       │       ├───voyage
│       │       │       voyage.provider.ts
│       │       └───local
│       │               local.provider.ts      # e.g. Ollama / TEI endpoint
│       │
│       ├───vector-store
│       │       vector-store.module.ts
│       │       vector-store.service.ts   # pgvector queries (KNN search etc.)
│       │
│       ├───jobs                      # BullMQ queue definitions + status API
│       │       jobs.module.ts
│       │       queue.constants.ts
│       │       jobs.controller.ts       # progress polling for the dashboard
│       │
│       ├───mcp-server                # dynamic per-doc-source MCP endpoint
│       │       mcp-server.module.ts
│       │       mcp-server.controller.ts # :docSourceId route + api-key guard
│       │       mcp-tools.service.ts     # search_docs, get_page, list_sections
│       │
│       └───api-keys
│               api-keys.module.ts
│               api-keys.service.ts      # generation, hashing, revocation
│
└───web                             # Next.js app
    │   package.json
    │   next.config.js
    │   tailwind.config.ts
    │
    └───src
        ├───app
        │   ├───(dashboard)
        │   │   ├───doc-sources
        │   │   │       page.tsx           # list
        │   │   │       [id]/page.tsx      # inspect: pages, status, MCP config
        │   │   │       new/page.tsx       # create flow
        │   │   └───settings
        │   │           page.tsx           # API keys, embedding provider config
        │   └───(auth)
        │           login/page.tsx
        │
        ├───components
        │   ├───ui                  # shadcn generated components
        │   └───doc-source          # DocSourceCard, CrawlProgress, McpEndpointPanel
        │
        ├───lib
        │       api-client.ts       # typed client against Swagger-generated types
        │       auth.ts
        │
        └───hooks
                use-job-status.ts   # polling/subscription for crawl+embed progress
```

---

## 5. Data Model (high level)

Core Prisma entities to scaffold first:

- **User** — id, email, passwordHash, createdAt
- **DocSource** — id, userId, name, rootUrl, status (`pending|crawling|embedding|ready|failed`), embeddingProvider, embeddingModel, crawlConfig (JSON: max depth, include/exclude globs), createdAt
- **Page** — id, docSourceId, url, canonicalUrl, contentHash, markdownContent, parentPageId (nullable, builds the doc tree), title, order
- **Chunk** — id, pageId, docSourceId, content, tokenCount, embedding (`vector`), position
- **CrawlJob** — id, docSourceId, status, startedAt, finishedAt, pagesFound, pagesFailed, error
- **ApiKey** — id, docSourceId, hashedKey, prefix (shown in UI), createdAt, lastUsedAt, revokedAt

**Key relationships:** one `DocSource` → many `Page` (self-referential parent for
hierarchy) → many `Chunk`. One `DocSource` → one active `ApiKey` (support
rotation by allowing multiple with only one non-revoked at a time).

---

## 6. Pipeline Flow

1. **Submit** — user posts a root URL + crawl config via `POST /doc-sources`.
2. **Enqueue crawl** — `CrawlerService` pushes a job to BullMQ (`crawl` queue).
3. **Crawl** — Crawlee/Playwright worker walks the domain respecting
   `robots.txt`, concurrency, and depth limits; emits raw HTML per page.
4. **Convert** — Turndown converts HTML → Markdown; a custom rule set rewrites
   internal links to point at sibling Markdown files/page IDs and strips nav/
   footer boilerplate.
5. **Build doc tree** — pages are linked into a hierarchy (via sitemap structure
   or crawl parent/child relation) so retrieval can respect document context,
   not just flat chunks.
6. **Chunk** — Markdown split by heading/section boundaries (not naive fixed-size)
   to preserve semantic units.
7. **Embed** — `EmbeddingsService` resolves the configured provider adapter and
   embeds chunks in batches (queued separately from crawling — `embed` queue).
8. **Store** — chunks + vectors persisted via `VectorStoreService` (pgvector).
9. **Serve** — `DocSource` flips to `ready`; its dedicated MCP endpoint
   (`/mcp/:docSourceId`, API-key gated) becomes queryable, exposing tools like
   `search_docs(query)`, `get_page(pageId)`, `list_sections()`.
10. **Re-crawl** — manual trigger or scheduled job; only pages whose
    `contentHash` changed are re-chunked/re-embedded.

---

## 7. Auth Model

Two distinct surfaces, deliberately separate:

- **Dashboard auth (JWT)** — standard email/password (or OAuth later) session
  for the Next.js app; guards `doc-sources`, `jobs`, `api-keys` controllers.
- **MCP endpoint auth (API key)** — each `DocSource` has its own key(s).
  MCP clients authenticate via `Authorization: Bearer <key>` against
  `/mcp/:docSourceId`. Keys are hashed at rest; only shown once on creation.
  This keeps a leaked MCP key scoped to a single doc source, not the whole account.

---

## 8. Setup Checklist for the Coding Agent

1. Initialize workspaces: root `package.json` with `server` and `web` as workspaces (pnpm or npm workspaces).
2. Scaffold NestJS app in `server/` (`@nestjs/cli new`), wire `@nestjs/swagger` at `/api/docs`.
3. Add Prisma to `server/`, define schema per §5, run initial migration against a local Postgres (via `docker-compose.yml`) with the `pgvector` extension enabled.
4. Add Redis + BullMQ; create `crawl` and `embed` queues with a shared `jobs` module for status polling.
5. Scaffold Next.js app in `web/` with shadcn/ui initialized; stub the routes listed in §4.
6. Implement `embeddings` module with the interface + one working provider (recommend OpenAI first for fastest MVP) and one stub/local provider to prove the adapter pattern works before adding more.
7. Implement `crawler` module using Crawlee + Playwright against a single test doc site end-to-end before generalizing.
8. Implement `mcp-server` module last, once at least one `DocSource` can reach `ready` status with real chunks/embeddings.
9. Add `.env.example`, `docker-compose.yml`, and a root `README.md` "Quickstart" section so external contributors can run the full stack in one command.
10. Add GitHub Actions CI (lint + typecheck + build) before making the repo public.
11. Add `LICENSE` and finalize `CONTRIBUTING.md` (issue templates, PR checklist) as the last step before flipping the repo to public.

---

## 9. Open Questions to Resolve Before/During Build

- Vector store: confirm pgvector vs. Qdrant (recommendation: pgvector, §3).
- Which embedding provider ships first, and how are provider API keys stored per-user (encrypted column vs. secrets manager)?
- Rate limiting strategy per target domain during crawling (Crawlee config defaults vs. custom).
- Scheduled re-crawl cadence — configurable per `DocSource` or global default?
- License choice (MIT vs. Apache-2.0) — affects `LICENSE` file and README badge.