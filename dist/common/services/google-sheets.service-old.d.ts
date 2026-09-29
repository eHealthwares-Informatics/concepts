import { ConfigService } from '@nestjs/config';
export interface GoogleSheetsResponse {
    range: string;
    majorDimension: string;
    values: string[][];
}
export interface SheetData {
    headers: string[];
    rows: Record<string, string>[];
    revision: string;
    lastUpdate: Date;
}
export declare class GoogleSheetsService {
    private configService;
    private readonly logger;
    private readonly sheetId;
    private readonly apiKey;
    constructor(configService: ConfigService);
    fetchSheetData(sheetName?: string): Promise<SheetData>;
    getSpreadsheetMetadata(): Promise<{
        spreadsheetId: any;
        title: any;
        locale: any;
        autoRecalc: any;
        timeZone: any;
        updatedTime: any;
    }>;
    private makeRequest;
    private generateRevision;
    getChangedRows(currentData: SheetData, previousData: SheetData | null): {
        added: Record<string, string>[];
        modified: Record<string, string>[];
        deleted: string[];
    };
}
