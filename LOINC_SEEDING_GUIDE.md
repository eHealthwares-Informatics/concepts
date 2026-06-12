# LOINC Data Import & Seeding Guide

This document explains how to use the healthcare-coding-concept seeding system to import LOINC data from Google Sheets with automatic change tracking.

## Overview

The seeding system provides:
- **Google Sheets Integration**: Automatically fetches LOINC data from a shared Google Sheet
- **Change Tracking**: Tracks what was added, modified, or deleted on each import
- **Entity Creation**: Automatically creates:
  - `ModuleCodeEntity` records (one per LOINC code)
  - `ConceptAttributeEntity` records (one per column in the sheet)
  - `ConceptAttributeValueEntity` records (one per cell value)
- **Import History**: Maintains a log of all imports for auditing

## Architecture & Data Model

### Entity Relationships

```
ModuleCodeEntity (LOINC codes)
├── id: UUID
├── module: 'LOINC'
├── code: LOINC_NUM (e.g., '10000-8')
├── shortName: COMPONENT
├── fullName: Optional
├── description: Optional
└── conceptValues: ConceptAttributeValueEntity[]

ConceptAttributeEntity (Column definitions)
├── id: UUID
├── module: 'LOINC'
├── code: snake_case version of column name
├── name: Original column name
├── dataType: 'string' (extensible to number, date, etc.)
├── isRequired: boolean
├── isMultiValued: boolean
├── isSearchable: boolean
└── isFilterable: boolean

ConceptAttributeValueEntity (Cell values)
├── id: UUID
├── moduleCode: FK -> ModuleCodeEntity
├── module: 'LOINC'
├── attribute: FK -> ConceptAttributeEntity
├── value: Actual cell value
├── valueFormat: 'text' | 'number' | 'date' | etc.
└── createdAt, updatedAt: Timestamps

ImportTrackingEntity (Import history)
├── id: UUID
├── module: 'LOINC'
├── revision: Hash of sheet data
├── totalRowsProcessed: Number
├── rowsAdded: Number
├── rowsModified: Number
├── rowsDeleted: Number
├── status: 'success' | 'partial' | 'failed'
├── errorMessage: Any errors
└── timestamp: When import occurred
```

## Setup Instructions

### 1. Configure Google Sheets API

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or use existing one)

2. **Enable Google Sheets API v4**:
   - In the API Library, search for "Google Sheets API"
   - Click "Enable"

3. **Create an API Key**:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy the key (this is your `GOOGLE_API_KEY`)

4. **Share the Google Sheet**:
   - Open the LOINC spreadsheet
   - Click "Share"
   - Make sure public access is "Anyone with the link can view" (or keep it private and use OAuth - advanced setup)

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
GOOGLE_SHEET_ID=1X64MFijd-hBsusv6t8J3dS_CUnahPw8wjdey70AmzQA
GOOGLE_API_KEY=your-api-key-here
DB_TYPE=sqlite
DB_NAME=coding-concepts.sqlite
```

### 3. Start the Application

```bash
cd healthcare-coding-concept
npm install
npm run dev
```

The service will start on `http://localhost:3011`

## API Endpoints

### Trigger LOINC Import

```bash
POST /api/v1/concepts/seed/loinc?triggeredBy=system
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully imported LOINC data. Created 42 codes and 1200 attribute values.",
  "stats": {
    "codesCreated": 42,
    "attributesCreated": 35,
    "valuesCreated": 1200,
    "errors": []
  },
  "tracking": {
    "module": "LOINC",
    "revision": "abc123def456",
    "totalRowsProcessed": 42,
    "rowsAdded": 40,
    "rowsModified": 2,
    "rowsDeleted": 0,
    "status": "success"
  }
}
```

### Get Import History

```bash
GET /api/v1/concepts/seed/loinc/history?limit=10
```

Returns the last 10 import records.

### Get Latest Import Status

```bash
GET /api/v1/concepts/seed/loinc/status
```

Returns the most recent import metadata.

## Google Sheet Structure

The LOINC sheet should have columns. The current implementation expects:

**Main Columns** (auto-mapped):
- `LOINC_NUM` → `ModuleCodeEntity.code`
- `COMPONENT` → `ModuleCodeEntity.shortName`

