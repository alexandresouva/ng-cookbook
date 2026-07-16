# Zod DTOs & Mappers Guidelines

Follow these guidelines when creating, modifying, or reviewing DTO validation and data mapping logic in this project.

---

## 🏗️ Folder and File Organization

1. **DTOs (`.dto.ts`)**:
   - Location: `src/app/features/<feature>/models/<entity>.dto.ts`
   - Purpose: Define the API response payload validation schema using Zod.
   - Access: **Private to the feature's data-access layer**. Never export DTOs in `models/index.ts`.
   - Naming: `[entity].dto.ts`

2. **Domain Models (`.model.ts`)**:
   - Location: `src/app/features/<feature>/models/<entity>.model.ts`
   - Purpose: Define clean TypeScript interfaces for the frontend application core, state, and UI.
   - Access: Publicly exported in `models/index.ts`.

3. **Mappers (`.mapper.ts`)**:
   - Location: `src/app/features/<feature>/data-access/<feature>.mapper.ts`
   - Purpose: Map validated DTOs to clean Domain Models (and vice-versa).
   - Structure: Always use a **static class** (e.g. `ProductMapper`) encapsulating mapping functions.
   - Access: Private to data-access. Never export the Mapper in `data-access/index.ts`.

---

## 🛠️ Implementation Patterns

### 1. Defining DTO Schemas

- Always derive the TypeScript type from the Zod schema using `z.infer`.
- Use `.default()` to sanitise optional or nullable fields from the network.
- By default, Zod objects strip away unknown keys (via standard `.strip()`). If preservation of unknown keys is explicitly needed, use `.passthrough()`. Avoid using `.strict()` for external APIs to prevent breaking changes.

```typescript
import { z } from 'zod';

export const userDtoSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  email: z.string().email(),
  role: z.string().default('user'),
});

export type UserDto = z.infer<typeof userDtoSchema>;
```

### 2. Implementing Mapper Classes

- Group all directional transformations into static methods:
  - `static toDomain(data: unknown): Entity`
  - `static toDomainList(data: unknown): Entity[]`
  - `static toDto(model: Entity): Partial<EntityDto>` (optional, for write requests)
- You may write the mapper's `.transform()` schema privately inside the mapper class to combine validation and translation in a single execution pipeline.

```typescript
import { userDtoSchema } from '../models/user.dto';
import { User } from '../models/user.model';

export class UserMapper {
  private static readonly schema = userDtoSchema.transform((dto): User => ({
    id: dto.id,
    fullName: dto.first_name,
    email: dto.email,
    role: dto.role,
  }));

  static toDomain(data: unknown): User {
    return this.schema.parse(data);
  }

  static toDomainList(data: unknown): User[] {
    return this.schema.array().parse(data);
  }
}
```

### 3. Consuming Mappers in API Services (`.api.ts`)

- Use the shared RxJS operator or map functions to validate and transform response payloads directly inside the HTTP client stream.
- The API service must return only Domain Models (e.g., `Observable<User>` or `Observable<User[]>`), never DTOs.

```typescript
import { map } from 'rxjs';
import { UserMapper } from './user.mapper';

getUser(id: string): Observable<User> {
  return this.http.get<unknown>(`/api/users/${id}`).pipe(
    map((response) => UserMapper.toDomain(response))
  );
}
```
