# Healthcare Concepts Agent

## About

Standalone NestJS 11 + TypeORM service for coding concepts (LOINC, SNOMED, ICD), facility registry, and drug data. Port 3011. Yarn.

## DB

SQLite (dev) / PostgreSQL (prod). Uses `synchronize: true` (no migrations). DB name: `coding-concepts.sqlite` or `concepts` (PG).

## Key commands

- `npm run start:dev` — dev server
- `npm run start:cli` — CLI entrypoint (facility seeder)
- `npm run seed` — seed all data (uses nest-commander CLI)

## Auth

**No authentication currently.** All endpoints are open. Add `JwtAuthGuard` using shared `JWT_ACCESS_SECRET` when protecting endpoints.

## Modules

- **concepts**: Coding concepts CRUD + LOINC/ICD seeding (src/modules/concepts/)
- **facilities**: Facility registry + FHIR Location endpoints (src/modules/facilities/)
- **drugs**: Pharmaceutics, drug components, generic products (src/modules/drugs/)
- **api-explorer**: Custom HTML API explorer

## Refactoring deviations (fix when touching)

### List endpoints (MOST PROBLEMATIC)
- **No shared ListQueryDto** — each module reinvents with copied fields
- **Concepts controller** uses `Record<string, any>` — replace with validated DTO
- **`listValues` controller bug**: uses `page` as fallback for `limit`
- **`meta` === `pagination`** — same object reference returns duplicate data
- **Sort not exposed** on most endpoints
- Filter engine (`executeListQuery`) only works in Concepts module
- **No search** on Facilities endpoint
- GenericProducts `sortBy` has no `@IsIn()` — injection risk

### Auth
- **NO AUTHENTICATION** — fully open API, no guards, no middleware
- `@nestjs/jwt` not installed — needs to be added
- When adding: create `JwtAuthGuard` with shared `JWT_ACCESS_SECRET`

### Tests
- **ZERO TESTS** — no test infrastructure at all
- Priority: add integration tests using SQLite (default DB) + supertest
- Copy pattern from rxsoft-lis-backend

### Seeding
- Most mature sheets import — THE TEMPLATE for all projects
- `SeedOrchestratorService` runs: facility → LOINC → ICD → drugs
- **Bug**: execution order is LOINC→ICD→Drugs→Facility but log says Steps 2,3,4,1 (mislabeled)
- Gated by `SEED_ON_START=true`
- CLI: `seed:all`, `seed:loinc`, `seed:icd`, `seed:facility`, `seed:drug`

### Google Sheets (THE TEMPLATE)
- Uses `google-auth-library` SDK (two instances: readonly + read/write)
- Content hash tracking, `ImportTrackingEntity`, sync status write-back
- LOINC: `GOOGLE_SHEET_ID`, ICD: `ICD_SHEET_ID`, Facility: `FACILITY_SHEET_ID`

### Schema
- `synchronize: true` with `DB_DROP_SCHEMA=true` — **high risk**: data loss on restart
- No migrations — switch to proper migrations for production