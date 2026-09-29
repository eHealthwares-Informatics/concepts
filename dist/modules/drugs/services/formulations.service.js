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
exports.FormulationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const toFormulationType = (entity) => ({
    id: entity.id,
    code: entity.code,
    name: entity.name,
    description: entity.description,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});
let FormulationsService = class FormulationsService {
    formulationRepository;
    constructor(formulationRepository) {
        this.formulationRepository = formulationRepository;
    }
    async list(query) {
        const qb = this.formulationRepository
            .createQueryBuilder('formulation')
            .where('formulation.deleted_at IS NULL')
            .orderBy('formulation.name', 'ASC')
            .skip(query.offset)
            .take(query.limit);
        if (query.search) {
            qb.andWhere('formulation.name ILIKE :search', { search: `%${query.search}%` });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data: data.map(toFormulationType), total };
    }
    async get(id) {
        const item = await this.formulationRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!item)
            throw new common_1.NotFoundException('Formulation not found');
        return toFormulationType(item);
    }
    async create(payload) {
        const duplicate = await this.formulationRepository.findOne({
            where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (duplicate)
            throw new common_1.BadRequestException('Formulation code already exists');
        const entity = this.formulationRepository.create({
            code: payload.code,
            name: payload.name,
            description: payload.description ?? null,
        });
        const saved = await this.formulationRepository.save(entity);
        return toFormulationType(saved);
    }
    async update(id, payload) {
        const item = await this.formulationRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!item)
            throw new common_1.NotFoundException('Formulation not found');
        if (payload.code && payload.code !== item.code) {
            const duplicate = await this.formulationRepository.findOne({
                where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (duplicate)
                throw new common_1.BadRequestException('Formulation code already exists');
            item.code = payload.code;
        }
        if (payload.name !== undefined)
            item.name = payload.name;
        if (payload.description !== undefined)
            item.description = payload.description;
        const saved = await this.formulationRepository.save(item);
        return toFormulationType(saved);
    }
    async remove(id) {
        const result = await this.formulationRepository.softDelete({ id });
        if (!result.affected)
            throw new common_1.NotFoundException('Formulation not found');
    }
};
exports.FormulationsService = FormulationsService;
exports.FormulationsService = FormulationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.FormulationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FormulationsService);
//# sourceMappingURL=formulations.service.js.map