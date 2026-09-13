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
exports.PharmaciesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pharmacies_service_1 = require("../services/pharmacies.service");
let PharmaciesController = class PharmaciesController {
    pharmaciesService;
    constructor(pharmaciesService) {
        this.pharmaciesService = pharmaciesService;
    }
    async list(query) {
        const { page, limit, search, ...filters } = query;
        const result = await this.pharmaciesService.list({
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
    async nearby(pharmacyId, limit) {
        return { data: await this.pharmaciesService.nearby(pharmacyId, Number(limit || 50)) };
    }
    async get(pharmacyId) {
        return { data: await this.pharmaciesService.get(pharmacyId) };
    }
};
exports.PharmaciesController = PharmaciesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List/search pharmacies',
        description: 'Generic search + pagination. Free-text `search` matches premises name, pharmacist, ' +
            'certificate number and address. Any other query parameter is treated as a filter using ' +
            'the shared filter DSL (`field=TYPE|value|valueTo`), e.g. `category=EQUALS|Wholesale|`, ' +
            '`state.code=EQUALS|LA|`. Returns `{ data, meta: { page, limit, total } }`.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PharmaciesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':pharmacyId/nearby'),
    (0, swagger_1.ApiOperation)({
        summary: 'Pharmacies near a pharmacy',
        description: 'Returns pharmacies in the same area and in neighbouring areas, ordered by proximity ' +
            '(same area, ward, LGA, then coordinate distance). Each row carries `nearbyTier` and ' +
            '`nearbyDistanceKm`.',
    }),
    (0, swagger_1.ApiParam)({ name: 'pharmacyId' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Param)('pharmacyId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PharmaciesController.prototype, "nearby", null);
__decorate([
    (0, common_1.Get)(':pharmacyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a pharmacy by id' }),
    (0, swagger_1.ApiParam)({ name: 'pharmacyId' }),
    __param(0, (0, common_1.Param)('pharmacyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PharmaciesController.prototype, "get", null);
exports.PharmaciesController = PharmaciesController = __decorate([
    (0, swagger_1.ApiTags)('Pharmacies'),
    (0, common_1.Controller)('v1/pharmacies'),
    __metadata("design:paramtypes", [pharmacies_service_1.PharmaciesService])
], PharmaciesController);
//# sourceMappingURL=pharmacies.controller.js.map