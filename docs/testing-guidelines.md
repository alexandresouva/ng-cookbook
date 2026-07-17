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

```typescript
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
```
