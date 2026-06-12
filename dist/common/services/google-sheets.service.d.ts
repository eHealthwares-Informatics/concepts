import { ConfigService } from '@nestjs/config';
export declare class GoogleSheetsService {
    private configService;
    private readonly logger;
    private readonly sheetId;
    private readonly auth;
    constructor(configService: ConfigService);
    fetchSheetData(sheetName?: string): Promise<{
        headers: any;
        rows: any;
        revision: string;
        lastUpdate: Date;
    }>;
    private makeRequest;
    private generateRevision;
}
