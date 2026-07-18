# Unit Testing Guidelines (Vitest)

This document establishes the architecture and writing standards for unit tests in the project.

---

## 1. Quality Gate & Coverage

- **Global Target**: Minimum **90%** coverage across all types (Lines, Functions, Branches, and Statements). This target is enforced on CI runs.
- **Mappers & Utilities**: Mandatory **100%** coverage.
- **Exclusions**: The following files are excluded from coverage metrics:
  - Mock files (`**/*.mock.ts`)
  - API response transfer objects (`**/*.dto.ts`)
  - Route configurations (`**/*.routes.ts`)
  - Entry points and configuration bootstrapping files (`src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`)

---

## 2. Setup Function Pattern

To prevent mutable state bleeding and large, repetitive `beforeEach` setups, encapsulate dependency injection and module compilation in a local `setup()` function inside the `describe` block.

### Guidelines

1. Do NOT define global `let` variables (e.g. `let component: MyComponent; let service: MyService;`) at the top of the test suite.
2. Return all injected dependencies, fixtures, components, and spied/mocked methods inside a single returned object.
3. Allow parameter overrides in the `setup()` function to customize dependencies per test case.

### Example

```typescript
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductsFacade } from './products.facade';
import { ProductsApi } from './products.api';
import { ProductsStore } from './products.store';

function setup() {
  const mockApi = {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
  };

  TestBed.configureTestingModule({
    providers: [ProductsFacade, ProductsStore, { provide: ProductsApi, useValue: mockApi }],
  });

  const facade = TestBed.inject(ProductsFacade);
  const store = TestBed.inject(ProductsStore);

  return {
    facade,
    store,
    mockApi,
  };
}

describe('ProductsFacade', () => {
  it('should load products and update store state', () => {
    const { facade, store, mockApi } = setup();
    const mockList = [{ id: '1', name: 'Angular Cookbook' }];
    mockApi.getProducts.mockReturnValue(of(mockList));

    facade.loadProducts();

    expect(store.products()).toEqual(mockList);
    expect(store.loading()).toBe(false);
  });
});
```

---

## 3. Centralized Mock Builders (DTO-to-Domain Mapping Pattern)

To avoid duplicating mock structures between DTOs (Data Transfer Objects) and Domain Models, define the mock DTO first. Then, map it to the domain model using your feature's Mapper to ensure they stay in sync:

### Guidelines

1. Never define mock literals directly in test suites. Use centralized mock builders.
2. Place feature-specific mocks inside a `testing/` folder within that feature (e.g., `src/app/features/products/testing/products.mock.ts`).
3. Place shared/global mocks inside `src/app/shared/testing/` or `src/app/core/testing/`.
4. Follow the `createMock[Entity](overrides?: Partial<Entity>)` function pattern.

### Example

````typescript
import { Product } from '../models/product.model';
import { ProductDto } from '../models/product.dto';
import { ProductMapper } from '../data-access/products.mapper';

/**
 * Creates a mock Product DTO object with default values and optional overrides.
 */
export function createMockProductDto(overrides?: Partial<ProductDto>): ProductDto {
  return {
    id: '1',
    title: 'Angular Cookbook',
    description: 'Modern recipes and advanced architectures.',
    price: 89.9,
    category: 'Frontend',
    createdAt: '2026-01-10T12:00:00Z',
    ...overrides,
  };
}

/**
 * Creates a mock Product Domain Model by mapping the mock DTO and applying overrides.
 * This guarantees that changes in the Mapper automatically propagate to mocks.
 */
export function createMockProduct(overrides?: Partial<Product>): Product {
  const dto = createMockProductDto();
  const domain = ProductMapper.toDomain(dto);
  return {
    ...domain,
    ...overrides,
  };
}

---

## 4. Component & Local Integration Testing Guidelines (TestHelper)

Component testing verifies that the component class and template interact correctly. To prevent boilerplate DOM queries and handle typings safely, use the **`TestHelper`** class from `@testing/test-helper/test-helper`.

### Component Types and Testing Focus

Before writing component tests, identify the component's category:

