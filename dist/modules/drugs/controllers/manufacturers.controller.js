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
exports.ManufacturersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const manufacturers_dto_1 = require("../dto/manufacturers.dto");
const manufacturers_service_1 = require("../services/manufacturers.service");
let ManufacturersController = class ManufacturersController {
    manufacturersService;
    constructor(manufacturersService) {
        this.manufacturersService = manufacturersService;
    }
    async list(query) {
        const result = await this.manufacturersService.list(query);
        return {
            data: result.data,
            meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
        };
    }
    async get(manufacturerId) {
        return { data: await this.manufacturersService.get(manufacturerId) };
    }
    async create(payload) {
        return { data: await this.manufacturersService.create(payload) };
    }
    async replace(manufacturerId, payload) {
        return { data: await this.manufacturersService.update(manufacturerId, payload) };
    }
    async patch(manufacturerId, payload) {
        return { data: await this.manufacturersService.update(manufacturerId, payload) };
    }
    async remove(manufacturerId) {
        await this.manufacturersService.remove(manufacturerId);
    }
};
exports.ManufacturersController = ManufacturersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [manufacturers_dto_1.ListManufacturersDto]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':manufacturerId'),
    __param(0, (0, common_1.Param)('manufacturerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [manufacturers_dto_1.CreateManufacturerDto]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':manufacturerId'),
    __param(0, (0, common_1.Param)('manufacturerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manufacturers_dto_1.UpdateManufacturerDto]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)(':manufacturerId'),
    __param(0, (0, common_1.Param)('manufacturerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manufacturers_dto_1.UpdateManufacturerDto]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':manufacturerId'),
    __param(0, (0, common_1.Param)('manufacturerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "remove", null);
exports.ManufacturersController = ManufacturersController = __decorate([
    (0, swagger_1.ApiTags)('manufacturers'),
    (0, common_1.Controller)('v1/manufacturers'),
    __metadata("design:paramtypes", [manufacturers_service_1.ManufacturersService])
], ManufacturersController);
//# sourceMappingURL=manufacturers.controller.js.map