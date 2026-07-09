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
exports.DrugComponentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const drug_components_dto_1 = require("../dto/drug-components.dto");
const drug_components_service_1 = require("../services/drug-components.service");
let DrugComponentsController = class DrugComponentsController {
    drugComponentsService;
    constructor(drugComponentsService) {
        this.drugComponentsService = drugComponentsService;
    }
    async list(query) {
        const result = await this.drugComponentsService.list(query);
        return {
            data: result.data,
            meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
        };
    }
    async get(drugComponentId) {
        return { data: await this.drugComponentsService.get(drugComponentId) };
    }
    async create(payload) {
        return { data: await this.drugComponentsService.create(payload) };
    }
    async replace(drugComponentId, payload) {
        return { data: await this.drugComponentsService.update(drugComponentId, payload) };
    }
    async patch(drugComponentId, payload) {
        return { data: await this.drugComponentsService.update(drugComponentId, payload) };
    }
    async remove(drugComponentId) {
        await this.drugComponentsService.remove(drugComponentId);
    }
};
exports.DrugComponentsController = DrugComponentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [drug_components_dto_1.ListDrugComponentsDto]),
    __metadata("design:returntype", Promise)
], DrugComponentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':drugComponentId'),
    __param(0, (0, common_1.Param)('drugComponentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrugComponentsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [drug_components_dto_1.CreateDrugComponentDto]),
    __metadata("design:returntype", Promise)
], DrugComponentsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':drugComponentId'),
    __param(0, (0, common_1.Param)('drugComponentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, drug_components_dto_1.UpdateDrugComponentDto]),
    __metadata("design:returntype", Promise)
], DrugComponentsController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)(':drugComponentId'),
    __param(0, (0, common_1.Param)('drugComponentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, drug_components_dto_1.UpdateDrugComponentDto]),
    __metadata("design:returntype", Promise)
], DrugComponentsController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':drugComponentId'),
    __param(0, (0, common_1.Param)('drugComponentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrugComponentsController.prototype, "remove", null);
exports.DrugComponentsController = DrugComponentsController = __decorate([
    (0, swagger_1.ApiTags)('drug-components'),
    (0, common_1.Controller)('v1/drug-components'),
    __metadata("design:paramtypes", [drug_components_service_1.DrugComponentsService])
], DrugComponentsController);
//# sourceMappingURL=drug-components.controller.js.map