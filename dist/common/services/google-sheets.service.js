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
const google_auth_library_1 = require("google-auth-library");
let GoogleSheetsService = GoogleSheetsService_1 = class GoogleSheetsService {
    configService;
    logger = new common_1.Logger(GoogleSheetsService_1.name);
    sheetId;
    auth;
    constructor(configService) {
        this.configService = configService;
        this.sheetId = this.configService.getOrThrow('GOOGLE_SHEET_ID');
        this.auth = new google_auth_library_1.GoogleAuth({
            credentials: {
                client_email: this.configService.get('GOOGLE_CLIENT_EMAIL'),
                private_key: this.configService
                    .get('GOOGLE_PRIVATE_KEY')
                    ?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
    }
    async fetchSheetData(sheetName = 'LOINC') {
        const client = await this.auth.getClient();
        const accessToken = await client.getAccessToken();
        const range = `${sheetName}!A1:ZZ1000`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}`;
        const data = await this.makeRequest(url, accessToken.token);
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
    makeRequest(url, token) {
        return new Promise((resolve, reject) => {
            https_1.default
                .get(url, {
                headers: token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : {},
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
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
};
exports.GoogleSheetsService = GoogleSheetsService;
exports.GoogleSheetsService = GoogleSheetsService = GoogleSheetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleSheetsService);
//# sourceMappingURL=google-sheets.service.js.map