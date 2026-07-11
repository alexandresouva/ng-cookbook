# SDD: Issue #5 — Feature-Based Architecture (Folder Structure, Path Aliases & Boundary Enforcement)

## 🎯 Objective & Scope

Establish the definitive folder structure for the Angular v22 project following the Feature-Based Architecture pattern (Nx/DDD-inspired). This SDD covers three deliverables:

1. Update `docs/architecture.md` — the human-readable source of truth for the architecture
2. Create `.agents/rules/architecture-rules.md` — the machine-readable ruleset the AI follows when creating any file, feature, or component
3. Configure TypeScript path aliases and `eslint-plugin-boundaries` for tooling enforcement

> The physical folder structure is **not scaffolded upfront**. As the project grows, the AI agent will create folders and files on demand, guided by this documentation.

---

## 📋 Acceptance Criteria & Rules

- **Rule 1:** `docs/architecture.md` must be fully updated, covering all layer rules, naming conventions, Facade pattern, ACL rule, dependency table, and sub-feature split threshold
- **Rule 2:** `.agents/rules/architecture-rules.md` must contain actionable, unambiguous rules that the AI can follow without additional context
- **Rule 3:** TypeScript resolves `@core/*`, `@shared/*`, `@features/*` aliases without errors (`npm run build` must pass)
- **Rule 4:** `npm run lint` must **fail** when an illegal cross-boundary import is attempted
- **Rule 5:** `npm run lint` must pass clean with no violations

---

## 🛠️ Proposed Changes

---

### 1. Architecture Documentation

#### [MODIFY] `docs/architecture.md`

**Description:** Full rewrite documenting the definitive feature-based architecture with all design decisions.

**New content:**

````markdown
# Architecture & Folder Organization (Feature-Based)

This document describes the definitive architectural guidelines for this Angular project.
All decisions here are final and enforced by `eslint-plugin-boundaries` and TypeScript path aliases.

---

## 🏗️ Top-Level Structure

```text
src/
├── app/
│   ├── core/       # Global singletons — one instance per app
│   ├── shared/     # Reusable across features — zero business logic
│   └── features/   # Business domain modules — lazy-loaded
├── environments/
└── assets/
    └── i18n/       # Translation files (pt-BR.json, en-US.json)
```

---

## 🔐 `core/` — Global Singletons

Each concern has its own subfolder. No generic `services/` dumping ground.

```text
core/
├── auth/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── layout/
│   ├── components/       # Header, Sidebar, Footer
│   ├── services/         # Layout state (collapsed, breakpoints)
│   └── constants/        # Nav items, breakpoints config
├── theme/                # ThemeService, design tokens
├── logger/
│   ├── logger.service.ts           # Structured logging (dev → console, prod → Sentry)
│   └── global-error.handler.ts    # Angular ErrorHandler using LoggerService
├── analytics/            # Telemetry / tracking service
└── i18n/
    ├── i18n.service.ts
    └── constants/
        └── supported-locales.constants.ts
```

---

## 🔄 `shared/` — Reusable UI & Utilities

Zero business logic. Never imports from `core/` or `features/`.

```text
shared/
├── components/   # Dumb UI components (Button, Input, Modal, Card)
├── directives/
├── pipes/
└── utils/        # Pure functions reusable across features (formatters, helpers)
```

---

## 🚀 `features/` — Business Domains (Lazy-Loaded)

Each feature is a self-contained domain. Internal layers follow a strict naming convention.

### Standard Feature Structure

```text
features/
└── products/
    ├── data-access/
    │   ├── products.api.ts        # HTTP only — returns domain models (never DTOs)
    │   ├── products.mapper.ts     # ProductDTO → Product (ACL — private, not exported)
    │   ├── products.store.ts      # Reactive state via Angular Signals (pure state container)
    │   ├── products.service.ts    # Frontend domain logic (filtering, calculations, rules)
    │   ├── products.facade.ts     # Single entry point for components
    │   └── index.ts               # Public API: exports ONLY the Facade
    ├── models/
    │   ├── product.model.ts       # Domain model (Product interface)
    │   ├── product.dto.ts         # API contract shape — stays private to data-access
    │   └── index.ts
    ├── pages/                     # Smart components — route targets
    │   ├── product-list/
    │   └── product-detail/
    ├── components/                # Dumb components specific to this feature
    │   └── product-card/
    └── products.routes.ts
```

### When to Introduce Sub-Features

Split when a feature exceeds ~3 pages **or** has 2+ independent stores.

```text
features/
└── products/
    ├── shared/
    │   ├── models/
    │   ├── data-access/
    │   └── components/
    ├── catalog/
    │   ├── data-access/
    │   ├── pages/
    │   └── components/
    ├── detail/
    │   ├── data-access/
    │   ├── pages/
    │   └── components/
    └── products.routes.ts
```

