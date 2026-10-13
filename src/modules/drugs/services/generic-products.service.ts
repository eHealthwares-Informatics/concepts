import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import type { DrugClassificationType, GenericDrugType, GenericProductType } from '../types/drugs.types';
import { CreateGenericProductDto, ListGenericProductsDto, UpdateGenericProductDto } from '../dto/generic-products.dto';
import { DrugClassificationEntity, GenericDrugEntity, GenericProductEntity, PharmaceuticsEntity } from '../entities';
import { PharmaceuticsType } from '../types/drugs.types';

function toDrugClassificationType(c: { id: string; code: string; type: string; name: string }): DrugClassificationType {
  return { id: c.id, code: c.code, type: c.type, name: c.name };
}

function toPharmaceuticsType(e: PharmaceuticsEntity): PharmaceuticsType {
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
    appendixDosages: e.appendixDosages,
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

function toGenericDrugType(entity: GenericDrugEntity | null): GenericDrugType | null {
  if (!entity) return null;
  const classifications = entity.classifications ?? [];
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    genericClass: classifications.find((c) => c.type === 'ndf')?.name ?? null,
    pharmaceuticalClass: classifications.find((c) => c.type === 'emdex_pharmaceutical')?.name ?? null,
    emdexCode: entity.emdexCode,
    source: entity.source,
    classifications: classifications.map(toDrugClassificationType),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
  };
}

function toGenericProductType(entity: GenericProductEntity): GenericProductType {
  const genericClassifications = entity.genericDrug?.classifications ?? [];
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    therapeuticClass: genericClassifications.find((c) => c.type === 'ndf')?.name ?? null,
    pharmaceuticalClass: genericClassifications.find((c) => c.type === 'emdex_pharmaceutical')?.name ?? null,
    dosageForm: entity.dosageForm,
    strength: entity.strength,
    uomCode: entity.uomCode,
    // Legacy API fields are projections from the linked monograph. They are
    // not duplicated on the generic product row.
    generalUse: entity.pharmaceutics?.generalDrugUse ?? null,
    adultDosage: entity.pharmaceutics?.dosage ?? null,
    pediatricDosage: [entity.pharmaceutics?.dosePerAgeRange, entity.pharmaceutics?.dosePerWeightRange]
      .filter(Boolean)
      .join('\n') || null,
    appendixDosages: entity.pharmaceutics?.appendixDosages ?? null,
    emdexCode: entity.emdexCode,
    atcCode: entity.atcCode,
    ndfGenericCode: entity.ndfGenericCode,
    genericDrug: toGenericDrugType(entity.genericDrug ?? null),
    classifications: (entity.classifications ?? []).map(toDrugClassificationType),
    classificationIds: (entity.classifications ?? []).map((classification) => classification.id),
    isPrescriptionRequired: entity.isPrescriptionRequired,
    isControlledSubstance: entity.pharmaceutics?.isControlledSubstance ?? false,
    pharmaceutics: entity.pharmaceutics ? toPharmaceuticsType(entity.pharmaceutics) : null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
  };
}

@Injectable()
export class GenericProductsService {
  constructor(
    @InjectRepository(GenericProductEntity)
    private readonly genericProductRepository: Repository<GenericProductEntity>,
    @InjectRepository(PharmaceuticsEntity)
    private readonly pharmaceuticsRepository: Repository<PharmaceuticsEntity>,
    @InjectRepository(GenericDrugEntity)
    private readonly genericDrugRepository: Repository<GenericDrugEntity>,
    @InjectRepository(DrugClassificationEntity)
    private readonly classificationRepository: Repository<DrugClassificationEntity>,
  ) {}

