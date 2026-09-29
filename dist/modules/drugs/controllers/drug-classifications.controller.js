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
exports.DrugClassificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const drug_classifications_dto_1 = require("../dto/drug-classifications.dto");
const drug_classifications_service_1 = require("../services/drug-classifications.service");
let DrugClassificationsController = class DrugClassificationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async list(query) {
        const { data, total } = await this.service.list(query);
        return { data, meta: { total } };
    }
    async getByCode(code) {
        const data = await this.service.getByCode(code);
        return { data };
    }
    async relations(id) {
        return { data: await this.service.getRelations(id) };
    }
    async get(id) {
        const data = await this.service.get(id);
        return { data };
    }
};
exports.DrugClassificationsController = DrugClassificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List drug classifications (filter by type)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Paged drug classifications' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [drug_classifications_dto_1.ListDrugClassificationsDto]),
    __metadata("design:returntype", Promise)
], DrugClassificationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a drug classification by TC/PC code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrugClassificationsController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Get)(':id/relations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get generic drugs and products linked to a classification' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrugClassificationsController.prototype, "relations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a drug classification by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrugClassificationsController.prototype, "get", null);
exports.DrugClassificationsController = DrugClassificationsController = __decorate([
    (0, swagger_1.ApiTags)('drugs'),
    (0, common_1.Controller)('v1/drug-classifications'),
    __metadata("design:paramtypes", [drug_classifications_service_1.DrugClassificationsService])
], DrugClassificationsController);
//# sourceMappingURL=drug-classifications.controller.js.map