#### Smart Components (Pages / Container Components)
- **Rule**: Smart components must only interact with their corresponding Facade.
- **Testing Goal**: Verify that the component displays loading/error states from the Facade, renders lists/details, and delegates user actions to the Facade methods.
- **Mocking**: Always mock the Facade using `vi.fn()` or plain mock objects, and provide it in `TestBed`.

#### Dumb Components (Shared / UI Components)
- **Rule**: Dumb components do not inject services. They communicate purely via `input()` and `output()`.
- **Testing Goal**: Verify that inputs render properly and outputs emit correct events on user action.

### Why use `TestHelper`?
- **Standardized Queries**: Access elements consistently using `queries.query('testid')` (always targets `[data-testid="..."]`).
- **Trigger vs. Dispatch**:
  - `trigger`: Emulates Angular event binding handlers directly using `triggerEventHandler` (fast, isolated unit testing).
  - `dispatch`: Dispatches real DOM events like `MouseEvent` or `InputEvent` (required when testing HostListeners, event bubbling, or focus).
- **Type Safety**: Automatically casts native elements and component instances.

### Example: Testing a Smart Component

```typescript
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { TestHelper } from '@testing/test-helper/test-helper';
import { ProductsPage } from './products.page';
import { ProductsFacade } from '../data-access/products.facade';

function setup() {
  const mockFacade = {
    products: signal([{ id: '1', name: 'Product A', price: 10 }]),
    loading: signal(false),
    loadProducts: vi.fn(),
  };

  TestBed.configureTestingModule({
    imports: [ProductsPage],
    providers: [
      { provide: ProductsFacade, useValue: mockFacade }
    ]
  });

  const fixture = TestBed.createComponent(ProductsPage);
  const component = fixture.componentInstance;
  const helper = new TestHelper(fixture);

  return { fixture, component, mockFacade, helper };
}

describe('ProductsPage', () => {
  it('should call loadProducts on facade on init', () => {
    const { mockFacade } = setup();
    expect(mockFacade.loadProducts).toHaveBeenCalled();
  });

  it('should render products list using TestHelper queries', () => {
    const { fixture, helper } = setup();
    fixture.detectChanges(); // Trigger template bindings

    const items = helper.queries.queryAll('product-item');
    expect(items.length).toBe(1);
    expect(helper.queries.getTextContent('product-name')).toBe('Product A');
  });

  it('should display spinner when facade loading state is active', () => {
    const { fixture, mockFacade, helper } = setup();
    mockFacade.loading.set(true);
    fixture.detectChanges();

    const spinner = helper.queries.query('loading-spinner');
    expect(spinner).toBeTruthy();
  });
});
````

### Example: Testing a Dumb Component

```typescript
import { TestBed } from '@angular/core/testing';
import { TestHelper } from '@testing/test-helper/test-helper';
import { ProductCard } from './product-card.component';

function setup() {
  TestBed.configureTestingModule({
    imports: [ProductCard],
  });

  const fixture = TestBed.createComponent(ProductCard);
  const component = fixture.componentInstance;
  const helper = new TestHelper(fixture);

  return { fixture, component, helper };
}

describe('ProductCard', () => {
  it('should render signal input values', () => {
    const { fixture, helper } = setup();

    // Set Angular signal input
    fixture.componentRef.setInput('product', { name: 'Dumb Product', price: 15 });
    fixture.detectChanges();

    expect(helper.queries.getTextContent('product-title')).toBe('Dumb Product');
  });

  it('should emit select output when clicked', () => {
    const { fixture, component, helper } = setup();
    fixture.componentRef.setInput('product', { id: '123', name: 'Dumb Product' });
    fixture.detectChanges();

    let emittedId: string | null = null;
    component.select.subscribe((id) => (emittedId = id));

    // Simple event trigger using helper
    helper.trigger.click('select-btn');

    expect(emittedId).toBe('123');
  });
});
```

---

## 5. Accessibility Testing Guidelines (a11y)

Accessibility (a11y) checks ensure that our components adhere to web standards (WCAG 2.1) and work properly with assistive technologies.

### Rules & Quality Gate

1. **Mandatory Audit**: Every Page component (Smart) and presentation UI component (Dumb) MUST have a dedicated accessibility test case. This is a basic gate similar to the `"should create"` test.
2. **Global Expectation**: The matcher `toHaveNoViolations` is automatically registered globally via `src/test-setup.ts`. Do not import `expect.extend(toHaveNoViolations)` locally in spec files.

### Standard Test Pattern

To test accessibility, import `axe` from `vitest-axe` and audit the native rendered element:

```typescript
import { axe } from 'vitest-axe';

