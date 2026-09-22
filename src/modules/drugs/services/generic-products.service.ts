import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { DrugClassificationType, GenericDrugType, GenericProductType } from '../types/drugs.types';
import { CreateGenericProductDto, ListGenericProductsDto, UpdateGenericProductDto } from '../dto/generic-products.dto';
import { GenericDrugEntity, GenericProductEntity, PharmaceuticsEntity } from '../entities';
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
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    genericClass: entity.genericClass,
    pharmaceuticalClass: entity.pharmaceuticalClass,
    emdexCode: entity.emdexCode,
    source: entity.source,
    classifications: (entity.classifications ?? []).map(toDrugClassificationType),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
  };
}

function toGenericProductType(entity: GenericProductEntity): GenericProductType {
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
    atcCode: entity.atcCode,
    ndfGenericCode: entity.ndfGenericCode,
    genericDrug: toGenericDrugType(entity.genericDrug ?? null),
    classifications: (entity.classifications ?? []).map(toDrugClassificationType),
    isPrescriptionRequired: entity.isPrescriptionRequired,
    isControlledSubstance: entity.isControlledSubstance,
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
      where: { id: saved.id, deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
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

    if (payload.name !== undefined) item.name = payload.name;
    if (payload.therapeuticClass !== undefined) item.therapeuticClass = payload.therapeuticClass ?? null;
    if (payload.pharmaceuticalClass !== undefined) item.pharmaceuticalClass = payload.pharmaceuticalClass ?? null;
    if (payload.dosageForm !== undefined) item.dosageForm = payload.dosageForm ?? null;
    if (payload.strength !== undefined) item.strength = payload.strength ?? null;
    if (payload.generalUse !== undefined) item.generalUse = payload.generalUse;
    if (payload.adultDosage !== undefined) item.adultDosage = payload.adultDosage;
    if (payload.pediatricDosage !== undefined) item.pediatricDosage = payload.pediatricDosage;
    if (payload.appendixDosages !== undefined) item.appendixDosages = payload.appendixDosages ?? null;
    if (payload.emdexCode !== undefined) item.emdexCode = payload.emdexCode ?? null;
    if (payload.isPrescriptionRequired !== undefined) item.isPrescriptionRequired = payload.isPrescriptionRequired;
    if (payload.isControlledSubstance !== undefined) item.isControlledSubstance = payload.isControlledSubstance;

    const saved = await this.genericProductRepository.save(item);
    const full = await this.genericProductRepository.findOneOrFail({
      where: { id: saved.id, deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
    return toGenericProductType(full);
  }

  async remove(id: string): Promise<void> {
    const result = await this.genericProductRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Generic product not found');
  }

  async searchAll(): Promise<GenericProductType[]> {
    const items = await this.genericProductRepository.find({
      where: { deletedAt: IsNull() },
      relations: { pharmaceutics: true },
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
