# Project Architecture & File Structure Rules

This guide defines the standardized architectural patterns, folder structures, and coding conventions for both the frontend (`/web`) and backend (`/server`). All future features and refactors must strictly follow these rules to maintain high predictability, readability, and scalability across the codebase.

---

## 1. Core Architectural Principles

1. **Feature Colocation**: Keep route-specific and domain-specific code located together in the same directory rather than scattering files across global folders.
2. **Single Responsibility**: 
   - `page.tsx` and controllers act solely as **orchestrators**.
   - UI rendering lives in dedicated component files.
   - Business/API logic lives in dedicated service files.
   - Types and schemas live in dedicated model/DTO files.
3. **Native Design Tokens**: In `/web`, use standard Shadcn design tokens (`bg-card`, `bg-primary`, `border-border`, `text-muted-foreground`) rather than ad-hoc arbitrary styles.

---

## 2. Frontend Structure (`/web`)

The Next.js App Router follows a route-level private folder pattern using the underscore prefix (`_components`, `_services`, `_models`).

### 2.1 Directory Layout

```
web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                     # Dashboard shell (Sidebar + Top Bar)
│   │   ├── page.tsx                       # Dashboard root redirect/overview
│   │   │
│   │   └── settings/                      # Canonical route example
│   │       ├── _components/               # Route-private presentation components
│   │       │   ├── health-check-card.tsx
│   │       │   ├── health-dialog.tsx
│   │       │   └── environment-card.tsx
│   │       ├── _services/                 # Route-private API clients & fetching logic
│   │       │   └── health.service.ts
│   │       ├── _models/                   # Route-private TypeScript types and interfaces
│   │       │   └── health.model.ts
│   │       ├── _hooks/                    # (Optional) Route-private custom React hooks
│   │       └── page.tsx                   # Route orchestrator
│   │
│   ├── globals.css                        # Official Shadcn Emerald theme variables
│   └── layout.tsx                         # Root HTML & body wrapper
│
├── components/
│   ├── ui/                                # Native Shadcn primitive components (Button, Card, AlertDialog, etc.)
│   └── sidebar.tsx                        # Global cross-route layout components
│
├── hooks/                                 # Shared, cross-feature React hooks
├── lib/
│   └── utils.ts                           # Global helper functions (cn, formatters)
└── types/                                 # Shared enterprise-wide domain models
```

### 2.2 Frontend Layer Responsibilities

| Directory | Purpose | Rules & Constraints |
| :--- | :--- | :--- |
| `_components/` | Presentation UI | Pure React components. Receive data & handlers via props. No direct `fetch` calls. |
| `_services/` | Data & API Calls | Async functions handling endpoints, error parsing, and fallback formatting. No JSX. |
| `_models/` | Type Definitions | TypeScript interfaces, type aliases, and enums representing request/response payloads. |
| `_hooks/` | Local State Logic | Custom hooks encapsulating complex multi-step state or polling for the route. |
| `page.tsx` | Route Orchestrator | Connects hooks/services to components. Keep under 100 lines of clean orchestration code. |

---

## 3. Backend Structure (`/server`)

The NestJS backend follows a scalable, domain-driven modular structure (Vertical Slices + Layered Architecture).

### 3.1 Directory Layout

```
server/src/
├── common/                                # Shared cross-cutting concerns
│   ├── decorators/                        # Custom parameter/method decorators (@CurrentUser, @Public)
│   ├── filters/                           # Global exception filters (http-exception.filter.ts)
│   ├── guards/                            # Global authentication & authorization guards
│   ├── interceptors/                      # Response transformation & logging interceptors
│   ├── pipes/                             # Custom validation & parse pipes
│   └── utils/                             # General server utilities & helpers
│
├── config/                                # Typed environment configuration
│   ├── configuration.ts                   # Config schema factory
│   └── env.validation.ts                  # Joi / class-validator schema for process.env
│
├── database/                              # Database layer
│   ├── prisma.service.ts                  # Prisma Client with connection adapter
│   └── database.module.ts                 # Global database module
│
├── modules/                               # Feature Domains (Domain Slices)
│   ├── auth/                              # Authentication & JWT
│   │   ├── dto/                           # LoginDto, RegisterDto
│   │   ├── guards/                        # JwtAuthGuard, LocalAuthGuard
│   │   ├── strategies/                    # JwtStrategy, LocalStrategy
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── mcp-servers/                       # MCP server lifecycle & management
│   │   ├── dto/                           # CreateMcpServerDto, UpdateMcpServerDto
│   │   ├── entities/                      # Serialization classes (if needed)
│   │   ├── mcp-servers.controller.ts
│   │   ├── mcp-servers.service.ts
│   │   └── mcp-servers.module.ts
│   │
│   ├── crawler/                           # Web scraping & crawling engine
│   ├── embeddings/                        # Vector generation & pgvector indexing
│   └── health/                            # System diagnostics & ping endpoint
│       ├── health.controller.ts
│       ├── health.service.ts
│       └── health.module.ts
│
├── app.module.ts                          # Root module registering all feature modules
└── main.ts                                # Server bootstrap, CORS, global pipes, Swagger setup
```

### 3.2 Backend Layer Responsibilities

| Layer / File | Responsibility |
| :--- | :--- |
| `*.controller.ts` | HTTP transport: routes, HTTP status codes, Swagger `@ApiOperation`, DTO input mapping. |
| `*.service.ts` | Core business logic: database queries (Prisma), external API calls, transaction handling. |
| `dto/*.dto.ts` | Input validation: `class-validator` rules (`@IsString`, `@IsUrl`) and Swagger `@ApiProperty`. |
| `*.module.ts` | Dependency injection boundary: imports required modules, declares controllers and providers. |
| `common/` | Reusable utilities applied globally across controllers and services. |

---

## 4. Naming & Coding Conventions

### 4.1 Filenames
- Always use **kebab-case** with appropriate dot-separated suffixes:
  - Components: `health-check-card.tsx`
  - Services: `health.service.ts`
  - Models / Interfaces: `health.model.ts`
  - DTOs: `create-mcp-server.dto.ts`
  - Modules: `mcp-servers.module.ts`
  - Controllers: `mcp-servers.controller.ts`

### 4.2 Symbols & Classes
- **Components & Classes**: `PascalCase` (`HealthCheckCard`, `McpServersService`, `PrismaService`).
- **Interfaces & Types**: `PascalCase` (`HealthResponse`, `HealthCheckResult`).
- **Variables & Functions**: `camelCase` (`checkServerHealth`, `handleHealthCheck`).
- **Constants & Enums**: `UPPER_SNAKE_CASE` or `PascalCase` (`McpServerStatus`).

### 4.3 Clean Code Rules
1. **No Inline HTTP Fetch in Presentation Components**: All network calls in `/web` must reside in the route's `_services/` directory.
2. **Defensive Response Handling**: Always account for missing properties and non-200 responses when consuming API responses in the frontend.
3. **No Business Logic in NestJS Controllers**: Controllers should only delegate immediately to services.
4. **Environment Isolation**: Never hardcode host URLs or ports. Use `process.env.NEXT_PUBLIC_API_URL` on the frontend and `ConfigService` on the backend.
