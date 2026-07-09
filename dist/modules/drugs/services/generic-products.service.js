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
exports.GenericProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const toGenericProductType = (entity) => ({
    id: entity.id,
    code: entity.code,
    name: entity.name,
    therapeuticClass: entity.therapeuticClass,
    dosageForm: entity.dosageForm,
    strength: entity.strength,
    generalUse: entity.generalUse,
    adultDosage: entity.adultDosage,
    pediatricDosage: entity.pediatricDosage,
    isPrescriptionRequired: entity.isPrescriptionRequired,
    isControlledSubstance: entity.isControlledSubstance,
    pharmaceutics: {
        id: entity.pharmaceutics.id,
        code: entity.pharmaceutics.code,
        commonBrandName: entity.pharmaceutics.commonBrandName,
        commonGenericName: entity.pharmaceutics.commonGenericName,
        clinicalName: entity.pharmaceutics.clinicalName,
        drugClass: entity.pharmaceutics.drugClass,
        chemicalConstituents: entity.pharmaceutics.chemicalConstituents,
        pharmaceutics: entity.pharmaceutics.pharmaceutics,
        indications: entity.pharmaceutics.indications,
        contraindications: entity.pharmaceutics.contraindications,
        mechanism: entity.pharmaceutics.mechanism,
        missedDose: entity.pharmaceutics.missedDose,
        drugInteractions: entity.pharmaceutics.drugInteractions,
        dosage: entity.pharmaceutics.dosage,
        createdAt: entity.pharmaceutics.createdAt.toISOString(),
        updatedAt: entity.pharmaceutics.updatedAt.toISOString(),
        deletedAt: entity.pharmaceutics.deletedAt ? entity.pharmaceutics.deletedAt.toISOString() : null,
    },
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});
let GenericProductsService = class GenericProductsService {
    genericProductRepository;
    pharmaceuticsRepository;
    constructor(genericProductRepository, pharmaceuticsRepository) {
        this.genericProductRepository = genericProductRepository;
        this.pharmaceuticsRepository = pharmaceuticsRepository;
    }
    async list(query) {
        const qb = this.genericProductRepository
            .createQueryBuilder('generic_product')
            .leftJoinAndSelect('generic_product.pharmaceutics', 'pharmacology_info')
            .where('generic_product.deleted_at IS NULL')
            .orderBy(`generic_product.${query.sortBy ?? 'name'}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
            .skip(query.offset)
            .take(query.limit);
        if (query.search) {
            qb.andWhere('(generic_product.code LIKE :search OR generic_product.name LIKE :search)', {
                search: `%${query.search}%`,
            });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data: data.map(toGenericProductType), total };
    }
    async get(id) {
        const item = await this.genericProductRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { pharmaceutics: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Generic product not found');
        return toGenericProductType(item);
    }
    async getByCode(code) {
        const item = await this.genericProductRepository.findOne({
            where: { code, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { pharmaceutics: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Generic product not found');
        return toGenericProductType(item);
    }
    async create(payload) {
        const duplicate = await this.genericProductRepository.findOne({
            where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (duplicate)
            throw new common_1.BadRequestException('Generic product code already exists');
        const pharmaceutics = await this.pharmaceuticsRepository.findOne({
            where: { id: payload.pharmaceuticsId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!pharmaceutics)
            throw new common_1.BadRequestException('Pharmaceutics info not found');
        const entity = this.genericProductRepository.create({
            code: payload.code,
            name: payload.name,
            therapeuticClass: payload.therapeuticClass ?? null,
            dosageForm: payload.dosageForm ?? null,
            strength: payload.strength ?? null,
            generalUse: payload.generalUse ?? '',
            adultDosage: payload.adultDosage ?? '',
            pediatricDosage: payload.pediatricDosage ?? '',
            isPrescriptionRequired: payload.isPrescriptionRequired ?? false,
            isControlledSubstance: payload.isControlledSubstance ?? false,
            pharmaceutics,
        });
        const savedEntity = await this.genericProductRepository.save(entity);
        const fullEntity = await this.genericProductRepository.findOneOrFail({
            where: { id: savedEntity.id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { pharmaceutics: true },
        });
        return toGenericProductType(fullEntity);
    }
    async update(id, payload) {
        const item = await this.genericProductRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { pharmaceutics: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Generic product not found');
        if (payload.code && payload.code !== item.code) {
            const duplicate = await this.genericProductRepository.findOne({
                where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (duplicate)
                throw new common_1.BadRequestException('Generic product code already exists');
            item.code = payload.code;
        }
        if (payload.pharmaceuticsId) {
            const pharmaceutics = await this.pharmaceuticsRepository.findOne({
                where: { id: payload.pharmaceuticsId, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (!pharmaceutics)
                throw new common_1.BadRequestException('Pharmaceutics info not found');
            item.pharmaceutics = pharmaceutics;
        }
        if (payload.name !== undefined)
            item.name = payload.name;
        if (payload.therapeuticClass !== undefined)
            item.therapeuticClass = payload.therapeuticClass ?? null;
        if (payload.dosageForm !== undefined)
            item.dosageForm = payload.dosageForm ?? null;
        if (payload.strength !== undefined)
            item.strength = payload.strength ?? null;
        if (payload.generalUse !== undefined)
            item.generalUse = payload.generalUse;
        if (payload.adultDosage !== undefined)
            item.adultDosage = payload.adultDosage;
        if (payload.pediatricDosage !== undefined)
            item.pediatricDosage = payload.pediatricDosage;
        if (payload.isPrescriptionRequired !== undefined)
            item.isPrescriptionRequired = payload.isPrescriptionRequired;
        if (payload.isControlledSubstance !== undefined)
            item.isControlledSubstance = payload.isControlledSubstance;
        const savedItem = await this.genericProductRepository.save(item);
        const fullEntity = await this.genericProductRepository.findOneOrFail({
            where: { id: savedItem.id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { pharmaceutics: true },
        });
        return toGenericProductType(fullEntity);
    }
    async remove(id) {
        const result = await this.genericProductRepository.softDelete({ id });
        if (!result.affected)
            throw new common_1.NotFoundException('Generic product not found');
    }
    async searchAll() {
        const items = await this.genericProductRepository.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            relations: { pharmaceutics: true },
        });
        return items.map(toGenericProductType);
    }
};
exports.GenericProductsService = GenericProductsService;
exports.GenericProductsService = GenericProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.GenericProductEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.PharmaceuticsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GenericProductsService);
//# sourceMappingURL=generic-products.service.js.map