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

All features must follow a unified structure to ensure consistency, clean boundary checks, and framework independence of our domain rules.

### ⚡ Feature Structure Layout

```text
features/products/
├── domain/                  # Pure Business Logic Layer
│   ├── product.model.ts     # Domain models
│   ├── product.service.ts   # Pure domain services (validation rules, calculations)
│   └── index.ts             # Exports ONLY domain models
├── data-access/             # Technical Infrastructure (I/O)
│   ├── products.api.ts      # HTTP Client
│   ├── product.dto.ts       # Private Zod DTO schema
│   └── products.mapper.ts   # DTO -> Model Mapper
├── application/             # State & Orchestration Layer
│   ├── products.store.ts    # Signal State
│   ├── products.facade.ts   # Orchestrator / Use Cases Facade
│   └── index.ts             # Exports ONLY ProductsFacade
├── ui/                      # Dumb presentation components
│   └── components/
│       └── product-card/
└── pages/                   # Smart page components / Routing targets
    ├── products.routes.ts
    └── product-list/
        ├── product-list.page.ts
        └── product-list.page.html
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
| `.service.ts` | Pure frontend domain logic (business rules, no HTTP, no DI)     | `products.service.ts`  |
| `.facade.ts`  | Orchestrator — single entry point for pages                     | `products.facade.ts`   |
| `.model.ts`   | Domain interface/type                                           | `product.model.ts`     |
| `.dto.ts`     | API response shape (never leaves `data-access/`)                | `product.dto.ts`       |
| `.routes.ts`  | Feature route declarations                                      | `products.routes.ts`   |
| `.page.ts`    | Smart component / route target (inside `pages/`)                | `product-list.page.ts` |

---

## 🧩 Architectural Patterns

### Facade Pattern

Pages **only** inject the Facade from `application/`. They never inject the Store or Api directly.

```
Smart Component (Page) → Facade → Store (state) + Api (HTTP) + Domain (logic)
```

### Anti-Corruption Layer (ACL)

DTOs never cross the `data-access/` boundary. The API client applies the mapper before returning
data — the rest of the app only knows domain models.

```
API (ProductDTO) → .api.ts → .mapper.ts → Product (Domain) → rest of the app
```

---

## 📏 Dependency Rules

| Layer                    | Can import                                            | Cannot import            |
| :----------------------- | :---------------------------------------------------- | :----------------------- |
| `core/`                  | `shared/`                                             | `features/`              |
| `shared/`                | Nothing internal                                      | `core/`, `features/`     |
| `features/X/data-access` | `core/`, `shared/`, own `domain/`                     | `application/`, another  |
| `features/X/application` | `core/`, `shared/`, own `domain/`, own `data-access/` | `pages/`, another        |
| `features/X/pages`       | own `application` (Facade only), own `ui/`, `shared/` | `data-access/`, another  |
| `features/X/components`  | `shared/`, own `domain/`                              | `data-access/`, `pages/` |

Enforced by `eslint-plugin-boundaries`. Violations cause `npm run lint` to fail.

---

## 🔗 TypeScript Path Aliases

```
@core/*     → src/app/core/*
@shared/*   → src/app/shared/*
@features/* → src/app/features/*
```
