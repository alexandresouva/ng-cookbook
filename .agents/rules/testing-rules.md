# Unit Testing Rules

Always follow these rules when writing or refactoring unit tests:

1. **Test Coverage Companions**: Every component containing business logic, mappers, facades, state stores, and utility functions must have a companion `.spec.ts` file.
2. **Setup Function Pattern**: Never declare mutable variables in the parent `describe` block scope (e.g. using `let`) that leak state across tests. Always encapsulate dependency resolution and TestBed configuration inside a local `setup()` function.
3. **DTO-to-Domain Mock Pattern**: Use the centralized mock builders (`*.mock.ts`) located in the feature's `testing/` folder. When writing domain model mocks, map them from their corresponding mock DTOs using Mapper classes to guarantee consistency.
4. **Coverage Exclusions**: Exclude all mock files (`**/*.mock.ts`) and raw schemas from coverage mapping.
5. **Quality Gate Threshold**: Guarantee a code coverage of at least 90% across the changes. Run `rtk npm run test` to verify.
6. **Component & Integration Testing Rules**:
   - Use the unified `TestHelper` class from `@testing/test-helper/test-helper` to query, trigger, and dispatch actions in component tests. Always target `data-testid` attributes in HTML templates for element selection.
   - Smart components must only have their Facades mocked. Never mock internal Stores/APIs inside a page test.
   - Dumb components must be tested using `fixture.componentRef.setInput()` for signal inputs and subscribing to `output()` emitters.
7. **Accessibility Testing (a11y) Rules**:
   - Every presentation/shared UI component (Dumb Component) and Page (Smart Component) MUST have a companion accessibility audit test case using `vitest-axe` (acting as a standard quality check similar to the "should create" validation).
   - Run `axe(fixture.nativeElement)` after `fixture.detectChanges()` to assert that no accessibility violations exist: `expect(await axe(fixture.nativeElement)).toHaveNoViolations()`.
   - **Third-Party Components**: If a third-party library component has an accessibility bug, you may selectively disable that specific rule in the test options. You MUST include a code comment linking to the upstream issue or bug report.
8. **API Mocking & Mock Factories Rules**:
   - **Centralized Mock Factories**: Place all entity mock builders (factories) in `@testing/factories/` (e.g. `products.factory.ts`). They serve as the single source of truth for mock data, shared across MSW browser handlers, Vitest unit tests, and E2E routes.
   - **Unit Tests (Vitest)**: Do NOT configure MSW server listeners for Vitest unit tests. Continue using standard Angular HTTP mocking tools (`HttpClientTestingModule` or spies/mocks) to keep tests simple, fast, and lightweight.
   - **Offline Development (MSW)**: MSW is configured exclusively for offline browser development. Use `npm run start:offline` to launch the dev server with mock data interception enabled via mock service workers.
   - **Modular Handlers**: Do NOT write API mock handlers directly in the root `src/mocks/handlers.ts` file. Create feature-specific handlers inside `src/mocks/handlers/` (e.g. `src/mocks/handlers/products.ts`) and merge them into the central array in `src/mocks/handlers.ts` using the spread operator (`...`).
