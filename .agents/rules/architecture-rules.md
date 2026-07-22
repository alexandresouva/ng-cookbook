# Architecture Rules — Feature-Based Angular

These rules are enforced when the AI creates, modifies, or reviews any file in this project.
Cross-reference: `docs/architecture.md`

---

## ⚡ Unified Feature Architecture

All features must follow a consistent, decoupled structure:

1. **`domain/`**:
   - Core entities/models (`.model.ts`) and pure business logic services (`.service.ts`).
   - **100% pure**: Absolutely NO dependencies on Angular, HTTP clients, or state libraries.
2. **`data-access/`**:
   - Strictly deals with network I/O and data transformations: API client (`.api.ts`), private validation schemas (`.dto.ts`), and translation (`.mapper.ts`).
   - Does not contain stores, state, or orchestrators.
3. **`application/`**:
   - Framework orchestration and state management: Signal Store (`.store.ts`) and Facade (`.facade.ts`).
   - Coordinates API calls and applies pure domain rules.
   - _index.ts_: Exports ONLY the Facade.
4. **`ui/`**:
   - Presentation components ("dumb" components) with no framework injectables.
5. **`pages/`**:
   - Smart components / route targets that inject only the Facade.

---

## Folder Placement Rules

- New **global singleton** (guard, interceptor, global service) → `src/app/core/<concern>/`
- New **reusable UI component** with no business logic → `src/app/shared/components/`
- New **reusable pure function** → `src/app/shared/utils/`
- New **business feature** → `src/app/features/<feature-name>/`
- New **route target component** → `src/app/features/<feature-name>/pages/<page-name>/`
- New **feature-specific UI component** → `src/app/features/<feature-name>/ui/components/<component-name>/`

---

## File Naming Rules

- HTTP service file: `<feature>.api.ts`
- Domain logic file: `<feature>.service.ts`
- State file: `<feature>.store.ts`
- DTO-to-model transformer: `<feature>.mapper.ts`
- Orchestrator/Facade: `<feature>.facade.ts`
- Domain interface: `<entity>.model.ts`
- API response shape: `<entity>.dto.ts`
- Route target component: `<page-name>.page.ts` (inside `pages/`)
- Route declarations: `<feature>.routes.ts` (at the root of the feature folder)

---

## Dependency Rules (NEVER violate these)

- `core/` NEVER imports from `features/`
- `shared/` NEVER imports from `core/` or `features/`
- `features/A/` NEVER imports directly from `features/B/` — cross-feature communication goes through `core/` services or events
- Inside a feature, components/pages NEVER inject `.api.ts` or `.store.ts` directly — always inject the Facade from `application/`
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
- Dumb components (ui/): receive data via `input()`, emit via `output()` — never inject services
- Use `input.required<T>()` for mandatory inputs
- Use Angular control flow (`@if`, `@for`, `@switch`) — never `*ngIf` or `*ngFor`

---

## State Rules

- State containers use Angular Signals only (no BehaviorSubject for state)
- Private writable signals: `private readonly _state = signal<T>(initial)`
- Public readonly signals: `readonly state = this._state.asReadonly()`
- Derived state: `computed(() => ...)`
- Store is provided at the page level (`providers: [FeatureStore]`)

---

## index.ts Rules

- Every `data-access/` folder MUST have an `index.ts` exporting only the API client.
- Every `application/` folder MUST have an `index.ts` exporting ONLY the Facade.
- Every `domain/` folder MUST have an `index.ts` exporting only model interfaces.
