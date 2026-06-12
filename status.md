# healthcare-concepts — Status

## What it does

Standalone NestJS service for managing healthcare coding concept registries (LOINC, SNOMED, DICOM, ICD-10, RxNorm, EMDEx). Provides CRUD, search, and matching for coding concepts, their attributes, values, and external system mappings.

## Modules

| Module | Description |
|---|---|
| **concepts** | Single module managing 5 entities |

### Entities

| Entity | Purpose |
|---|---|
| **ConceptCoding** | Core coding concept (code, name, descriptions per concept system) |
| **ConceptAttribute** | Attribute definitions per concept system (data type, cardinality) |
| **ConceptAttributeValue** | Values for concept-attribute pairs |
| **ExternalConceptMapping** | Crosswalk between internal and external coding systems |
| **ImportTracking** | Data import audit history |

## Entrypoints

- `src/main.ts` — NestJS bootstrap, Swagger at `/docs`
- `src/cli.ts` — CLI entrypoint (`npm run start:cli`), though the file does not exist on disk

## Status

| Aspect | Status |
|---|---|
| **Pagination** | Present via `executeListQuery` utility. Default 20, max 100. |
| **Response envelope** | `{ data, pagination: { page, limit, total, totalPages }, meta }` — but `meta` is the same object ref as `pagination`. |
| **Filter system** | String-based protocol (`TYPE|value|valueTo`) with 10 operators. Powerful but tied to root-table columns only. |
| **Sort** | Not exposed to API consumers. No sortBy/sortOrder params on any endpoint. |
| **DTO validation** | None — uses `Record<string, any>` with class-validator present but unused. `ValidationPipe` configured permissively. |
| **Bug** | `listValues` controller line 145 uses `page` as fallback for `limit` instead of `limit`. |
| **Tests** | No test files found. |
