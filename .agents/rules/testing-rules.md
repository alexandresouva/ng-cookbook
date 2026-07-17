# Unit Testing Rules

Always follow these rules when writing or refactoring unit tests:

1. **Test Coverage Companions**: Every component containing business logic, mappers, facades, state stores, and utility functions must have a companion `.spec.ts` file.
2. **Setup Function Pattern**: Never declare mutable variables in the parent `describe` block scope (e.g. using `let`) that leak state across tests. Always encapsulate dependency resolution and TestBed configuration inside a local `setup()` function.
3. **DTO-to-Domain Mock Pattern**: Use the centralized mock builders (`*.mock.ts`) located in the feature's `testing/` folder. When writing domain model mocks, map them from their corresponding mock DTOs using Mapper classes to guarantee consistency.
4. **Coverage Exclusions**: Exclude all mock files (`**/*.mock.ts`) and raw schemas from coverage mapping.
5. **Quality Gate Threshold**: Guarantee a code coverage of at least 90% across the changes. Run `rtk npm run test` to verify.
