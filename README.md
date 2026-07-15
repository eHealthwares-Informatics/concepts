# Healthcare Concepts

Standalone NestJS service for healthcare coding concepts, facility registry, and reference data. Provides REST and FHIR R4 endpoints for querying facilities, LOINC, ICD-10, SNOMED, drugs, and other healthcare terminologies.

Part of the [RxSoft monorepo](https://github.com/anomalyco/rxsoft).

## Stack

| Aspect | Technology |
|---|---|
| Runtime | Node.js |
| Framework | NestJS 11 |
| Database | PostgreSQL (primary) / SQLite (alternative) |
| ORM | TypeORM 0.3 |
| Validation | class-validator + class-transformer |
| API Docs | Swagger at `/docs`, API Explorer at `/api/explorer` |
| PM | yarn |

## Quick Start

```bash
yarn install
npm run start:dev  # Dev with watch + LOINC seeding
```

The API defaults to **port 3011** (configurable via `PORT`).

## Modules

| Module | Description |
|---|---|
| **concepts** | LOINC, ICD-10, SNOMED, and other medical coding concepts. Seeders for Google Sheets import. |
| **facilities** | Facility registry with states, LGAs, wards, facility types/levels. Hierarchical query support. |
| **drugs** | Drug/medication reference data with seeders. |
| **api-explorer** | CMS-style FHIR API explorer UI for browsing concepts |

## Architecture

- Standard NestJS module pattern: controller → service → repository (TypeORM)
- `CodeService` / `CodeController` for generic concept lookups
- `FacilitySeederService` + `SeedOrchestratorService` for idempotent seeding
- CLI entrypoint at `src/cli.ts` for headless seeding operations
- FHIR R4-compatible `Location` search and read endpoints

## Commands

| Command | Description |
|---|---|
| `npm run start:dev` | Dev server (seeds LOINC on start) |
| `npm run start:cli` | CLI entrypoint (`ts-node src/cli.ts`) |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Production start |
| `npm run seed:facility` | Seed facility data |
| `npm run seed:icd` | Seed ICD codes |
| `npm run seed:loinc` | Seed LOINC codes |
| `npm run seed:drug` | Seed drug data |
| `npm run seed:all` | Seed all data |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | 3011 | Server port |
| `DB_TYPE` | `postgres` | Database type (`postgres` or `sqlite`) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `DB_NAME` | `concepts` | Database name |
| `DB_SYNCHRONIZE` | `true` | Auto-create tables (dev only) |
| `DB_DROP_SCHEMA` | `true` | Drop schema on start |
| `NODE_ENV` | `development` | Environment |
| `SEED_ON_START` | `true` | Seed on startup |
| `GOOGLE_SHEET_ID` | — | Sheet ID for concepts import |
| `FACILITY_SHEET_ID` | — | Sheet ID for facility import |
| `ICD_SHEET_ID` | — | Sheet ID for ICD import |
| `GOOGLE_CLIENT_EMAIL` | — | Service account email |
| `GOOGLE_PRIVATE_KEY` | — | Service account private key |

## Database

- **Development**: PostgreSQL or SQLite (via `DB_TYPE`)
- **Seeding**: Idempotent upserts from Google Sheets via service account
- TypeORM with `synchronize: true` for dev; use migrations for production

## See Also

- [`../BACKEND_SEARCH_ARCHITECTURE.md`](https://github.com/anomalyco/rxsoft/blob/main/BACKEND_SEARCH_ARCHITECTURE.md) — List/search endpoint standards (healthcare-concepts has known deviations)
- [`LOINC_SEEDING_GUIDE.md`](https://github.com/anomalyco/rxsoft/blob/main/healthcare-concepts/LOINC_SEEDING_GUIDE.md) — detailed LOINC seeding instructions
- [`../AGENTS.md`](https://github.com/anomalyco/rxsoft/blob/main/AGENTS.md) — Monorepo overview
