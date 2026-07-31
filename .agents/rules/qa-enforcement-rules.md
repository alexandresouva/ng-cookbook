# Quality Assurance & Definition of Done (DoD) Enforcement

This guide defines the quality standards, architectural boundaries, and validation pipeline that must be enforced for all feature developments.

---

## 🚨 Definition of Done (DoD) Checklist

A feature is considered **Done** only when all of the following checklist items are completed and verified:

### 1. Data-Access Layer & Anti-Corruption Layer (ACL)

- **Data Validation (Zod)**: All external data entries—including network payloads (APIs) and browser persistence (LocalStorage, IndexedDB)—must be validated at runtime using Zod schemas defined in `<entity>.dto.ts`.
- **Domain Mapping**: Raw DTO objects must be transformed into clean Domain Models (`.model.ts`) using static mapper methods in `<feature>.mapper.ts`. Mappers and DTO schemas must remain private to the `data-access/` folder.
- **Service Exposure**: The `data-access/` directory must expose its API and/or Storage services directly through `index.ts`. All returned values from these exposed services must be validated Domain Models.
- **Orchestration**: The `application/` layer (Facade or Store) is responsible for importing these I/O services directly and orchestrating how they are consumed (e.g., coordinating offline fallback).

### 2. Unit Testing & Coverage

- **Test Companions**: Every newly created or modified TypeScript file containing logic (components, pages, services, stores, mappers, facades, utils) must have a companion `.spec.ts` file.
- **No Variable Leakage**: All unit tests must use a local `setup()` function to configure `TestBed` and resolve dependencies. Never declare mutable variables (using `let`) in the parent `describe` block.
- **90% Coverage Quality Gate**: The code coverage of modified/added files must be at least 90%. Verify by running `rtk npm run test`.

### 3. Accessibility (a11y)

- **Axe Audits**: Every smart component (Page) and presentation component (Dumb UI) must have an accessibility audit test case using `vitest-axe` (e.g., `expect(await axe(fixture.nativeElement)).toHaveNoViolations()`).

### 4. Testability via data-testid

- **Selector Strategy**: Component HTML templates must include `data-testid` attributes on interactive or queryable elements. Do not query elements by CSS classes in unit tests.
- **TestHelper**: Use the unified `TestHelper` from `@testing/test-helper/test-helper` to query, trigger, and dispatch events inside component tests.

### 5. Linting & Formatting

- **Linter Check**: The codebase must be free of ESLint and boundaries errors. Run `rtk npm run lint` to verify.
- **Boundaries Rule**: Enforce that components/pages only inject the Facade, and cross-feature imports are banned.

---

## 🛠️ Verification Execution Flow

Before declaring a task finished, run the following verification checks:

1. Format check: `rtk npm run lint:fix` (Prettier)
2. Lint check: `rtk npm run lint`
3. Test check: `rtk npm run test`
