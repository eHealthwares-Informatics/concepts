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
exports.DosageFormsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const toDosageFormType = (entity) => ({
    id: entity.id,
    code: entity.code,
    name: entity.name,
    description: entity.description,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});
let DosageFormsService = class DosageFormsService {
    dosageFormRepository;
    constructor(dosageFormRepository) {
        this.dosageFormRepository = dosageFormRepository;
    }
    async list(query) {
        const qb = this.dosageFormRepository
            .createQueryBuilder('dosage_form')
            .where('dosage_form.deleted_at IS NULL')
            .orderBy('dosage_form.name', 'ASC')
            .skip(query.offset)
            .take(query.limit);
        if (query.search) {
            qb.andWhere('dosage_form.name ILIKE :search', { search: `%${query.search}%` });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data: data.map(toDosageFormType), total };
    }
    async get(id) {
        const item = await this.dosageFormRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!item)
            throw new common_1.NotFoundException('Dosage form not found');
        return toDosageFormType(item);
    }
    async create(payload) {
        const duplicate = await this.dosageFormRepository.findOne({
            where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (duplicate)
            throw new common_1.BadRequestException('Dosage form code already exists');
        const entity = this.dosageFormRepository.create({
            code: payload.code,
            name: payload.name,
            description: payload.description ?? null,
        });
        const saved = await this.dosageFormRepository.save(entity);
        return toDosageFormType(saved);
    }
    async update(id, payload) {
        const item = await this.dosageFormRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!item)
            throw new common_1.NotFoundException('Dosage form not found');
        if (payload.code && payload.code !== item.code) {
            const duplicate = await this.dosageFormRepository.findOne({
                where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (duplicate)
                throw new common_1.BadRequestException('Dosage form code already exists');
            item.code = payload.code;
        }
        if (payload.name !== undefined)
            item.name = payload.name;
        if (payload.description !== undefined)
            item.description = payload.description;
        const saved = await this.dosageFormRepository.save(item);
        return toDosageFormType(saved);
    }
    async remove(id) {
        const result = await this.dosageFormRepository.softDelete({ id });
        if (!result.affected)
            throw new common_1.NotFoundException('Dosage form not found');
    }
};
exports.DosageFormsService = DosageFormsService;
exports.DosageFormsService = DosageFormsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.DosageFormEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DosageFormsService);
//# sourceMappingURL=dosage-forms.service.js.map