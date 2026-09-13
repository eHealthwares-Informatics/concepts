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
function toPharmaceuticsType(e) {
    return {
        id: e.id,
        code: e.code,
        clinicalName: e.clinicalName,
        brandNames: e.brandNames,
        drugClass: e.drugClass,
        bodySystem: e.bodySystem,
        formulations: e.formulations,
        chemicalConstituents: e.chemicalConstituents,
        pharmacology: e.pharmacology,
        commonGenericName: e.commonGenericName,
        indications: e.indications,
        contraindications: e.contraindications,
        precautions: e.precautions,
        warnings: e.warnings,
        mechanismOfAction: e.mechanismOfAction,
        adverseEffects: e.adverseEffects,
        drugInteractions: e.drugInteractions,
        ivIncompatibilities: e.ivIncompatibilities,
        foodInteractions: e.foodInteractions,
        traditionalMedicineEffects: e.traditionalMedicineEffects,
        dosage: e.dosage,
        dosePerAgeRange: e.dosePerAgeRange,
        dosePerWeightRange: e.dosePerWeightRange,
        missedDose: e.missedDose,
        bodyWeightAndAge: e.bodyWeightAndAge,
        physiologicalVariables: e.physiologicalVariables,
        pharmacokineticVariables: e.pharmacokineticVariables,
        diseaseVariables: e.diseaseVariables,
        environmentalVariables: e.environmentalVariables,
        extremesOfAge: e.extremesOfAge,
        intercurrentIllness: e.intercurrentIllness,
        adherenceInfo: e.adherenceInfo,
        prescriptionReasons: e.prescriptionReasons,
        recommendations: e.recommendations,
        generalDrugUse: e.generalDrugUse,
        patientCounseling: e.patientCounseling,
        nursingConsiderations: e.nursingConsiderations,
        recommendedLabel: e.recommendedLabel,
        isControlledSubstance: e.isControlledSubstance,
        pregnancyEffects: e.pregnancyEffects,
        breastfeedingEffects: e.breastfeedingEffects,
        interactiveEffects: e.interactiveEffects,
        renalImpairment: e.renalImpairment,
        hepaticImpairment: e.hepaticImpairment,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
    };
}
function toGenericProductType(entity) {
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        therapeuticClass: entity.therapeuticClass,
        pharmaceuticalClass: entity.pharmaceuticalClass,
        dosageForm: entity.dosageForm,
        strength: entity.strength,
        generalUse: entity.generalUse,
        adultDosage: entity.adultDosage,
        pediatricDosage: entity.pediatricDosage,
        appendixDosages: entity.appendixDosages,
        emdexCode: entity.emdexCode,
        isPrescriptionRequired: entity.isPrescriptionRequired,
        isControlledSubstance: entity.isControlledSubstance,
        pharmaceutics: toPharmaceuticsType(entity.pharmaceutics),
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
        deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
    };
}
let GenericProductsService = class GenericProductsService {
    genericProductRepository;
    pharmaceuticsRepository;
    constructor(genericProductRepository, pharmaceuticsRepository) {
        this.genericProductRepository = genericProductRepository;
        this.pharmaceuticsRepository = pharmaceuticsRepository;
    }
    async list(query) {
        const qb = this.genericProductRepository
            .createQueryBuilder('gp')
            .leftJoinAndSelect('gp.pharmaceutics', 'p')
            .where('gp.deleted_at IS NULL')
            .orderBy(`gp.${query.sortBy ?? 'name'}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
            .skip(query.offset)
            .take(query.limit);
        if (query.search) {
            qb.andWhere('(gp.code ILIKE :s OR gp.name ILIKE :s OR gp.emdex_code ILIKE :s)', {
                s: `%${query.search}%`,
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
            throw new common_1.BadRequestException('Pharmaceutics not found');
        const entity = this.genericProductRepository.create({
            code: payload.code,
            name: payload.name,
            therapeuticClass: payload.therapeuticClass ?? null,
            pharmaceuticalClass: payload.pharmaceuticalClass ?? null,
            dosageForm: payload.dosageForm ?? null,
            strength: payload.strength ?? null,
            generalUse: payload.generalUse ?? '',
            adultDosage: payload.adultDosage ?? '',
            pediatricDosage: payload.pediatricDosage ?? '',
            appendixDosages: payload.appendixDosages ?? null,
            emdexCode: payload.emdexCode ?? null,
            isPrescriptionRequired: payload.isPrescriptionRequired ?? false,
            isControlledSubstance: payload.isControlledSubstance ?? false,
            pharmaceutics,
        });
        const saved = await this.genericProductRepository.save(entity);
        const full = await this.genericProductRepository.findOneOrFail({
            where: { id: saved.id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { pharmaceutics: true },
        });
        return toGenericProductType(full);
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
                throw new common_1.BadRequestException('Pharmaceutics not found');
            item.pharmaceutics = pharmaceutics;
        }
        if (payload.name !== undefined)
            item.name = payload.name;
        if (payload.therapeuticClass !== undefined)
            item.therapeuticClass = payload.therapeuticClass ?? null;
        if (payload.pharmaceuticalClass !== undefined)
            item.pharmaceuticalClass = payload.pharmaceuticalClass ?? null;
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
        if (payload.appendixDosages !== undefined)
            item.appendixDosages = payload.appendixDosages ?? null;
        if (payload.emdexCode !== undefined)
            item.emdexCode = payload.emdexCode ?? null;
        if (payload.isPrescriptionRequired !== undefined)
            item.isPrescriptionRequired = payload.isPrescriptionRequired;
        if (payload.isControlledSubstance !== undefined)
            item.isControlledSubstance = payload.isControlledSubstance;
        const saved = await this.genericProductRepository.save(item);
        const full = await this.genericProductRepository.findOneOrFail({
            where: { id: saved.id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { pharmaceutics: true },
        });
        return toGenericProductType(full);
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