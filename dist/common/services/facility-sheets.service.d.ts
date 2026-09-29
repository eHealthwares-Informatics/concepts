import { ConfigService } from '@nestjs/config';
export interface SheetData {
    headers: string[];
    rows: Record<string, string>[];
}
export interface SheetSyncUpdate {
    rowIndex: number;
    uuid: string;
    syncStatus: string;
    syncMessage: string;
    syncTime: string;
}
export declare class FacilitySheetsService {
    private configService;
    private readonly logger;
    private readonly sheetId;
    private readonly readAuth;
    private readonly writeAuth;
    constructor(configService: ConfigService);
    getSheetNames(): Promise<string[]>;
    fetchSheetData(sheetName: string): Promise<SheetData>;
    getRowCount(sheetName: string): Promise<number>;
    writeSyncData(sheetName: string, updates: SheetSyncUpdate[]): Promise<number>;
    private columnIndexToLetter;
    private makeRequest;
    private makeWriteRequest;
}
