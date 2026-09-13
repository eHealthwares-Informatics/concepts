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
exports.FormulationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const formulations_dto_1 = require("../dto/formulations.dto");
const formulations_service_1 = require("../services/formulations.service");
let FormulationsController = class FormulationsController {
    formulationsService;
    constructor(formulationsService) {
        this.formulationsService = formulationsService;
    }
    async list(query) {
        const result = await this.formulationsService.list(query);
        return {
            data: result.data,
            meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
        };
    }
    async get(formulationId) {
        return { data: await this.formulationsService.get(formulationId) };
    }
    async create(payload) {
        return { data: await this.formulationsService.create(payload) };
    }
    async replace(formulationId, payload) {
        return { data: await this.formulationsService.update(formulationId, payload) };
    }
    async patch(formulationId, payload) {
        return { data: await this.formulationsService.update(formulationId, payload) };
    }
    async remove(formulationId) {
        await this.formulationsService.remove(formulationId);
    }
};
exports.FormulationsController = FormulationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [formulations_dto_1.ListFormulationsDto]),
    __metadata("design:returntype", Promise)
], FormulationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':formulationId'),
    __param(0, (0, common_1.Param)('formulationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormulationsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [formulations_dto_1.CreateFormulationDto]),
    __metadata("design:returntype", Promise)
], FormulationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':formulationId'),
    __param(0, (0, common_1.Param)('formulationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, formulations_dto_1.UpdateFormulationDto]),
    __metadata("design:returntype", Promise)
], FormulationsController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)(':formulationId'),
    __param(0, (0, common_1.Param)('formulationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, formulations_dto_1.UpdateFormulationDto]),
    __metadata("design:returntype", Promise)
], FormulationsController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':formulationId'),
    __param(0, (0, common_1.Param)('formulationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormulationsController.prototype, "remove", null);
exports.FormulationsController = FormulationsController = __decorate([
    (0, swagger_1.ApiTags)('formulations'),
    (0, common_1.Controller)('v1/formulations'),
    __metadata("design:paramtypes", [formulations_service_1.FormulationsService])
], FormulationsController);
//# sourceMappingURL=formulations.controller.js.map