# File Structure & Code Organization Rules

A practical, direct guide for contributors on organizing, adding, and modifying code across **`/web`** and **`/server`**.

---

## 1. Golden Rules

1. **Colocate by feature, not by type**: Keep everything a feature needs (components, API calls, types, services) inside that feature's directory.
2. **Orchestrators stay thin**: `page.tsx` (frontend) and `*.controller.ts` (backend) only orchestrate—they never contain business logic, raw queries, or heavy JSX.
3. **Kebab-case naming**: All filenames use kebab-case with explicit role suffixes (`*.service.ts`, `*.model.ts`, `*.dto.ts`, `*.controller.ts`).

---

## 2. Frontend Guidelines (`/web`)

Every route under `web/src/app/` is self-contained. Private subdirectories start with an underscore (`_`) so Next.js does not treat them as routes.

### Canonical Route Pattern: `settings/`

```
settings/
├── _components/        # Private UI elements used only in this route
├── _services/          # API callers and fetch handlers (no JSX)
├── _models/            # TypeScript interfaces & response types
├── _hooks/             # (Optional) Route-specific state hooks
└── page.tsx            # Route orchestrator (< 100 lines)
```

### Contributor Workflow for Web

* **Adding a new page/route:**
  1. Create a folder in `web/src/app/(dashboard)/<feature-name>/`.
  2. Create `_models/<feature>.model.ts` for data interfaces.
  3. Create `_services/<feature>.service.ts` for HTTP requests.
  4. Create `_components/` for UI cards, dialogs, and forms.
  5. Create `page.tsx` to wire data from services into components.

* **Adding reusable UI:**
  * If a component is used in **one route only** → put it in that route's `_components/`.
  * If a primitive is universal (button, dialog, card) → `web/src/components/ui/` (native Shadcn).
  * If a layout piece is shared across routes (sidebar, nav) → `web/src/components/`.

* **Deleting/Refactoring a route:**
  * Delete the route folder (`<feature-name>/`). All its private models, services, and UI components are removed cleanly without leaving orphan files elsewhere.

---

## 3. Backend Guidelines (`/server`)

The NestJS backend is organized into isolated domain modules under `server/src/modules/`.

### Canonical Module Pattern: `modules/health/`

```
modules/health/
├── health.controller.ts    # HTTP routes & transport layer (@Get, @Post, Swagger tags)
├── health.service.ts       # Business logic & database operations (Prisma queries)
├── health.module.ts        # Module definition & dependency wiring
└── dto/                    # (Optional) Input validation schemas (class-validator)
```

### Contributor Workflow for Server

* **Adding a new backend feature:**
  1. Create `server/src/modules/<feature-name>/`.
  2. Create `<feature>.service.ts` with business logic and Prisma operations.
  3. Create `<feature>.controller.ts` with route decorators and status codes.
  4. Create `dto/create-<feature>.dto.ts` for request validation if handling inputs.
  5. Create `<feature>.module.ts` registering the controller and service.
  6. Import the new module in `server/src/app.module.ts`.

* **Shared backend code:**
  * Global database access → `server/src/database/` (`prisma.service.ts`).
  * Cross-cutting filters, guards, decorators → `server/src/common/`.
  * App configuration & env variables → `server/src/config/`.

* **Deleting a backend feature:**
  1. Remove the module import from `app.module.ts`.
  2. Delete `server/src/modules/<feature-name>/`. No database queries or controllers leak into the rest of the application.

---

## 4. Summary Table

| Location | Responsibility | Example |
| :--- | :--- | :--- |
| `web/src/app/**/_components/` | Route-specific UI components | `health-check-card.tsx` |
| `web/src/app/**/_services/` | HTTP calls & error normalization | `health.service.ts` |
| `web/src/app/**/_models/` | Data interfaces & types | `health.model.ts` |
| `web/src/components/ui/` | Primitive Shadcn components | `button.tsx`, `card.tsx` |
| `server/src/modules/**/` | Self-contained domain slice | `health/health.service.ts` |
| `server/src/modules/**/dto/` | Request validation classes | `create-user.dto.ts` |
| `server/src/common/` | Shared guards, filters, pipes | `jwt-auth.guard.ts` |
| `server/src/database/` | Database provider & connection | `prisma.service.ts` |
