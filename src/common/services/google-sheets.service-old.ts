import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import https from 'https';

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

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private readonly sheetId: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.sheetId = this.configService.getOrThrow<string>('GOOGLE_SHEET_ID');
    this.apiKey = this.configService.getOrThrow<string>('GOOGLE_API_KEY');

    if (!this.sheetId || !this.apiKey) {
      this.logger.warn(
        'Google Sheets credentials not configured. Seeding will not work.',
      );
    }
  }

  /**
   * Fetches data from a Google Sheet
   * @param sheetName Name of the sheet tab (e.g., "LOINC")
   * @returns Sheet data with headers and rows
   */
  async fetchSheetData(sheetName: string = 'LOINC'): Promise<SheetData> {
    if (!this.sheetId || !this.apiKey) {
      throw new Error('Google Sheets credentials not configured');
    }

    try {
      const range = `${sheetName}!A1:ZZ1000`; // Fetch up to 1000 rows
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}?key=${this.apiKey}`;

      const data = await this.makeRequest<GoogleSheetsResponse>(url);

      if (!data.values || data.values.length === 0) {
        throw new Error(`No data found in sheet: ${sheetName}`);
      }

      const headers = data.values[0];
      const rows = data.values.slice(1).map((row) => {
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          record[header] = row[index] || '';
        });
        return record;
      });

      return {
        headers,
        rows,
        revision: this.generateRevision(data),
        lastUpdate: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch Google Sheet data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetches metadata about the spreadsheet (including revision ID for change tracking)
   */
  async getSpreadsheetMetadata() {
    if (!this.sheetId || !this.apiKey) {
      throw new Error('Google Sheets credentials not configured');
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}?key=${this.apiKey}`;
      const metadata = await this.makeRequest<any>(url);

      return {
        spreadsheetId: metadata.spreadsheetId,
        title: metadata.properties.title,
        locale: metadata.properties.locale,
        autoRecalc: metadata.properties.autoRecalc,
        timeZone: metadata.properties.timeZone,
        updatedTime: metadata.spreadsheetUrl,
      };
    } catch (error:any) {
      this.logger.error(`Failed to fetch spreadsheet metadata: ${error.message}`);
      throw error;
    }
  }

  /**
   * Makes an HTTPS request to Google Sheets API
   */
  private makeRequest<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data));
              } catch (error: any) {
                reject(new Error(`Failed to parse response: ${error.message}`));
              }
            } else {
              reject(
                new Error(
                  `API request failed with status ${res.statusCode}: ${data}`,
                ),
              );
            }
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Generates a revision hash based on the response data
   * This helps track changes in the sheet
   */
  private generateRevision(data: GoogleSheetsResponse): string {
    const content = JSON.stringify(data.values);
    let hash = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * Compares two sheet data sets and returns only changed rows
   */
  getChangedRows(
    currentData: SheetData,
    previousData: SheetData | null,
  ): { added: Record<string, string>[]; modified: Record<string, string>[]; deleted: string[] } {
    const added: Record<string, string>[] = [];
    const modified: Record<string, string>[] = [];
    const deleted: string[] = [];

    if (!previousData) {
      // First import - all rows are new
      return { added: currentData.rows, modified: [], deleted: [] };
    }

    const previousMap = new Map(
      previousData.rows.map((row) => [row.LOINC_NUM, row]),
    );
    const currentMap = new Map(currentData.rows.map((row) => [row.LOINC_NUM, row]));

    // Check for added and modified rows
    currentData.rows.forEach((currentRow) => {
      const loincNum = currentRow.LOINC_NUM;
      const previousRow = previousMap.get(loincNum);

      if (!previousRow) {
        added.push(currentRow);
      } else if (JSON.stringify(currentRow) !== JSON.stringify(previousRow)) {
        modified.push(currentRow);
      }
    });

    // Check for deleted rows
    previousData.rows.forEach((previousRow) => {
      if (!currentMap.has(previousRow.LOINC_NUM)) {
        deleted.push(previousRow.LOINC_NUM);
      }
    });

    return { added, modified, deleted };
  }
}
