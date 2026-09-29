"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GoogleSheetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const https_1 = __importDefault(require("https"));
let GoogleSheetsService = GoogleSheetsService_1 = class GoogleSheetsService {
    configService;
    logger = new common_1.Logger(GoogleSheetsService_1.name);
    sheetId;
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.sheetId = this.configService.getOrThrow('GOOGLE_SHEET_ID');
        this.apiKey = this.configService.getOrThrow('GOOGLE_API_KEY');
        if (!this.sheetId || !this.apiKey) {
            this.logger.warn('Google Sheets credentials not configured. Seeding will not work.');
        }
    }
    async fetchSheetData(sheetName = 'LOINC') {
        if (!this.sheetId || !this.apiKey) {
            throw new Error('Google Sheets credentials not configured');
        }
        try {
            const range = `${sheetName}!A1:ZZ1000`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}?key=${this.apiKey}`;
            const data = await this.makeRequest(url);
            if (!data.values || data.values.length === 0) {
                throw new Error(`No data found in sheet: ${sheetName}`);
            }
            const headers = data.values[0];
            const rows = data.values.slice(1).map((row) => {
                const record = {};
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
        }
        catch (error) {
            this.logger.error(`Failed to fetch Google Sheet data: ${error.message}`);
            throw error;
        }
    }
    async getSpreadsheetMetadata() {
        if (!this.sheetId || !this.apiKey) {
            throw new Error('Google Sheets credentials not configured');
        }
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}?key=${this.apiKey}`;
            const metadata = await this.makeRequest(url);
            return {
                spreadsheetId: metadata.spreadsheetId,
                title: metadata.properties.title,
                locale: metadata.properties.locale,
                autoRecalc: metadata.properties.autoRecalc,
                timeZone: metadata.properties.timeZone,
                updatedTime: metadata.spreadsheetUrl,
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch spreadsheet metadata: ${error.message}`);
            throw error;
        }
    }
    makeRequest(url) {
        return new Promise((resolve, reject) => {
            https_1.default
                .get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data));
                        }
                        catch (error) {
                            reject(new Error(`Failed to parse response: ${error.message}`));
                        }
                    }
                    else {
                        reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
                    }
                });
            })
                .on('error', (error) => {
                reject(error);
            });
        });
    }
    generateRevision(data) {
        const content = JSON.stringify(data.values);
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    getChangedRows(currentData, previousData) {
        const added = [];
        const modified = [];
        const deleted = [];
        if (!previousData) {
            return { added: currentData.rows, modified: [], deleted: [] };
        }
        const previousMap = new Map(previousData.rows.map((row) => [row.LOINC_NUM, row]));
        const currentMap = new Map(currentData.rows.map((row) => [row.LOINC_NUM, row]));
        currentData.rows.forEach((currentRow) => {
            const loincNum = currentRow.LOINC_NUM;
            const previousRow = previousMap.get(loincNum);
            if (!previousRow) {
                added.push(currentRow);
            }
            else if (JSON.stringify(currentRow) !== JSON.stringify(previousRow)) {
                modified.push(currentRow);
            }
        });
        previousData.rows.forEach((previousRow) => {
            if (!currentMap.has(previousRow.LOINC_NUM)) {
                deleted.push(previousRow.LOINC_NUM);
            }
        });
        return { added, modified, deleted };
    }
};
exports.GoogleSheetsService = GoogleSheetsService;
exports.GoogleSheetsService = GoogleSheetsService = GoogleSheetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleSheetsService);
//# sourceMappingURL=google-sheets.service-old.js.map