it('should have no accessibility violations', async () => {
  const { fixture } = setup();
  fixture.detectChanges(); // Trigger template compilation and layout rendering

  const results = await axe(fixture.nativeElement);
  expect(results).toHaveNoViolations();
});
```

### Handling Third-Party Component Violations

If you are using a third-party library component (e.g. from an external library) that has an accessibility bug you cannot fix directly:

1. **Never skip the entire test case**.
2. **Selectively disable only the conflicting rule** in the `axe` configuration options.
3. **Include a code comment** linking to the upstream bug report or issue tracking the resolution.

_Example:_

```typescript
import { axe } from 'vitest-axe';

it('should have no accessibility violations except known color contrast bugs', async () => {
  const { fixture } = setup();
  fixture.detectChanges();

  const results = await axe(fixture.nativeElement, {
    rules: {
      // Disabling color-contrast rule due to third-party library bug
      // Upstream bug report: https://github.com/some-library/issues/4567
      'color-contrast': { enabled: false },
    },
  });

  expect(results).toHaveNoViolations();
});
```

---

## 6. API Mocking & Offline Development Guidelines

To build robust, decoupled, and consistent components, we follow a split API mocking strategy depending on the environment.

### 🌐 1. Development Mocking (MSW - Mock Service Worker)

For local browser development, prototyping, and offline usage:

- We use **MSW** to intercept network calls at the browser's Service Worker level.
- Run the command `npm run start:offline` to start the development server with mock API interception enabled.
- MSW is configured under `src/mocks/` and imports mock data factories from `@testing/factories/`.

### 🧪 2. Unit Testing Mocking (Vitest)

For unit tests (`*.spec.ts`):

- **Do NOT use MSW**. Keeping tests fast and simple is our highest priority.
- Mock the network using standard Angular testing tools like `HttpClientTestingModule` or simple spies on the API client classes.
- Use the same mock factories from `@testing/factories/` in your unit tests to populate your mock responses (e.g. `mockProductsApi.getProducts.mockReturnValue(of([createMockProduct()]))`).

### 🤖 3. End-to-End Testing Mocking (Playwright/Cypress)

For high-level user interface flow tests:

- **Do NOT use MSW**. Use the test runner's native network interception tools (e.g., `page.route()` in Playwright or `cy.intercept()` in Cypress).
- Feed the native E2E mock routes using the shared mock factories under `@testing/factories/` to maintain a single source of truth for mock payloads.

### 📦 4. Centralized Mock Factories (`@testing/factories/`)

All mock data structures must be generated via factories defined under `@testing/factories/`. Never write raw JSON objects directly in spec files or handlers:

```typescript
// src/app/testing/factories/products.factory.ts
import { ProductDto } from '../../features/products/models/product.dto';

export function createMockProductDto(overrides?: Partial<ProductDto>): ProductDto {
  return {
    id: '1',
    title: 'Angular Cookbook',
    price: 89.9,
    ...overrides,
  };
}
```

### 🔀 5. Modular MSW Handlers Layout

To prevent the root `src/mocks/handlers.ts` file from becoming a monolith and to avoid Git merge conflicts, we modularize API mock handlers by feature:

1. **Feature Handlers**: Create domain-specific handler arrays in subfolders (e.g. `src/mocks/handlers/products.ts`).
2. **Aggregation**: Merge all feature handler arrays into the central array in `src/mocks/handlers.ts` using the spread operator (`...`).

**Example central file (`src/mocks/handlers.ts`):**

```typescript
import { productsHandlers } from './handlers/products';
import { usersHandlers } from './handlers/users';

export const handlers = [...productsHandlers, ...usersHandlers];
```
