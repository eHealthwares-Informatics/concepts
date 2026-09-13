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
exports.LocalitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const localities_service_1 = require("../services/localities.service");
let LocalitiesController = class LocalitiesController {
    localitiesService;
    constructor(localitiesService) {
        this.localitiesService = localitiesService;
    }
    async list(query) {
        const { page, limit, search, type, ...filters } = query;
        const result = await this.localitiesService.list({
            page: Number(page || 1),
            limit: Number(limit || 20),
            search,
            type,
            filters,
        });
        return {
            data: result.data,
            meta: { page: result.page, limit: result.limit, total: result.total },
        };
    }
    async nearby(localityId, limit) {
        return { data: await this.localitiesService.nearby(localityId, Number(limit || 50)) };
    }
    async get(localityId) {
        return { data: await this.localitiesService.get(localityId) };
    }
};
exports.LocalitiesController = LocalitiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List/search localities',
        description: 'Resolved pharmacy localities (area | neighbourhood | settlement). Free-text `search` ' +
            'matches the name; `type` restricts to one locality type. Any other query parameter is a ' +
            'filter using the shared DSL. Returns `{ data, meta: { page, limit, total } }`.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['area', 'neighbourhood', 'settlement'] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocalitiesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':localityId/nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Neighbouring localities (ward, LGA, then coordinate proximity)' }),
    (0, swagger_1.ApiParam)({ name: 'localityId' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Param)('localityId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalitiesController.prototype, "nearby", null);
__decorate([
    (0, common_1.Get)(':localityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a locality by id' }),
    (0, swagger_1.ApiParam)({ name: 'localityId' }),
    __param(0, (0, common_1.Param)('localityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalitiesController.prototype, "get", null);
exports.LocalitiesController = LocalitiesController = __decorate([
    (0, swagger_1.ApiTags)('Localities'),
    (0, common_1.Controller)('v1/localities'),
    __metadata("design:paramtypes", [localities_service_1.LocalitiesService])
], LocalitiesController);
//# sourceMappingURL=localities.controller.js.map