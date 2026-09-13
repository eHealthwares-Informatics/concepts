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
exports.DosageFormsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dosage_forms_dto_1 = require("../dto/dosage-forms.dto");
const dosage_forms_service_1 = require("../services/dosage-forms.service");
let DosageFormsController = class DosageFormsController {
    dosageFormsService;
    constructor(dosageFormsService) {
        this.dosageFormsService = dosageFormsService;
    }
    async list(query) {
        const result = await this.dosageFormsService.list(query);
        return {
            data: result.data,
            meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
        };
    }
    async get(dosageFormId) {
        return { data: await this.dosageFormsService.get(dosageFormId) };
    }
    async create(payload) {
        return { data: await this.dosageFormsService.create(payload) };
    }
    async replace(dosageFormId, payload) {
        return { data: await this.dosageFormsService.update(dosageFormId, payload) };
    }
    async patch(dosageFormId, payload) {
        return { data: await this.dosageFormsService.update(dosageFormId, payload) };
    }
    async remove(dosageFormId) {
        await this.dosageFormsService.remove(dosageFormId);
    }
};
exports.DosageFormsController = DosageFormsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dosage_forms_dto_1.ListDosageFormsDto]),
    __metadata("design:returntype", Promise)
], DosageFormsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':dosageFormId'),
    __param(0, (0, common_1.Param)('dosageFormId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DosageFormsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dosage_forms_dto_1.CreateDosageFormDto]),
    __metadata("design:returntype", Promise)
], DosageFormsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':dosageFormId'),
    __param(0, (0, common_1.Param)('dosageFormId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dosage_forms_dto_1.UpdateDosageFormDto]),
    __metadata("design:returntype", Promise)
], DosageFormsController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)(':dosageFormId'),
    __param(0, (0, common_1.Param)('dosageFormId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dosage_forms_dto_1.UpdateDosageFormDto]),
    __metadata("design:returntype", Promise)
], DosageFormsController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':dosageFormId'),
    __param(0, (0, common_1.Param)('dosageFormId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DosageFormsController.prototype, "remove", null);
exports.DosageFormsController = DosageFormsController = __decorate([
    (0, swagger_1.ApiTags)('dosage-forms'),
    (0, common_1.Controller)('v1/dosage-forms'),
    __metadata("design:paramtypes", [dosage_forms_service_1.DosageFormsService])
], DosageFormsController);
//# sourceMappingURL=dosage-forms.controller.js.map