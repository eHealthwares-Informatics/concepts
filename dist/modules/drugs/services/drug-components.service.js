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
exports.DrugComponentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const toDrugComponentType = (entity) => ({
    id: entity.id,
    name: entity.name,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});
let DrugComponentsService = class DrugComponentsService {
    drugComponentRepository;
    constructor(drugComponentRepository) {
        this.drugComponentRepository = drugComponentRepository;
    }
    async list(query) {
        const qb = this.drugComponentRepository
            .createQueryBuilder('drug_component')
            .where('drug_component.deleted_at IS NULL')
            .orderBy('drug_component.updated_at', 'DESC')
            .skip(query.offset)
            .take(query.limit);
        if (query.search) {
            qb.andWhere('drug_component.name ILIKE :search', { search: `%${query.search}%` });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data: data.map(toDrugComponentType), total };
    }
    async get(id) {
        const item = await this.drugComponentRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!item)
            throw new common_1.NotFoundException('Drug component not found');
        return toDrugComponentType(item);
    }
    async create(payload) {
        const duplicate = await this.drugComponentRepository.findOne({
            where: { name: payload.name, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (duplicate)
            throw new common_1.BadRequestException('Drug component name already exists');
        const entity = this.drugComponentRepository.create({ name: payload.name });
        const saved = await this.drugComponentRepository.save(entity);
        return toDrugComponentType(saved);
    }
    async update(id, payload) {
        const item = await this.drugComponentRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!item)
            throw new common_1.NotFoundException('Drug component not found');
        if (payload.name && payload.name !== item.name) {
            const duplicate = await this.drugComponentRepository.findOne({
                where: { name: payload.name, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (duplicate)
                throw new common_1.BadRequestException('Drug component name already exists');
            item.name = payload.name;
        }
        const saved = await this.drugComponentRepository.save(item);
        return toDrugComponentType(saved);
    }
    async remove(id) {
        const result = await this.drugComponentRepository.softDelete({ id });
        if (!result.affected)
            throw new common_1.NotFoundException('Drug component not found');
    }
};
exports.DrugComponentsService = DrugComponentsService;
exports.DrugComponentsService = DrugComponentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.DrugComponentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DrugComponentsService);
//# sourceMappingURL=drug-components.service.js.map