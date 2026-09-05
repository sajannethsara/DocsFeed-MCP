# Technology Stack

A direct, categorized breakdown of the core technologies, libraries, and frameworks powering **DocsFeed MCP**.

---

## 1. Monorepo & Tooling

* **Node.js (`>= 20.0.0 LTS`)**: Core JavaScript runtime environment.
* **npm Workspaces (`>= 10.0.0`)**: Monorepo orchestration managing `/server` and `/web` packages.
* **TypeScript (`^5.7.0`)**: Static typing enforced across all workspaces.
* **Prettier & ESLint**: Automated code formatting and strict quality linting.

---

## 2. Backend & Protocol (`/server`)

* **NestJS 11**: Modular backend architecture with dependency injection and REST controllers.
* **`@modelcontextprotocol/sdk`**: Official Model Context Protocol SDK exposing authenticated tools and SSE/stream endpoints to AI clients.
* **Swagger / OpenAPI**: Interactive API documentation available at `/api/docs`.
* **class-validator & class-transformer**: Declarative DTO validation and payload sanitization.
* **Passport & JWT**: Secure token-based authentication and route guards.

---

## 3. Database & Background Jobs

* **PostgreSQL (16+)**: Primary database for relational entities (Users, MCP Feeds, Pages).
* **`pgvector` Extension**: Vector indexing supporting cosine similarity search over embeddings.
* **Prisma ORM (v7)**: Type-safe database queries and migrations utilizing Prisma config and PostgreSQL driver adapters.
* **`pg-boss` (Zero-Redis)**: In-database background job queue executing asynchronous crawl and embedding tasks without external caching infrastructure.

---

## 4. Ingestion & Web Scraping

* **Crawlee**: Crawler orchestration with sitemap auto-discovery and concurrency management.
* **Playwright**: Headless Chromium runner for JavaScript-rendered single-page documentation sites.
* **Turndown**: HTML-to-Markdown engine converting parsed pages into clean, structured Markdown chunks.

---

## 5. Embeddings & AI Providers

* **OpenAI API**: Cloud embeddings using the `text-embedding-3-small` model.
* **Google Gemini API**: Alternative cloud vectorization using `text-embedding-004`.
* **Ollama**: Offline, local embeddings running `nomic-embed-text` with zero API cost.

---

## 6. Frontend & UI (`/web`)

* **Next.js 16**: Modern React framework powered by Turbopack and App Router.
* **React 19**: Modern component lifecycle and hooks.
* **Tailwind CSS**: Utility-first styling configured with the official **Emerald Theme**.
* **Shadcn UI**: Accessible, unstyled UI primitives (Dialogs, Cards, Badges, Buttons).
* **Lucide React**: Clean, consistent vector icon library.
* **React Hook Form & Zod**: Type-safe client-side form validation and schema parsing.
* **SWR**: Client-side data fetching and cache revalidation.
