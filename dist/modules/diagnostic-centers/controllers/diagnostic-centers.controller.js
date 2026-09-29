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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticCentersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const diagnostic_centers_service_1 = require("../services/diagnostic-centers.service");
let DiagnosticCentersController = class DiagnosticCentersController {
    centersService;
    constructor(centersService) {
        this.centersService = centersService;
    }
    async list(query) {
        const { page, limit, search, ...filters } = query;
        const result = await this.centersService.list({
            page: Number(page || 1),
            limit: Number(limit || 20),
            search,
            filters,
        });
        return {
            data: result.data,
            meta: { page: result.page, limit: result.limit, total: result.total },
        };
    }
    async nearby(id, limit) {
        return { data: await this.centersService.nearby(id, Number(limit || 50)) };
    }
    async get(id) {
        return { data: await this.centersService.get(id) };
    }
};
exports.DiagnosticCentersController = DiagnosticCentersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List/search diagnostic centers',
        description: 'Generic search + pagination over the babymigo diagnostic center directory. Free-text ' +
            '`search` matches name, address, description and raw LGA label. Any other query parameter ' +
            'is treated as a filter using the shared filter DSL (`field=TYPE|value|valueTo`), e.g. ' +
            '`state.code=EQUALS|124|`. Returns `{ data, meta: { page, limit, total } }`.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiagnosticCentersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id/nearby'),
    (0, swagger_1.ApiOperation)({
        summary: 'Diagnostic centers near a center',
        description: 'The directory has no coordinates, so proximity is tiered by admin area: ' +
            'same LGA first, then the same state, ordered by name. Each row carries `nearbyTier`.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiagnosticCentersController.prototype, "nearby", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a diagnostic center by id' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DiagnosticCentersController.prototype, "get", null);
exports.DiagnosticCentersController = DiagnosticCentersController = __decorate([
    (0, swagger_1.ApiTags)('Diagnostic Centers'),
    (0, common_1.Controller)('v1/diagnostic-centers'),
    __metadata("design:paramtypes", [diagnostic_centers_service_1.DiagnosticCentersService])
], DiagnosticCentersController);
//# sourceMappingURL=diagnostic-centers.controller.js.map