---

## 📐 Naming Conventions

| Suffix        | Purpose                                                         | Example                |
| :------------ | :-------------------------------------------------------------- | :--------------------- |
| `.api.ts`     | HTTP service — communicates with the API, returns domain models | `products.api.ts`      |
| `.mapper.ts`  | Transforms DTO → domain model (Anti-Corruption Layer)           | `products.mapper.ts`   |
| `.store.ts`   | Reactive state container (Angular Signals)                      | `products.store.ts`    |
| `.service.ts` | Frontend domain logic (pure business rules, no HTTP)            | `products.service.ts`  |
| `.facade.ts`  | Orchestrator — single entry point for components                | `products.facade.ts`   |
| `.model.ts`   | Domain interface/type                                           | `product.model.ts`     |
| `.dto.ts`     | API response shape (never leaves `data-access/`)                | `product.dto.ts`       |
| `.routes.ts`  | Feature route declarations                                      | `products.routes.ts`   |
| `.page.ts`    | Smart component / route target (inside `pages/`)                | `product-list.page.ts` |

---

## 🧩 Architectural Patterns

### Facade Pattern

Components **only** inject the Facade. They never inject the Store, Api, or Service directly.

```
Component → Facade → Store (state) + Api (HTTP) + Service (logic)
```

### Anti-Corruption Layer (ACL)

DTOs never cross the `data-access/` boundary. The `.api.ts` applies the mapper before returning
data — the rest of the app only knows domain models.

```
API (ProductDTO) → .api.ts → .mapper.ts → Product → rest of the app
```

---

## 📏 Dependency Rules

| Layer                    | Can import                                                        | Cannot import            |
| :----------------------- | :---------------------------------------------------------------- | :----------------------- |
| `core/`                  | `shared/`                                                         | `features/`              |
| `shared/`                | Nothing internal                                                  | `core/`, `features/`     |
| `features/X/data-access` | `core/`, `shared/`, own `models/`                                 | Another feature          |
| `features/X/pages`       | own `data-access` (via Facade only), own `components/`, `shared/` | Another feature          |
| `features/X/components`  | `shared/`, own `models/`                                          | `data-access/`, `pages/` |

Enforced by `eslint-plugin-boundaries`. Violations cause `npm run lint` to fail.

---

## 🔗 TypeScript Path Aliases

```
@core/*     → src/app/core/*
@shared/*   → src/app/shared/*
@features/* → src/app/features/*
```
````

---

### 2. AI Coding Rules

#### [NEW] `.agents/rules/architecture-rules.md`

**Description:** Machine-readable ruleset consumed by the AI agent when creating any file, feature, or component. Translates `docs/architecture.md` into actionable, unambiguous constraints.

**Content:**

```markdown
# Architecture Rules — Feature-Based Angular

These rules are enforced when the AI creates, modifies, or reviews any file in this project.
Cross-reference: `docs/architecture.md`

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
```

---

### 3. TypeScript Path Aliases

#### [MODIFY] `tsconfig.app.json`

**Current:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": []
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts"]
}
```

**New:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"]
    },
    "types": []
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts"]
}
```

#### [MODIFY] `tsconfig.spec.json`

**Current:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jasmine"]
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

**New:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"]
    },
    "types": ["jasmine"]
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

---

### 4. ESLint Boundary Enforcement

#### Step A — Install dependency

```bash
npm install -D eslint-plugin-boundaries
```

#### [MODIFY] `eslint.config.mjs`

**Step B — Add import at the top** (alongside existing imports):

```javascript
import boundaries from 'eslint-plugin-boundaries';
```

**Step C — Append config block inside `defineConfig([...])`** (after the last existing config object):

```javascript
{
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { type: 'core',    pattern: ['src/app/core/**']     },
      { type: 'shared',  pattern: ['src/app/shared/**']   },
      { type: 'feature', pattern: ['src/app/features/**'] },
    ],
    'boundaries/ignore': [
      'src/app/app.component.ts',
      'src/app/app.routes.ts',
      'src/app/app.config.ts',
    ],
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'core',    allow: ['shared']         },
        { from: 'shared',  allow: []                 },
        { from: 'feature', allow: ['core', 'shared'] },
      ],
    }],
  },
},
```

---

## 🧪 Verification Plan

### Commands

```bash
npm run build   # TypeScript aliases must resolve — no module errors
npm run lint    # Must pass clean on the codebase
```

### Boundary Violation Test

1. Temporarily add inside any `features/X/` file: `import { something } from '@features/Y/data-access'`
2. Run `npm run lint` → must fail with `boundaries/element-types` error
3. Revert the change → `npm run lint` passes again