**Attribute Columns** (auto-converted to snake_case):
- `PROPERTY`, `TIME_ASPCT`, `SYSTEM`, `SCALE_TYP`, `METHOD_TYP`, `CLASS`, etc.
- Each column becomes a `ConceptAttributeEntity` with code in snake_case
- Each cell value becomes a `ConceptAttributeValueEntity`

Example mappings:
- `PROPERTY` → code: `property`, name: `PROPERTY`
- `TIME_ASPCT` → code: `time_aspct`, name: `TIME_ASPCT`
- `METHOD_TYP` → code: `method_typ`, name: `METHOD_TYP`

## How Change Tracking Works

1. **First Import**:
   - All rows are considered "added"
   - A `revision` hash is created from the sheet data
   - `ImportTrackingEntity` record is saved with the revision

2. **Subsequent Imports**:
   - New sheet data is fetched
   - New revision hash is calculated
   - Compared against the previous `ImportTrackingEntity.revision`
   - Only changed rows are processed (currently conservative approach)

3. **Change Detection**:
   - **Added**: LOINC_NUM that didn't exist before
   - **Modified**: LOINC_NUM with different attribute values
   - **Deleted**: LOINC_NUM no longer in sheet (tracked but not removed from DB)

## Advanced Usage

### Manual Database Queries

**Find all LOINC codes**:
```sql
SELECT * FROM module_codes WHERE module = 'LOINC';
```

**Find all attributes for LOINC**:
```sql
SELECT * FROM concept_attributes WHERE module = 'LOINC';
```

**Find all values for a specific LOINC code**:
```sql
SELECT cv.* 
FROM concept_values cv
JOIN module_codes mc ON cv.entity = mc.id
WHERE mc.code = '10000-8';
```

**View import history**:
```sql
SELECT * FROM import_tracking ORDER BY timestamp DESC LIMIT 10;
```

### Customizing Column Mappings

Edit `LoincSeederService.processAndCreateAttributes()` to customize which columns are imported or how they're mapped.

### Implementing Advanced Change Detection

The current implementation uses a conservative approach (reprocess all rows). For production, implement:

1. **Row Hashing**: Store hash of each row in ImportTrackingEntity
2. **Incremental Updates**: Only reprocess rows with different hashes
3. **Google Sheets Change Logs**: Use Google Drive API to detect actual file changes

## Troubleshooting

### "Google Sheets credentials not configured"
- Verify `.env` file has `GOOGLE_SHEET_ID` and `GOOGLE_API_KEY`
- Check that the API key is valid in Google Cloud Console

### "No data found in sheet"
- Verify the sheet name is exactly "LOINC" (case-sensitive)
- Ensure the sheet has data in cells A1 and beyond
- Check sheet sharing settings

### "API request failed with status 403"
- API key may not have permission
- Ensure "Google Sheets API v4" is enabled in Google Cloud Console
- Check that the sheet is not private (or use OAuth for private sheets)

### Import seems slow or times out
- May be fetching too many rows
- Modify the range in `GoogleSheetsService.fetchSheetData()` to limit rows
- Consider pagination for large datasets

## Next Steps

### Recommended Enhancements

1. **OAuth Authentication**: Support private Google Sheets without sharing
2. **Scheduled Imports**: Use `@Cron()` to auto-import daily/weekly
3. **Batch Processing**: Process large datasets in chunks to avoid timeouts
4. **Error Recovery**: Implement rollback mechanism for failed imports
5. **Data Validation**: Add validation for LOINC data format before saving
6. **Webhook Integration**: Receive notifications when sheet changes
7. **Multiple Modules**: Support importing other coding systems (SNOMED, ICD10, etc.)

## Example: Setting Up Scheduled Imports

Add to `LoincSeederService`:

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Cron(CronExpression.EVERY_DAY_AT_2AM)
async scheduledLoincImport() {
  const result = await this.seedLoincData('scheduler');
  this.logger.log(`Scheduled import completed: ${result.message}`);
}
```

Then add `ScheduleModule` to `ConceptsModule.imports[]`.

## Support

For issues or questions, refer to:
- [Google Sheets API Documentation](https://developers.google.com/sheets/api/reference/rest)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
