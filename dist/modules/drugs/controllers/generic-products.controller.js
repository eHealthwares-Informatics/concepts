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
exports.GenericProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const generic_products_dto_1 = require("../dto/generic-products.dto");
const generic_products_service_1 = require("../services/generic-products.service");
let GenericProductsController = class GenericProductsController {
    genericProductsService;
    constructor(genericProductsService) {
        this.genericProductsService = genericProductsService;
    }
    async list(query) {
        const result = await this.genericProductsService.list(query);
        return {
            data: result.data,
            meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
        };
    }
    async search(query) {
        const result = await this.genericProductsService.list(query);
        return {
            data: result.data.map((item) => ({ id: item.id, code: item.code, name: item.name })),
            meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total },
        };
    }
    async getByCode(code) {
        return { data: await this.genericProductsService.getByCode(code) };
    }
    async get(genericProductId) {
        return { data: await this.genericProductsService.get(genericProductId) };
    }
    async create(payload) {
        return { data: await this.genericProductsService.create(payload) };
    }
    async replace(genericProductId, payload) {
        return { data: await this.genericProductsService.update(genericProductId, payload) };
    }
    async patch(genericProductId, payload) {
        return { data: await this.genericProductsService.update(genericProductId, payload) };
    }
    async remove(genericProductId) {
        await this.genericProductsService.remove(genericProductId);
    }
};
exports.GenericProductsController = GenericProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generic_products_dto_1.ListGenericProductsDto]),
    __metadata("design:returntype", Promise)
], GenericProductsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search generic products returning lightweight results' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generic_products_dto_1.ListGenericProductsDto]),
    __metadata("design:returntype", Promise)
], GenericProductsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get generic product by code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GenericProductsController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Get)(':genericProductId'),
    __param(0, (0, common_1.Param)('genericProductId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GenericProductsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generic_products_dto_1.CreateGenericProductDto]),
    __metadata("design:returntype", Promise)
], GenericProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':genericProductId'),
    __param(0, (0, common_1.Param)('genericProductId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generic_products_dto_1.UpdateGenericProductDto]),
    __metadata("design:returntype", Promise)
], GenericProductsController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)(':genericProductId'),
    __param(0, (0, common_1.Param)('genericProductId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generic_products_dto_1.UpdateGenericProductDto]),
    __metadata("design:returntype", Promise)
], GenericProductsController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':genericProductId'),
    __param(0, (0, common_1.Param)('genericProductId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GenericProductsController.prototype, "remove", null);
exports.GenericProductsController = GenericProductsController = __decorate([
    (0, swagger_1.ApiTags)('generic-products'),
    (0, common_1.Controller)('v1/generic-products'),
    __metadata("design:paramtypes", [generic_products_service_1.GenericProductsService])
], GenericProductsController);
//# sourceMappingURL=generic-products.controller.js.map