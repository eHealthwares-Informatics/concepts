# Backend CRUD Resource — healthcare-concepts

## Purpose

Scaffold a new CRUD resource (entity + DTO + controller + service) in healthcare-concepts.

## When to invoke

When adding a new resource type (e.g., a new coding system or facility attribute).

## When not to invoke

For single endpoints or non-CRUD logic.

## Inputs

- **Entity name** (PascalCase)
- **Table name** (snake_case)
- **Fields** with TypeORM decorators

## Workflow

1. Create TypeORM entity in the appropriate module's `entities/` directory.
2. Create validated DTO(s) using `class-validator` + `@nestjs/swagger`.
3. Create service with standard CRUD methods using TypeORM `Repository` API.
4. Create controller with list/create/get/patch/delete endpoints, always using `ListQueryDto` for list endpoints.
5. Register entity in the module's `TypeOrmModule.forFeature()` and entity list in `app.module.ts`.

## Refactoring

Whenever you add or modify a controller in this package, replace `Record<string, any>` query params with properly typed DTOs.