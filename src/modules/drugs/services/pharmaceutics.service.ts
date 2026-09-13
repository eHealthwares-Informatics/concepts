import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import type { PharmaceuticsType } from '../types/drugs.types';
import { CreatePharmaceuticsDto, ListPharmaceuticsDto, UpdatePharmaceuticsDto } from '../dto/pharmaceutics.dto';
import { DrugComponentEntity, PharmaceuticsEntity } from '../entities';

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

@Injectable()
export class PharmaceuticsService {
  constructor(
    @InjectRepository(PharmaceuticsEntity)
    private readonly pharmaceuticsRepository: Repository<PharmaceuticsEntity>,
    @InjectRepository(DrugComponentEntity)
    private readonly drugComponentRepository: Repository<DrugComponentEntity>,
  ) {}

  async list(query: ListPharmaceuticsDto): Promise<{ data: PharmaceuticsType[]; total: number }> {
    const qb = this.pharmaceuticsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.drugComponents', 'dc')
      .where('p.deleted_at IS NULL')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere(
        '(p.code ILIKE :s OR p.clinical_name ILIKE :s OR p.common_generic_name ILIKE :s OR p.brand_names ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toPharmaceuticsType), total };
  }

  async get(id: string): Promise<PharmaceuticsType> {
    const item = await this.pharmaceuticsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { drugComponents: true },
    });
    if (!item) throw new NotFoundException('Pharmaceutics not found');
    return toPharmaceuticsType(item);
  }

  async getByCode(code: string): Promise<PharmaceuticsType> {
    const item = await this.pharmaceuticsRepository.findOne({
      where: { code, deletedAt: IsNull() },
      relations: { drugComponents: true },
    });
    if (!item) throw new NotFoundException('Pharmaceutics not found');
    return toPharmaceuticsType(item);
  }

  async create(payload: CreatePharmaceuticsDto): Promise<PharmaceuticsType> {
    const duplicate = await this.pharmaceuticsRepository.findOne({
      where: { code: payload.code, deletedAt: IsNull() },
    });
    if (duplicate) throw new BadRequestException('Pharmaceutics code already exists');

    const drugComponents = await this.resolveDrugComponents(payload.drugComponentIds);
    const entity = this.pharmaceuticsRepository.create({
      code: payload.code,
      clinicalName: payload.clinicalName ?? null,
      brandNames: payload.brandNames ?? null,
      drugClass: payload.drugClass ?? null,
      bodySystem: payload.bodySystem ?? null,
      formulations: payload.formulations ?? null,
      chemicalConstituents: payload.chemicalConstituents ?? null,
      pharmacology: payload.pharmacology ?? null,
      commonGenericName: payload.commonGenericName ?? null,
      indications: payload.indications ?? null,
      contraindications: payload.contraindications ?? null,
      precautions: payload.precautions ?? null,
      warnings: payload.warnings ?? null,
      mechanismOfAction: payload.mechanismOfAction ?? null,
      adverseEffects: payload.adverseEffects ?? null,
      drugInteractions: payload.drugInteractions ?? null,
      ivIncompatibilities: payload.ivIncompatibilities ?? null,
      foodInteractions: payload.foodInteractions ?? null,
      traditionalMedicineEffects: payload.traditionalMedicineEffects ?? null,
      dosage: payload.dosage ?? null,
      dosePerAgeRange: payload.dosePerAgeRange ?? null,
      dosePerWeightRange: payload.dosePerWeightRange ?? null,
      missedDose: payload.missedDose ?? null,
      bodyWeightAndAge: payload.bodyWeightAndAge ?? null,
      physiologicalVariables: payload.physiologicalVariables ?? null,
      pharmacokineticVariables: payload.pharmacokineticVariables ?? null,
      diseaseVariables: payload.diseaseVariables ?? null,
      environmentalVariables: payload.environmentalVariables ?? null,
      extremesOfAge: payload.extremesOfAge ?? null,
      intercurrentIllness: payload.intercurrentIllness ?? null,
      adherenceInfo: payload.adherenceInfo ?? null,
      prescriptionReasons: payload.prescriptionReasons ?? null,
      recommendations: payload.recommendations ?? null,
      generalDrugUse: payload.generalDrugUse ?? null,
      patientCounseling: payload.patientCounseling ?? null,
      nursingConsiderations: payload.nursingConsiderations ?? null,
      recommendedLabel: payload.recommendedLabel ?? null,
      isControlledSubstance: payload.isControlledSubstance ?? false,
      pregnancyEffects: payload.pregnancyEffects ?? null,
      breastfeedingEffects: payload.breastfeedingEffects ?? null,
      interactiveEffects: payload.interactiveEffects ?? null,
      renalImpairment: payload.renalImpairment ?? null,
      hepaticImpairment: payload.hepaticImpairment ?? null,
      drugComponents,
    });
    const saved = await this.pharmaceuticsRepository.save(entity);
    const full = await this.pharmaceuticsRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { drugComponents: true },
    });
    return toPharmaceuticsType(full);
  }

  async update(id: string, payload: UpdatePharmaceuticsDto): Promise<PharmaceuticsType> {
    const item = await this.pharmaceuticsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { drugComponents: true },
    });
    if (!item) throw new NotFoundException('Pharmaceutics not found');

    if (payload.code && payload.code !== item.code) {
      const duplicate = await this.pharmaceuticsRepository.findOne({
        where: { code: payload.code, deletedAt: IsNull() },
      });
      if (duplicate) throw new BadRequestException('Pharmaceutics code already exists');
      item.code = payload.code;
    }

    // Update all nullable fields
    const nullableFields = [
      'clinicalName', 'brandNames', 'drugClass', 'bodySystem', 'formulations',
      'chemicalConstituents', 'pharmacology', 'commonGenericName',
      'indications', 'contraindications', 'precautions', 'warnings',
      'mechanismOfAction', 'adverseEffects', 'drugInteractions',
      'ivIncompatibilities', 'foodInteractions', 'traditionalMedicineEffects',
      'dosage', 'dosePerAgeRange', 'dosePerWeightRange', 'missedDose',
      'bodyWeightAndAge', 'physiologicalVariables', 'pharmacokineticVariables',
      'diseaseVariables', 'environmentalVariables', 'extremesOfAge', 'intercurrentIllness',
      'adherenceInfo', 'prescriptionReasons', 'recommendations', 'generalDrugUse',
      'patientCounseling', 'nursingConsiderations', 'recommendedLabel',
      'pregnancyEffects', 'breastfeedingEffects', 'interactiveEffects',
      'renalImpairment', 'hepaticImpairment',
    ] as const;

    for (const field of nullableFields) {
      if (payload[field] !== undefined) {
        (item as any)[field] = payload[field] ?? null;
      }
    }

    if (payload.isControlledSubstance !== undefined) {
      item.isControlledSubstance = payload.isControlledSubstance;
    }

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

  async remove(id: string): Promise<void> {
    const result = await this.pharmaceuticsRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Pharmaceutics not found');
  }

  private async resolveDrugComponents(ids: string[] | undefined): Promise<DrugComponentEntity[]> {
    if (!ids?.length) return [];
    const components = await this.drugComponentRepository.find({
      where: { id: In(ids), deletedAt: IsNull() },
    });
    if (components.length !== ids.length) throw new BadRequestException('One or more drug components were not found');
    return components;
  }
}
