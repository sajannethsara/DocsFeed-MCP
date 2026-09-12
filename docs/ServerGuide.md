# Architectural Guide: Applying NestJS to DocsFeed-MCP

This architectural guide translates NestJS core concepts directly into the domain and operational requirements of **DocsFeed-MCP** .

---

## 1. The Big Picture: DocsFeed-MCP Domain Model

**DocsFeed-MCP** serves two very different client workloads:
1. **Administrative REST Traffic (Next.js Dashboard)**: User auth, creating doc feeds, triggering crawls, viewing sync status, managing API keys.
2. **High-Throughput / Streaming MCP Agent Traffic (Cursor, Windsurf, Claude Desktop)**: Fast vector search (`search_docs`), Markdown fetching (`get_page`), and SSE (Server-Sent Events) or JSON-RPC connections over `/mcp/:sourceId`.

```
           [ Client: Next.js Web UI ]                  [ Client: Cursor / Claude Desktop ]
                      │                                                │
                 (REST API)                                    (MCP SSE / Stream)
                      ▼                                                ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │                             NestJS Server                              │
     │                                                                        │
     │  [Global Pipeline: Middleware ➔ Guards ➔ Interceptors ➔ Pipes]       │
     │                                                                        │
     │  ┌────────────────────────┐         ┌───────────────────────────────┐  │
     │  │     Feeds & Auth       │         │       MCP Protocol Engine     │  │
     │  │  (Dashboard REST APIs) │         │     (search_docs, get_page)   │  │
     │  └───────────┬────────────┘         └───────────────┬───────────────┘  │
     │              │                                      │                  │
     │              ▼                                      ▼                  │
     │  ┌────────────────────────┐         ┌───────────────────────────────┐  │
     │  │   Crawler & Ingestion  │ ◄─────► │       Embedding Engine        │  │
     │  │ (Crawlee / Turndown)   │ (Queue) │    (OpenAI / Gemini / Ollama) │  │
     │  └───────────┬────────────┘         └───────────────┬───────────────┘  │
     │              │                                      │                  │
     │              └──────────────────┬───────────────────┘                  │
     │                                 ▼                                      │
     │                       [ PrismaService (pg) ]                           │
     └─────────────────────────────────┼──────────────────────────────────────┘
                                       ▼
                       [( PostgreSQL + pgvector + pg-boss )]
```

---

## 2. The Three Core Pillars in DocsFeed-MCP

### Pillar 1: Modules (`@Module()`) — Domain Bounded Contexts
A Module is not just an organizational folder; it creates an **encapsulation boundary**. Providers are private to a module unless explicitly added to `exports`.

In `server/src`, rather than putting everything into a single monolithic service, organize your domains into cohesive modules:

