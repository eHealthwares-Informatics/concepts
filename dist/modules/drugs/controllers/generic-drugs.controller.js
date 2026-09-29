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
exports.GenericDrugsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const generic_drugs_dto_1 = require("../dto/generic-drugs.dto");
const generic_drugs_service_1 = require("../services/generic-drugs.service");
let GenericDrugsController = class GenericDrugsController {
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
    async get(id) {
        const data = await this.service.get(id);
        return { data };
    }
};
exports.GenericDrugsController = GenericDrugsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List generic drugs' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Paged generic drugs' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generic_drugs_dto_1.ListGenericDrugsDto]),
    __metadata("design:returntype", Promise)
], GenericDrugsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a generic drug by GN code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GenericDrugsController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a generic drug by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GenericDrugsController.prototype, "get", null);
exports.GenericDrugsController = GenericDrugsController = __decorate([
    (0, swagger_1.ApiTags)('drugs'),
    (0, common_1.Controller)('v1/generic-drugs'),
    __metadata("design:paramtypes", [generic_drugs_service_1.GenericDrugsService])
], GenericDrugsController);
//# sourceMappingURL=generic-drugs.controller.js.map