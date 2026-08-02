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
   - **File Organization**: The folder structure should start as **flat** (all files directly under `data-access/`). If the feature grows complex with multiple entities, you may organize them into subfolders (e.g., `api/`, `dto/`, `mappers/`) to improve readability.
3. **`application/`**:
   - Framework orchestration and state management: Signal Store (`.store.ts`) and Facade (`.facade.ts`).
   - Coordinates API calls and applies pure domain rules.
   - _index.ts_: Exports ONLY the Facade.
4. **`ui/`**:
   - Presentation/dumb components, directives, and pipes with no framework injectables or business logic dependencies.
   - Organized in subfolders: `ui/components/`, `ui/directives/`, and `ui/pipes/`.
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
- All component templates and styles must be defined in external files (`.html` and `.scss`). Inline templates/styles in `@Component` are only permitted if they are 5 lines or less.

---

## State Rules

- State containers use NgRx SignalStore (`signalStore`).
- **Store Purity:** Stores (`*.store.ts`) must remain pure containers of state. They must NEVER inject API services (`*.api.ts`), HTTP clients, or execute network requests.
- **Facade Orchestration:** Facades (`*.facade.ts`) are responsible for coordinating async API calls, managing HTTP subscriptions, and updating the pure store using state updaters.
- Store is provided at the page level (`providers: [FeatureStore]`).

---

## Clean Code & Form Guidelines

- **Type Inference:** Avoid redundant type annotations when a type can be implicitly inferred (e.g. `readonly currentStep = this.store.currentStep` instead of `readonly currentStep: Signal<Step> = ...`).
- **Form Services:** Complicated forms or form logic must be encapsulated inside a dedicated Form Service (e.g. `*form.service.ts`) inside the UI component folder. The UI component should only focus on rendering and UX.
- **Unbound Validator Methods:** Avoid verbose type declarations inside form builder arrays (e.g. `(c: AbstractControl): ValidationErrors | null => ...`). Use simple lambda arrow functions like `c => Validators.required(c)` when necessary to avoid `@typescript-eslint/unbound-method` warnings.
- **Clean Constructors:** Do not write logical procedures inside class constructors or lifecycles (like `effect` or `subscribe`). Extract them into private, descriptive methods (e.g., `this.setupProfileFormSync()`) and invoke them in the constructor.

---

## Domain & Schema Separation

- **Domain contexts:** Models (`.model.ts`), DTOs (`.dto.ts`), and Mappers (`.mapper.ts`) must be separated by entity/context (e.g. `genre.dto.ts`, `artist.dto.ts`) instead of combining them into monolithic files. This preserves single responsibility and enables modular reuse.

---

## index.ts Rules

- Every `data-access/` folder MUST have an `index.ts` exporting only the API client.
- Every `application/` folder MUST have an `index.ts` exporting ONLY the Facade.
- Every `domain/` folder MUST have an `index.ts` exporting only model interfaces.
