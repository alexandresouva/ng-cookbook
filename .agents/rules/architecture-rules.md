# Architecture Rules — Feature-Based Angular

These rules are enforced when the AI creates, modifies, or reviews any file in this project.
Cross-reference: `docs/architecture.md`

---

## ⚡ Progressive Architecture (KISS)

Features should scale dynamically based on their complexity:

1. **Level 1 (Pragmatic / Unified - Default)**:
   - For simple CRUD or straight data listings.
   - Folder structure:
     - `models/`: Domain models and DTO validation schemas.
     - `data-access/`: API, Store, Mapper, and Facade all live together.
   - All business logic goes in `<feature>.service.ts` inside `data-access/`.

2. **Level 2 (Strict DDD / Separated - Complex Features)**:
   - For features with rich business calculations, async flows, or heavy rules (e.g. cart, checkout, payments).
   - Folder structure:
     - `domain/`: Pure business models (`.model.ts`) and pure business logic services (`.service.ts`). Absolutely NO dependency on Angular DI, HttpClient, or stores.
     - `data-access/`: Technical infrastructure: API (`.api.ts`), Store (`.store.ts`), Mapper (`.mapper.ts`), and Facade (`.facade.ts`).
     - DTO validation schemas (`.dto.ts`) are kept private inside `data-access/` and never exported.

---

## Folder Placement Rules

- New **global singleton** (guard, interceptor, global service) → `src/app/core/<concern>/`
- New **reusable UI component** with no business logic → `src/app/shared/components/`
- New **reusable pure function** → `src/app/shared/utils/`
- New **business feature** → `src/app/features/<feature-name>/`
- New **route target component** → `src/app/features/<feature-name>/pages/<page-name>/`
- New **feature-specific UI component** → `src/app/features/<feature-name>/components/<component-name>/`

---

## File Naming Rules

- HTTP service file: `<feature>.api.ts` (never `<feature>.service.ts` for HTTP)
- Domain logic file: `<feature>.service.ts`
- State file: `<feature>.store.ts`
- DTO-to-model transformer: `<feature>.mapper.ts`
- Orchestrator for components: `<feature>.facade.ts`
- Domain interface: `<entity>.model.ts`
- API response shape: `<entity>.dto.ts`
- Route target component: `<page-name>.page.ts` (inside `pages/`)
- Route declarations: `<feature>.routes.ts` (at the root of the feature folder)

---

## Dependency Rules (NEVER violate these)

- `core/` NEVER imports from `features/`
- `shared/` NEVER imports from `core/` or `features/`
- `features/A/` NEVER imports directly from `features/B/` — cross-feature communication goes through `core/` services or events
- Inside a feature, components NEVER inject `.api.ts`, `.store.ts`, or `.service.ts` directly — always inject `.facade.ts`
- DTOs (`.dto.ts`) NEVER leave `data-access/` — the mapper runs inside `.api.ts`

---

## Import Alias Rules

- Always use path aliases, never deep relative imports:
  - `@core/...` instead of `../../../core/...`
  - `@shared/...` instead of `../../../shared/...`
  - `@features/...` instead of `../../../features/...`

---

## Component Rules

- All components MUST be `standalone: true`
- No `NgModule` usage
- Smart components (pages): inject only the Facade via `inject()`
- Dumb components (components/): receive data via `input()`, emit via `output()` — never inject services
- Use `input.required<T>()` for mandatory inputs
- Use Angular control flow (`@if`, `@for`, `@switch`) — never `*ngIf` or `*ngFor`

---

## State Rules

- State containers use Angular Signals only (no BehaviorSubject for state)
- Private writable signals: `private readonly _state = signal<T>(initial)`
- Public readonly signals: `readonly state = this._state.asReadonly()`
- Derived state: `computed(() => ...)`
- Store is provided at the page level (`providers: [FeatureStore]`) — never `providedIn: 'root'` unless truly global

---

## index.ts Rules

- Every `data-access/` folder MUST have an `index.ts`
- `index.ts` exports ONLY the Facade — never the Store, Api, Mapper, or DTO
- Every `models/` folder MUST have an `index.ts` exporting model interfaces (never DTOs)
