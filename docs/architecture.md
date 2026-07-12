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
