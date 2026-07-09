# Backend List Endpoint — healthcare-concepts

## Purpose

Create or modify list/search endpoints following `BACKEND_SEARCH_ARCHITECTURE.md`.

## When to invoke

When adding or fixing a list endpoint in this package.

## When not to invoke

For single-entity endpoints or non-NestJS projects.

## Inputs

- **Module** (`concepts`, `facilities`, `drugs`)
- **Entity name**
- **Searchable columns**
- **Filterable columns** (optional)

## Workflow

1. Use `ListQueryDto` pattern matching `src/shared/dto/list-query.dto.ts` (add if missing):
   ```typescript
   export class ListQueryDto {
     @Type(() => Number) @IsInt() @Min(1) @IsOptional()
     page = 1;
     @Type(() => Number) @IsInt() @Min(1) @Max(100) @IsOptional()
     limit = 20;
     @IsString() @IsOptional()
     search?: string;
     @IsString() @IsOptional()
     sortBy = 'createdAt';
     @IsIn(['asc', 'desc']) @IsOptional()
     sortOrder: 'asc' | 'desc' = 'desc';
     get offset() { return (this.page - 1) * this.limit; }
   }
   ```

2. Use the `executeListQuery()` from `src/modules/concepts/repository/list.ts` or create a standalone version using TypeORM QueryBuilder with ILIKE search and dynamic filter engine.

3. Return `{ data, meta: { page, limit, total } }`.

4. **Refactoring**: If the controller uses `Record<string, any>` as query type, replace with the DTO. If sort is not exposed, add `sortBy`/`sortOrder`.

## Refactoring consistency

Known deviations to fix when touching endpoints in this package:
- **`listValues` bug**: uses `page` as fallback for `limit` — fix to use `limit`
- **No DTO validation** in concepts controller — replace `Record<string, any>` with validated DTO
- **`meta` is same reference as `pagination`** — return separate objects
- **Sort not exposed** — add `sortBy`/`sortOrder` params
- **No sort column allow-list** — validate against known columns