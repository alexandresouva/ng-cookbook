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

Each feature is a self-contained domain. To follow the **KISS (Keep It Simple, Stupid)** principle, we adopt a **Progressive Architecture** that scales based on the feature's business complexity.

### ⚡ Feature Scaling Levels

#### Level 1: Pragmatic / Unified (Default / Simple Features)

For CRUD features, simple lists, or features with basic front-end rules:

- **`models/`**: Holds models (`.model.ts`) and DTO schemas (`.dto.ts`).
- **`data-access/`**: Groups all non-visual components together (`.api.ts`, `.store.ts`, `.mapper.ts`, `.service.ts`, `.facade.ts`).
- **`pages/` & `components/`**: Smart and dumb components.

Example (Products feature):

```text
features/products/
├── data-access/
│   ├── products.api.ts      # HTTP Client
│   ├── products.store.ts    # Signal State
│   ├── products.mapper.ts   # ProductDto -> Product
│   ├── products.service.ts  # Rules & Calculations
│   ├── products.facade.ts   # Orchestrator
│   └── index.ts             # Exports ONLY ProductsFacade
├── models/
│   ├── product.dto.ts       # Raw response schema (Zod)
│   ├── product.model.ts     # Domain model
│   └── index.ts             # Exports ONLY product.model
```

#### Level 2: Strict DDD / Separated (Complex Features)

Upgrade to this structure when a feature has highly complex rules, async workflows, heavy domain calculations, or needs 100% isolated business unit testing (e.g. cart, checkout, payments):

- **`domain/`**: Houses pure business model interfaces and pure business logic services. It has **zero dependencies** on Angular, HTTP clients, or stores.
- **`data-access/`**: Houses all technical infrastructure (API, Store, Mapper, Facade) and private DTO schemas. No root-level `models/` directory is needed.

Example (Cart feature):

```text
features/cart/
├── domain/                  # Pure Business Logic Layer
│   ├── cart.model.ts        # Domain models (Cart, CartItem)
│   └── cart.service.ts      # Pure domain services (discount rules, limits)
├── data-access/             # Technical Infrastructure Layer
│   ├── cart.api.ts          # HTTP sync client
│   ├── cart.dto.ts          # Private DTO schema (Zod)
│   ├── cart.mapper.ts       # CartDto -> Cart Mapper
│   ├── cart.store.ts        # Signal State
│   ├── cart.facade.ts       # Orchestrates domain/ & data-access/
│   └── index.ts             # Exports ONLY CartFacade
```

### When to Split into Sub-Features

For extremely large modules, split the domain when a feature exceeds ~3 pages **or** has 2+ independent stores (e.g. splitting `products` into `catalog` and `detail`).

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
