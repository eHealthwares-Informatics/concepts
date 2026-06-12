import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import https from 'https';
import { GoogleAuth } from 'google-auth-library';

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private readonly sheetId: string;
  private readonly auth: GoogleAuth;

  constructor(private configService: ConfigService) {
    this.sheetId = this.configService.getOrThrow<string>('GOOGLE_SHEET_ID');

    this.auth = new GoogleAuth({
      credentials: {
        client_email: this.configService.get<string>('GOOGLE_CLIENT_EMAIL'),
        private_key: this.configService
          .get<string>('GOOGLE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }

  async fetchSheetData(sheetName: string = 'LOINC') {
    const client = await this.auth.getClient();
    const accessToken = await client.getAccessToken();

    const range = `${sheetName}!A1:ZZ1000`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}`;

    const data = await this.makeRequest(url, accessToken.token!);

    const headers = data.values[0];

    const rows = data.values.slice(1).map((row: string[]) => {
      const record: Record<string, string> = {};
      headers.forEach((header: string, index: number) => {
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
  }

  private makeRequest(url: string, token?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https
        .get(
          url,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          },
          (res) => {
            let data = '';

            res.on('data', (chunk) => {
              data += chunk;
            });

            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve(JSON.parse(data));
              } else {
                reject(
                  new Error(
                    `Request failed ${res.statusCode}: ${data}`,
                  ),
                );
              }
            });
          },
        )
        .on('error', reject);
    });
  }

  private generateRevision(data: any): string {
    const content = JSON.stringify(data.values);
    let hash = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }
}