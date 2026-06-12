import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import https from 'https';
import { GoogleAuth } from 'google-auth-library';

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

@Injectable()
export class FacilitySheetsService {
  private readonly logger = new Logger(FacilitySheetsService.name);
  private readonly sheetId: string;
  private readonly readAuth: GoogleAuth;
  private readonly writeAuth: GoogleAuth;

  constructor(private configService: ConfigService) {
    this.sheetId = this.configService.getOrThrow<string>('FACILITY_SHEET_ID');

    const credentials = {
      client_email: this.configService.get<string>('GOOGLE_CLIENT_EMAIL'),
      private_key: this.configService
        .get<string>('GOOGLE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n'),
    };

    this.readAuth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    this.writeAuth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async getSheetNames(): Promise<string[]> {
    const client = await this.readAuth.getClient();
    const token = await client.getAccessToken();

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}?fields=sheets.properties`;
    const data = await this.makeRequest(url, token.token!);

    return data.sheets.map((s: any) => s.properties.title);
  }

  async fetchSheetData(sheetName: string): Promise<SheetData> {
    const client = await this.readAuth.getClient();
    const token = await client.getAccessToken();

    const range = `${sheetName}!A1:ZZ`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}`;
    const data = await this.makeRequest(url, token.token!);

    if (!data.values || data.values.length < 2) {
      return { headers: [], rows: [] };
    }

    const headers: string[] = data.values[0].map((h: string) => h.trim());
    const rawRows = data.values.slice(1);

    const rows = rawRows.map((row: string[]) => {
      const record: Record<string, string> = {};
      headers.forEach((header: string, index: number) => {
        record[header] = row[index] || '';
      });
      return record;
    });

    return { headers, rows };
  }

  async getRowCount(sheetName: string): Promise<number> {
    const client = await this.readAuth.getClient();
    const token = await client.getAccessToken();

    const range = `${sheetName}!A:A`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}`;
    const data = await this.makeRequest(url, token.token!);

    return data.values ? data.values.length - 1 : 0;
  }

  async writeSyncData(
    sheetName: string,
    updates: SheetSyncUpdate[],
  ): Promise<number> {
    if (updates.length === 0) return 0;

    const client = await this.writeAuth.getClient();
    const token = await client.getAccessToken();

    // Columns 79=uuid, 80=sync_status, 81=sync_message, 82=sync_time
    const colUuid = this.columnIndexToLetter(79);
    const colStatus = this.columnIndexToLetter(80);
    const colMessage = this.columnIndexToLetter(81);
    const colTime = this.columnIndexToLetter(82);

    // Build values for each column
    const uuidValues: string[][] = [['uuid']];
    const statusValues: string[][] = [['sync_status']];
    const messageValues: string[][] = [['sync_message']];
    const timeValues: string[][] = [['sync_time']];

    // Sort updates by rowIndex for sequential writes
    updates.sort((a, b) => a.rowIndex - b.rowIndex);

    for (const update of updates) {
      uuidValues.push([update.uuid]);
      statusValues.push([update.syncStatus]);
      messageValues.push([update.syncMessage]);
      timeValues.push([update.syncTime]);
    }

    const totalRows = updates.length + 1; // +1 for header

    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values:batchUpdate`;
    const body = {
      valueInputOption: 'RAW',
      data: [
        { range: `${sheetName}!${colUuid}1:${colUuid}${totalRows}`, values: uuidValues },
        { range: `${sheetName}!${colStatus}1:${colStatus}${totalRows}`, values: statusValues },
        { range: `${sheetName}!${colMessage}1:${colMessage}${totalRows}`, values: messageValues },
        { range: `${sheetName}!${colTime}1:${colTime}${totalRows}`, values: timeValues },
      ],
    };

    const result = await this.makeWriteRequest(batchUrl, token.token!, body);
    return result.totalUpdatedCells || 0;
  }

  private columnIndexToLetter(index: number): string {
    let result = '';
    let n = index + 1; // 1-indexed
    while (n > 0) {
      n--;
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result;
  }

  private makeRequest(url: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https
        .get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(data));
            } else {
              reject(new Error(`Request failed ${res.statusCode}: ${data}`));
            }
          });
        })
        .on('error', reject);
    });
  }

  private makeWriteRequest(url: string, token: string, body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const u = new URL(url);
      const opts = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      };
      const req = https.request(opts, (res) => {
        let d = '';
        res.on('data', (c) => { d += c; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(d));
          } else {
            reject(new Error(`Write request failed ${res.statusCode}: ${d}`));
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}
