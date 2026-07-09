# Seeding — healthcare-concepts

## Purpose

Add new seed data for coding concepts, facilities, or drugs.

## When to invoke
When adding new seed sources for development.

## Workflow

1. Create a seeder service (e.g., `LoincSeederService`, `FacilitySeederService`, `DrugSeederService`).
2. Register in `SeedOrchestratorService.seedAll()` to control execution order.
3. Add CLI command via `nest-commander` in `seed.command.ts` (`seed:all`, `seed:loinc`, etc.).
4. Gate behind `SEED_ON_START=true`.
5. Use idempotent upserts with `insertTrackingEntity` for change tracking.

## Refactoring

Ensure seeders follow the existing pattern: hash-based change detection, idempotent upserts, execution order in orchestrator.