| Proposed Module | Responsibility | Key Exports |
| :--- | :--- | :--- |
| `AuthModule` | JWT auth for dashboard users, password hashing | `AuthService`, `JwtAuthGuard` |
| `McpFeedModule` | CRUD for doc sources ([McpServer](file:///f:/Projects%202026/OC/docsfeed-mcp/server/prisma/schema.prisma#L30)), API key generation | `McpFeedService` |
| `CrawlerModule` | Web crawling, HTML parsing, Markdown conversion via Crawlee & Turndown | `CrawlerService`, `CrawlerWorker` |
| `EmbeddingModule` | Vector generation with pluggable providers (OpenAI, Gemini, Ollama) | `EmbeddingService` |
| `McpProtocolModule` | Model Context Protocol SDK integration, SSE/Stream endpoints, tool execution | `McpProtocolService` |
| `QueueModule` | Background job processing using `pg-boss` | `JobQueueService` |
| `DatabaseModule` | Global PostgreSQL connection via [PrismaService](file:///f:/Projects%202026/OC/docsfeed-mcp/server/src/database/prisma.service.ts) | `PrismaService` |

#### Architectural Rule for Modules
* **Keep modules independent**: `McpFeedModule` should not directly depend on `Crawlee`. Instead, when a crawl is triggered, `McpFeedModule` publishes a job to `QueueModule`, which `CrawlerModule` consumes.

---

### Pillar 2: Controllers (`@Controller()`) — Thin Orchestrators
As stated in [FileStructureRules.md](file:///f:/Projects%202026/OC/docsfeed-mcp/docs/FileStructureRules.md), **controllers must stay thin**. A controller should:
1. Receive and unwrap the HTTP/SSE request.
2. Delegate all logic to services.
3. Return the result.

```typescript
// Good: Thin controller delegating to service
@ApiTags('MCP Feeds')
@Controller('feeds')
@UseGuards(JwtAuthGuard)
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Post(':id/sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSync(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) {
    return this.feedsService.queueCrawlJob(id, user.id);
  }
}
```
*Notice:* The controller does not touch the database, does not call Crawlee, and does not validate the UUID manually (a Pipe handles that).

---

### Pillar 3: Providers & Services (`@Injectable()`) — Testable Business Logic
Services hold business rules, database queries, and third-party integrations.

#### The Strategy Pattern for Embeddings
DocsFeed-MCP supports OpenAI, Gemini, and local Ollama embeddings. Using NestJS's dependency injection and provider factories makes this clean and predictable:

```typescript
// Define a shared interface
export interface IEmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

// Injectable implementations
@Injectable()
export class OpenAiEmbeddingProvider implements IEmbeddingProvider { ... }

@Injectable()
export class OllamaEmbeddingProvider implements IEmbeddingProvider { ... }

// Factory Provider in EmbeddingModule
{
  provide: 'EMBEDDING_PROVIDER',
  useFactory: (config: ConfigService) => {
    const provider = config.get('EMBEDDING_PROVIDER');
    return provider === 'ollama' 
      ? new OllamaEmbeddingProvider(...) 
      : new OpenAiEmbeddingProvider(...);
  },
  inject: [ConfigService],
}
```
This isolates external SDK changes from your core chunking logic.

---

## 3. The 6-Stage Request Lifecycle Applied to DocsFeed-MCP

NestJS executes requests in a deterministic lifecycle order:

```
Incoming Request
       │
1. Middleware         (CORS, Request Correlation ID, Raw Body Handling)
       │
2. Guards             (JWT Auth for Dashboard, Scoped df_live_... API Key for MCP)
       │
3. Interceptors (Pre) (Timing start, Rate-limit check, Audit logging)
       │
4. Pipes              (ValidationPipe: Validate DTOs, ParseUUIDPipe, Sanitize query)
       │
5. Controller/Service (Pure domain logic & database transactions)
       │
6. Interceptors (Post) & Exception Filters
                      (Envelope formatting, Masking internal DB errors into clean JSON)
       │
Outgoing Response
```

### Stage 1: Middleware
* **DocsFeed Role**: 
  - Assigning a unique `x-request-id` to every incoming request for traceability across logs.
  - Handling raw streams: MCP client connections over Server-Sent Events (SSE) require keeping the HTTP connection open without Express timing out.

### Stage 2: Guards (`CanActivate`)
Guards execute **before** any handlers or pipes. If a guard returns `false`, execution stops immediately (saving CPU cycles).
* **Two distinct guard strategies for DocsFeed**:
  1. `JwtAuthGuard`: Protects private dashboard routes (`/api/feeds`, `/api/settings`) using Passport JWT.
  2. `ScopedApiKeyGuard`: Protects `/mcp/:sourceId`. Verifies the Bearer token (`df_live_...`), checks that the key belongs to the targeted `:sourceId`, and sets `req.mcpServer` on the request context.

### Stage 3: Interceptors (Pre-Controller)
* **DocsFeed Role**:
  - **Performance tracking**: Measure how long vector queries take.
  - **Connection limits**: Guard against resource exhaustion if dozens of AI agents open simultaneous SSE streams to the server.

### Stage 4: Pipes (`PipeTransform`)
Pipes validate and transform data **before** it reaches the controller handler.
* DocsFeed currently has a global `ValidationPipe` in [main.ts](file:///f:/Projects%202026/OC/docsfeed-mcp/server/src/main.ts#L15-L21) with:
  ```typescript
  whitelist: true,            // Strips unexpected fields
  transform: true,            // Converts primitive strings to numbers/booleans
  forbidNonWhitelisted: true, // Rejects malicious/unknown properties
  ```
* **Specific pipe use cases**:
  - `ParseUUIDPipe`: Ensures route parameters like `/feeds/:id` are valid UUIDs before executing any database queries.
  - `SanitizeSearchPipe`: Cleans semantic search query strings (stripping null bytes or regex exploit strings) before sending them to vector embeddings.

### Stage 5: Controller & Service
* **DocsFeed Role**:
  - The controller receives the sanitized, strongly-typed DTO.
  - The service executes domain logic. If indexing a page, it persists within a Prisma transaction (`this.prisma.$transaction`) to maintain data integrity between pages and vector chunks.

### Stage 6: Interceptors (Post) & Exception Filters (`ExceptionFilter`)
* **DocsFeed Role**:
  - **Post-Interceptors**: Wrap all REST API responses in a predictable shape:
    ```json
    { "success": true, "data": { ... }, "timestamp": "2026-09-12T03:56:11Z" }
    ```
  - **Custom Exception Filters**: When a third-party service fails (e.g., OpenAI API 429 rate limit or Crawlee connection timeout), an `ExternalServiceExceptionFilter` catches it and returns a clean, safe HTTP 503 or 429 to the client, preventing Prisma stack traces or API keys from leaking into client logs.

---

## 4. Architecting for the 5 Non-Functional Pillars

### 1. Scalability
* **Asynchronous Offloading via `pg-boss`**: Web crawling (Playwright/Crawlee) and vector chunking are CPU and I/O intensive. If run in the HTTP request loop, the server will drop connections. Always push crawl requests to a background queue (`QueueService.send('crawl-feed', { feedId })`) and return HTTP `202 Accepted`.
* **Streaming Responses for MCP**: MCP tools like `get_page` can return large Markdown files. Return Node streams or chunked responses rather than buffering megabytes in memory.

### 2. Reliability
* **Database Connection Pooling**: [prisma.service.ts](file:///f:/Projects%202026/OC/docsfeed-mcp/server/src/database/prisma.service.ts) connects via `pg.Pool`. Ensure pool sizes match your database tier:
  ```typescript
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Prevent exhaustion on concurrent requests
    idleTimeoutMillis: 30000,
  });
  ```
* **Graceful Shutdown**: Enable shutdown hooks in [main.ts](file:///f:/Projects%202026/OC/docsfeed-mcp/server/src/main.ts) so running crawl jobs can finish cleanly or re-queue before the container exits:
  ```typescript
  app.enableShutdownHooks();
  ```

### 3. Resource Low Use (Lean Footprint)
* **Zero-Redis Architecture**: By using PostgreSQL for both relational entities, vector embeddings (`pgvector`), and job queuing (`pg-boss`), DocsFeed eliminates Redis container overhead (RAM and network hops).
* **Headless Browser Recycling**: In the crawler worker, share and recycle Playwright browser contexts rather than launching a brand-new Chromium process for every single page.
* **Vector Batching**: Batch text chunks into single embedding API calls (e.g. 100 chunks per request) rather than making 100 separate HTTP calls.

### 4. Security
* **Tenant Isolation**: Ensure every query scopes data to the authenticated user or authenticated feed:
  ```typescript
  // In FeedsService:
  async findOne(feedId: string, userId: string) {
    const feed = await this.prisma.mcpServer.findFirst({
      where: { id: feedId, userId }, // Prevents IDOR (Insecure Direct Object Reference)
    });
    if (!feed) throw new NotFoundException('Feed not found');
    return feed;
  }
  ```
* **API Key Hashing**: In [schema.prisma](file:///f:/Projects%202026/OC/docsfeed-mcp/server/prisma/schema.prisma#L37), `apiKey` is currently stored in plain text. For production security, store a SHA-256 hash in the database and only return the raw token once upon creation (like GitHub personal access tokens).
* **CORS Hardening**: In [main.ts](file:///f:/Projects%202026/OC/docsfeed-mcp/server/src/main.ts#L10), replace `origin: '*'` with an environment-based origin whitelist so dashboard cookies and headers are restricted to trusted domains.

### 5. Code Understandability & Predictability
* **Single Directional Flow**: Request ➔ Guard ➔ Pipe ➔ Controller ➔ Service ➔ Database. Never call controllers from services or cross-import unrelated services directly.
* **Strict DTOs**: Create dedicated DTOs in `dto/` for every mutating action (e.g., `create-feed.dto.ts`, `search-query.dto.ts`). Every DTO property must have `@IsString()`, `@IsOptional()`, or `@IsUrl()` annotations.
* **Custom Parameter Decorators**: Instead of extracting user info from `req.user` inside controllers, use a custom `@CurrentUser()` decorator:
  ```typescript
  export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    },
  );
  ```

---

## 5. Blueprint: Ideal Server Directory Structure

Adhering to [FileStructureRules.md](file:///f:/Projects%202026/OC/docsfeed-mcp/docs/FileStructureRules.md), here is the modular architecture to scale `server/src`:

```
server/src/
├── common/                     # Cross-cutting concerns
│   ├── decorators/             # @CurrentUser(), @CurrentFeed()
│   ├── filters/                # all-exceptions.filter.ts, prisma-client-exception.filter.ts
│   ├── guards/                 # jwt-auth.guard.ts, scoped-api-key.guard.ts
│   ├── interceptors/           # logging.interceptor.ts, transform.interceptor.ts
│   └── pipes/                  # sanitize-query.pipe.ts
│
├── config/                     # Environment configuration & validation
│   └── configuration.ts        # Typed configuration schema
│
├── database/                   # Global Prisma ORM module
│   ├── database.module.ts
│   └── prisma.service.ts
│
├── modules/                    # Isolated domain features
│   ├── auth/                   # Authentication & User registration
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── dto/
│   │
│   ├── feeds/                  # MCP Server feeds management
│   │   ├── feeds.controller.ts
│   │   ├── feeds.service.ts
│   │   ├── feeds.module.ts
│   │   └── dto/
│   │
│   ├── crawler/                # Crawlee & Turndown parsing engine
│   │   ├── crawler.service.ts
│   │   ├── crawler.worker.ts   # pg-boss consumer
│   │   └── crawler.module.ts
│   │
│   ├── embeddings/             # Vectorization engine (OpenAI / Ollama)
│   │   ├── providers/          # openai.provider.ts, ollama.provider.ts
│   │   ├── embeddings.service.ts
│   │   └── embeddings.module.ts
│   │
│   ├── mcp/                    # Model Context Protocol Transport
│   │   ├── mcp.controller.ts   # SSE & Stream endpoints for agents (/mcp/:id)
│   │   ├── mcp.service.ts      # Exposes tools: search_docs, get_page, list_sections
│   │   └── mcp.module.ts
│   │
│   └── health/                 # Health checks & diagnostics
│
├── app.module.ts               # Root module aggregating domain modules
└── main.ts                     # Bootstrap, Swagger, Global Pipes & Filters
```