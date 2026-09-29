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
exports.PharmaceuticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pharmaceutics_dto_1 = require("../dto/pharmaceutics.dto");
const pharmaceutics_service_1 = require("../services/pharmaceutics.service");
let PharmaceuticsController = class PharmaceuticsController {
    pharmaceuticsService;
    constructor(pharmaceuticsService) {
        this.pharmaceuticsService = pharmaceuticsService;
    }
    async list(query) {
        const result = await this.pharmaceuticsService.list(query);
        return {
            data: result.data,
            meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
        };
    }
    async get(pharmaceuticsId) {
        return { data: await this.pharmaceuticsService.get(pharmaceuticsId) };
    }
    async create(payload) {
        return { data: await this.pharmaceuticsService.create(payload) };
    }
    async replace(pharmaceuticsId, payload) {
        return { data: await this.pharmaceuticsService.update(pharmaceuticsId, payload) };
    }
    async patch(pharmaceuticsId, payload) {
        return { data: await this.pharmaceuticsService.update(pharmaceuticsId, payload) };
    }
    async remove(pharmaceuticsId) {
        await this.pharmaceuticsService.remove(pharmaceuticsId);
    }
};
exports.PharmaceuticsController = PharmaceuticsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pharmaceutics_dto_1.ListPharmaceuticsDto]),
    __metadata("design:returntype", Promise)
], PharmaceuticsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':pharmaceuticsId'),
    __param(0, (0, common_1.Param)('pharmaceuticsId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PharmaceuticsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pharmaceutics_dto_1.CreatePharmaceuticsDto]),
    __metadata("design:returntype", Promise)
], PharmaceuticsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':pharmaceuticsId'),
    __param(0, (0, common_1.Param)('pharmaceuticsId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pharmaceutics_dto_1.UpdatePharmaceuticsDto]),
    __metadata("design:returntype", Promise)
], PharmaceuticsController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)(':pharmaceuticsId'),
    __param(0, (0, common_1.Param)('pharmaceuticsId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pharmaceutics_dto_1.UpdatePharmaceuticsDto]),
    __metadata("design:returntype", Promise)
], PharmaceuticsController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':pharmaceuticsId'),
    __param(0, (0, common_1.Param)('pharmaceuticsId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PharmaceuticsController.prototype, "remove", null);
exports.PharmaceuticsController = PharmaceuticsController = __decorate([
    (0, swagger_1.ApiTags)('pharmaceutics'),
    (0, common_1.Controller)('v1/pharmaceutics'),
    __metadata("design:paramtypes", [pharmaceutics_service_1.PharmaceuticsService])
], PharmaceuticsController);
//# sourceMappingURL=pharmaceutics.controller.js.map