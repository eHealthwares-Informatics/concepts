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
exports.PharmaceuticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const toPharmaceuticsType = (entity) => ({
    id: entity.id,
    code: entity.code,
    commonBrandName: entity.commonBrandName,
    commonGenericName: entity.commonGenericName,
    clinicalName: entity.clinicalName,
    drugClass: entity.drugClass,
    chemicalConstituents: entity.chemicalConstituents,
    pharmaceutics: entity.pharmaceutics,
    indications: entity.indications,
    contraindications: entity.contraindications,
    mechanism: entity.mechanism,
    missedDose: entity.missedDose,
    drugInteractions: entity.drugInteractions,
    dosage: entity.dosage,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});
let PharmaceuticsService = class PharmaceuticsService {
    pharmaceuticsRepository;
    drugComponentRepository;
    constructor(pharmaceuticsRepository, drugComponentRepository) {
        this.pharmaceuticsRepository = pharmaceuticsRepository;
        this.drugComponentRepository = drugComponentRepository;
    }
    async list(query) {
        const qb = this.pharmaceuticsRepository
            .createQueryBuilder('pharmaceutics')
            .leftJoinAndSelect('pharmaceutics.drugComponents', 'drugComponents')
            .where('pharmaceutics.deleted_at IS NULL')
            .skip(query.offset)
            .take(query.limit);
        if (query.search) {
            qb.andWhere('(pharmaceutics.code ILIKE :search OR pharmaceutics.clinical_name ILIKE :search OR pharmaceutics.common_generic_name ILIKE :search)', { search: `%${query.search}%` });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data: data.map(toPharmaceuticsType), total };
    }
    async get(id) {
        const item = await this.pharmaceuticsRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { drugComponents: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Pharmaceutics not found');
        return toPharmaceuticsType(item);
    }
    async getByCode(code) {
        const item = await this.pharmaceuticsRepository.findOne({
            where: { code, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { drugComponents: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Pharmaceutics not found');
        return toPharmaceuticsType(item);
    }
    async create(payload) {
        const duplicate = await this.pharmaceuticsRepository.findOne({
            where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (duplicate)
            throw new common_1.BadRequestException('Pharmaceutics code already exists');
        const drugComponents = await this.resolveDrugComponents(payload.drugComponentIds);
        const entity = this.pharmaceuticsRepository.create({
            code: payload.code,
            commonBrandName: payload.commonBrandName ?? null,
            commonGenericName: payload.commonGenericName ?? null,
            clinicalName: payload.clinicalName ?? null,
            drugClass: payload.drugClass ?? null,
            chemicalConstituents: payload.chemicalConstituents ?? null,
            pharmaceutics: payload.pharmaceutics ?? null,
            indications: payload.indications ?? null,
            contraindications: payload.contraindications ?? null,
            mechanism: payload.mechanism ?? null,
            missedDose: payload.missedDose ?? null,
            drugInteractions: payload.drugInteractions ?? null,
            dosage: payload.dosage ?? null,
            drugComponents,
        });
        const saved = await this.pharmaceuticsRepository.save(entity);
        const full = await this.pharmaceuticsRepository.findOneOrFail({
            where: { id: saved.id },
            relations: { drugComponents: true },
        });
        return toPharmaceuticsType(full);
    }
    async update(id, payload) {
        const item = await this.pharmaceuticsRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { drugComponents: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Pharmaceutics not found');
        if (payload.code && payload.code !== item.code) {
            const duplicate = await this.pharmaceuticsRepository.findOne({
                where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (duplicate)
                throw new common_1.BadRequestException('Pharmaceutics code already exists');
            item.code = payload.code;
        }
        if (payload.commonBrandName !== undefined)
            item.commonBrandName = payload.commonBrandName ?? null;
        if (payload.commonGenericName !== undefined)
            item.commonGenericName = payload.commonGenericName ?? null;
        if (payload.clinicalName !== undefined)
            item.clinicalName = payload.clinicalName ?? null;
        if (payload.drugClass !== undefined)
            item.drugClass = payload.drugClass ?? null;
        if (payload.chemicalConstituents !== undefined)
            item.chemicalConstituents = payload.chemicalConstituents ?? null;
        if (payload.pharmaceutics !== undefined)
            item.pharmaceutics = payload.pharmaceutics ?? null;
        if (payload.indications !== undefined)
            item.indications = payload.indications ?? null;
        if (payload.contraindications !== undefined)
            item.contraindications = payload.contraindications ?? null;
        if (payload.mechanism !== undefined)
            item.mechanism = payload.mechanism ?? null;
        if (payload.missedDose !== undefined)
            item.missedDose = payload.missedDose ?? null;
        if (payload.drugInteractions !== undefined)
            item.drugInteractions = payload.drugInteractions ?? null;
        if (payload.dosage !== undefined)
            item.dosage = payload.dosage ?? null;
        if (payload.drugComponentIds !== undefined) {
            item.drugComponents = await this.resolveDrugComponents(payload.drugComponentIds);
        }
        const saved = await this.pharmaceuticsRepository.save(item);
        const full = await this.pharmaceuticsRepository.findOneOrFail({
            where: { id: saved.id },
            relations: { drugComponents: true },
        });
        return toPharmaceuticsType(full);
    }
    async remove(id) {
        const result = await this.pharmaceuticsRepository.softDelete({ id });
        if (!result.affected)
            throw new common_1.NotFoundException('Pharmaceutics not found');
    }
    async resolveDrugComponents(ids) {
        if (!ids?.length)
            return [];
        const components = await this.drugComponentRepository.find({
            where: { id: (0, typeorm_2.In)(ids), deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (components.length !== ids.length)
            throw new common_1.BadRequestException('One or more drug components were not found');
        return components;
    }
};
exports.PharmaceuticsService = PharmaceuticsService;
exports.PharmaceuticsService = PharmaceuticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.PharmaceuticsEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.DrugComponentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PharmaceuticsService);
//# sourceMappingURL=pharmaceutics.service.js.map