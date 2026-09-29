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
var FacilitySheetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilitySheetsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const https_1 = __importDefault(require("https"));
const google_auth_library_1 = require("google-auth-library");
let FacilitySheetsService = FacilitySheetsService_1 = class FacilitySheetsService {
    configService;
    logger = new common_1.Logger(FacilitySheetsService_1.name);
    sheetId;
    readAuth;
    writeAuth;
    constructor(configService) {
        this.configService = configService;
        this.sheetId = this.configService.getOrThrow('FACILITY_SHEET_ID');
        const credentials = {
            client_email: this.configService.get('GOOGLE_CLIENT_EMAIL'),
            private_key: this.configService
                .get('GOOGLE_PRIVATE_KEY')
                ?.replace(/\\n/g, '\n'),
        };
        this.readAuth = new google_auth_library_1.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        this.writeAuth = new google_auth_library_1.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
    }
    async getSheetNames() {
        const client = await this.readAuth.getClient();
        const token = await client.getAccessToken();
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}?fields=sheets.properties`;
        const data = await this.makeRequest(url, token.token);
        return data.sheets.map((s) => s.properties.title);
    }
    async fetchSheetData(sheetName) {
        const client = await this.readAuth.getClient();
        const token = await client.getAccessToken();
        const range = `${sheetName}!A1:ZZ`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}`;
        const data = await this.makeRequest(url, token.token);
        if (!data.values || data.values.length < 2) {
            return { headers: [], rows: [] };
        }
        const headers = data.values[0].map((h) => h.trim());
        const rawRows = data.values.slice(1);
        const rows = rawRows.map((row) => {
            const record = {};
            headers.forEach((header, index) => {
                record[header] = row[index] || '';
            });
            return record;
        });
        return { headers, rows };
    }
    async getRowCount(sheetName) {
        const client = await this.readAuth.getClient();
        const token = await client.getAccessToken();
        const range = `${sheetName}!A:A`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}`;
        const data = await this.makeRequest(url, token.token);
        return data.values ? data.values.length - 1 : 0;
    }
    async writeSyncData(sheetName, updates) {
        if (updates.length === 0)
            return 0;
        const client = await this.writeAuth.getClient();
        const token = await client.getAccessToken();
        const colUuid = this.columnIndexToLetter(79);
        const colStatus = this.columnIndexToLetter(80);
        const colMessage = this.columnIndexToLetter(81);
        const colTime = this.columnIndexToLetter(82);
        const uuidValues = [['uuid']];
        const statusValues = [['sync_status']];
        const messageValues = [['sync_message']];
        const timeValues = [['sync_time']];
        updates.sort((a, b) => a.rowIndex - b.rowIndex);
        for (const update of updates) {
            uuidValues.push([update.uuid]);
            statusValues.push([update.syncStatus]);
            messageValues.push([update.syncMessage]);
            timeValues.push([update.syncTime]);
        }
        const totalRows = updates.length + 1;
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
        const result = await this.makeWriteRequest(batchUrl, token.token, body);
        return result.totalUpdatedCells || 0;
    }
    columnIndexToLetter(index) {
        let result = '';
        let n = index + 1;
        while (n > 0) {
            n--;
            result = String.fromCharCode(65 + (n % 26)) + result;
            n = Math.floor(n / 26);
        }
        return result;
    }
    makeRequest(url, token) {
        return new Promise((resolve, reject) => {
            https_1.default
                .get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    }
                    else {
                        reject(new Error(`Request failed ${res.statusCode}: ${data}`));
                    }
                });
            })
                .on('error', reject);
        });
    }
    makeWriteRequest(url, token, body) {
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
            const req = https_1.default.request(opts, (res) => {
                let d = '';
                res.on('data', (c) => { d += c; });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(d));
                    }
                    else {
                        reject(new Error(`Write request failed ${res.statusCode}: ${d}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }
};
exports.FacilitySheetsService = FacilitySheetsService;
exports.FacilitySheetsService = FacilitySheetsService = FacilitySheetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FacilitySheetsService);
//# sourceMappingURL=facility-sheets.service.js.map