  async list(query: ListGenericProductsDto): Promise<{ data: GenericProductType[]; total: number }> {
    const qb = this.genericProductRepository
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.pharmaceutics', 'p')
      .leftJoinAndSelect('gp.genericDrug', 'gd')
      .where('gp.deleted_at IS NULL')
      .orderBy(`gp.${query.sortBy ?? 'name'}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('(gp.code ILIKE :s OR gp.name ILIKE :s OR gp.emdex_code ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }
    if (query.genericDrugCode) {
      qb.andWhere('gd.code = :gn', { gn: query.genericDrugCode });
    }

    const [data, total] = await qb.getManyAndCount();
    await this.hydrate(data);
    return { data: data.map(toGenericProductType), total };
  }

  async get(id: string): Promise<GenericProductType> {
    const item = await this.genericProductRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { pharmaceutics: true, genericDrug: true, classifications: true },
    });
    if (!item) throw new NotFoundException('Generic product not found');
    await this.hydrateDrugs([item]);
    return toGenericProductType(item);
  }

  async getByCode(code: string): Promise<GenericProductType> {
    const item = await this.genericProductRepository.findOne({
      where: { code, deletedAt: IsNull() },
      relations: { pharmaceutics: true, genericDrug: true, classifications: true },
    });
    if (!item) throw new NotFoundException('Generic product not found');
    await this.hydrateDrugs([item]);
    return toGenericProductType(item);
  }

  async create(payload: CreateGenericProductDto): Promise<GenericProductType> {
    const duplicate = await this.genericProductRepository.findOne({
      where: { code: payload.code, deletedAt: IsNull() },
    });
    if (duplicate) throw new BadRequestException('Generic product code already exists');

    const pharmaceutics = await this.pharmaceuticsRepository.findOne({
      where: { id: payload.pharmaceuticsId, deletedAt: IsNull() },
    });
    if (!pharmaceutics) throw new BadRequestException('Pharmaceutics not found');

    const classifications = await this.resolveClassifications(payload.classificationCodes, payload.classificationIds);

    const entity = this.genericProductRepository.create({
      code: payload.code,
      name: payload.name,
      dosageForm: payload.dosageForm ?? null,
      strength: payload.strength ?? null,
      uomCode: payload.uomCode ?? null,
      emdexCode: payload.emdexCode ?? null,
      isPrescriptionRequired: payload.isPrescriptionRequired ?? false,
      pharmaceutics,
      classifications,
    });
    const saved = await this.genericProductRepository.save(entity);
    const full = await this.genericProductRepository.findOneOrFail({
      where: { id: saved.id, deletedAt: IsNull() },
      relations: { pharmaceutics: true, classifications: true, genericDrug: true },
    });
    await this.hydrateDrugs([full]);
    return toGenericProductType(full);
  }

  async update(id: string, payload: UpdateGenericProductDto): Promise<GenericProductType> {
    const item = await this.genericProductRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
    if (!item) throw new NotFoundException('Generic product not found');

    if (payload.code && payload.code !== item.code) {
      const duplicate = await this.genericProductRepository.findOne({
        where: { code: payload.code, deletedAt: IsNull() },
      });
      if (duplicate) throw new BadRequestException('Generic product code already exists');
      item.code = payload.code;
    }

    if (payload.pharmaceuticsId) {
      const pharmaceutics = await this.pharmaceuticsRepository.findOne({
        where: { id: payload.pharmaceuticsId, deletedAt: IsNull() },
      });
      if (!pharmaceutics) throw new BadRequestException('Pharmaceutics not found');
      item.pharmaceutics = pharmaceutics;
    }

    if (payload.classificationCodes !== undefined || payload.classificationIds !== undefined) {
      item.classifications = await this.resolveClassifications(payload.classificationCodes, payload.classificationIds);
    }

    if (payload.name !== undefined) item.name = payload.name;
    if (payload.dosageForm !== undefined) item.dosageForm = payload.dosageForm ?? null;
    if (payload.strength !== undefined) item.strength = payload.strength ?? null;
    if (payload.uomCode !== undefined) item.uomCode = payload.uomCode ?? null;
    if (payload.emdexCode !== undefined) item.emdexCode = payload.emdexCode ?? null;
    if (payload.isPrescriptionRequired !== undefined) item.isPrescriptionRequired = payload.isPrescriptionRequired;

    const saved = await this.genericProductRepository.save(item);
    const full = await this.genericProductRepository.findOneOrFail({
      where: { id: saved.id, deletedAt: IsNull() },
      relations: { pharmaceutics: true, classifications: true, genericDrug: true },
    });
    await this.hydrateDrugs([full]);
    return toGenericProductType(full);
  }

  async remove(id: string): Promise<void> {
    const result = await this.genericProductRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Generic product not found');
  }

  async searchAll(): Promise<GenericProductType[]> {
    const items = await this.genericProductRepository.find({
      where: { deletedAt: IsNull() },
      relations: { pharmaceutics: true, classifications: true, genericDrug: { classifications: true } },
    });
    return items.map(toGenericProductType);
  }

  private async hydrate(products: GenericProductEntity[]): Promise<void> {
    if (!products.length) return;
    const ids = products.map((p) => p.id);
    const rows = await this.genericProductRepository
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.classifications', 'c')
      .where('gp.id IN (:...ids)', { ids })
      .getMany();
    const byId = new Map(rows.map((r) => [r.id, r.classifications ?? []]));
    for (const p of products) p.classifications = byId.get(p.id) ?? [];
    await this.hydrateDrugs(products);
  }

  private async resolveClassifications(codes?: string[], ids?: string[]): Promise<DrugClassificationEntity[]> {
    if (ids !== undefined) {
      const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
      if (!uniqueIds.length) return [];
      const rows = await this.classificationRepository.find({
        where: { id: In(uniqueIds), deletedAt: IsNull() },
      });
      if (rows.length !== uniqueIds.length) {
        const found = new Set(rows.map((row) => row.id));
        const missing = uniqueIds.filter((id) => !found.has(id));
        throw new BadRequestException(`Unknown classification IDs: ${missing.join(', ')}`);
      }
      return rows;
    }
    if (!codes?.length) return [];
    const uniqueCodes = [...new Set(codes.map((code) => code.trim()).filter(Boolean))];
    if (!uniqueCodes.length) return [];
    const rows = await this.classificationRepository.find({
      where: { code: In(uniqueCodes), deletedAt: IsNull() },
    });
    if (rows.length !== uniqueCodes.length) {
      const found = new Set(rows.map((row) => row.code));
      const missing = uniqueCodes.filter((code) => !found.has(code));
      throw new BadRequestException(`Unknown classification codes: ${missing.join(', ')}`);
    }
    return rows;
  }

  private async hydrateDrugs(products: GenericProductEntity[]): Promise<void> {
    const drugIds = [...new Set(products.map((p) => p.genericDrug?.id).filter(Boolean))] as string[];
    if (!drugIds.length) return;
    const rows = await this.genericDrugRepository
      .createQueryBuilder('gd')
      .leftJoinAndSelect('gd.classifications', 'c')
      .where('gd.id IN (:...ids)', { ids: drugIds })
      .getMany();
    const byId = new Map(rows.map((r) => [r.id, r.classifications ?? []]));
    for (const p of products) {
      if (p.genericDrug) p.genericDrug.classifications = byId.get(p.genericDrug.id) ?? [];
    }
  }
}
