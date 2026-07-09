# Google Sheets Import — healthcare-concepts

## Purpose

Add or modify Google Sheets import for coding concepts, facilities, or drugs.

## When to invoke

When adding a new data source from Google Sheets.

## When not to invoke

For manual/code-based seeding only.

## Inputs

- **Sheet ID** (google sheet)
- **Target entities**
- **Tab/sheet mapping**

## Workflow

1. Add new env vars: `{SOURCE}_SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` (reuse existing ones if same service account).
2. Create seeder service similar to `LoincSeederService`:
   - Use `GoogleSheetsService` to read ranges
   - Generate content hash for change tracking
   - Upsert rows with `ImportTrackingEntity` for audit
3. Register in `SeedOrchestratorService.seedAll()`.
4. Add CLI command in `seed.command.ts`.

## Refactoring

This package has the most mature sheets import pattern. Follow the existing `LoincSeederService` as the template.