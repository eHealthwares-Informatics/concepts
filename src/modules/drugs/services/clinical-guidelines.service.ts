import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, In, Repository } from 'typeorm';
import { ClinicalGuidelineEntity, GuidelineDrugLineEntity } from '../entities';

export interface GuidelineDto {
  id: string;
  slug: string;
  conditionName: string;
  guidelineSource: string;
  introduction: string | null;
  clinicalFeatures: Array<{ type: string; features: string[] }> | null;
  differentialDiagnoses: string[];
  complications: string[];
  investigations: string[];
  prevention: string[];
  treatment: {
    goals?: string[];
    non_drug?: string[];
    drug?: string[];
    adverse_reactions_and_cautions?: string[];
    supportive_measures?: string[];
  } | null;
  prognosis: string | null;
  definitiveTreatment: string | null;
}

export interface GuidelineDrugLineDto {
  id: string;
  indication: string | null;
  rawText: string;
  genericDrugId: string | null;
  genericProductId: string | null;
  regimenRole: string;
  mappingStatus: string;
  mappingNote: string | null;
}

function toDto(g: ClinicalGuidelineEntity): GuidelineDto {
  return {
    id: g.id,
    slug: g.slug,
    conditionName: g.conditionName,
    guidelineSource: g.guidelineSource,
    introduction: g.introduction,
    clinicalFeatures: g.clinicalFeatures,
    differentialDiagnoses: g.differentialDiagnoses ?? [],
    complications: g.complications ?? [],
    investigations: g.investigations ?? [],
    prevention: g.prevention ?? [],
    treatment: g.treatment,
    prognosis: g.prognosis,
    definitiveTreatment: g.definitiveTreatment,
  };
}

@Injectable()
export class ClinicalGuidelinesService {
  constructor(
    @InjectRepository(ClinicalGuidelineEntity)
    private readonly repo: Repository<ClinicalGuidelineEntity>,
    @InjectRepository(GuidelineDrugLineEntity)
    private readonly linesRepo: Repository<GuidelineDrugLineEntity>,
  ) {}

  async list(
    query: { search?: string; limit?: number; offset?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' },
  ): Promise<{ data: GuidelineDto[]; meta: { total: number } }> {
    const qb = this.repo
      .createQueryBuilder('cg')
      .where('cg.deleted_at IS NULL')
      .orderBy(`cg.${query.sortBy ?? 'condition_name'}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
      .skip(query.offset ?? 0)
      .take(Math.min(query.limit ?? 50, 200));
    if (query.search) {
      qb.andWhere('(cg.condition_name ILIKE :s OR cg.slug ILIKE :s OR cg.introduction ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }
    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toDto), meta: { total } };
  }

  async getBySlug(slug: string): Promise<GuidelineDto> {
    const item = await this.repo.findOne({ where: { slug, deletedAt: IsNull() } });
    if (!item) throw new NotFoundException('Clinical guideline not found');
    return toDto(item);
  }

  async get(id: string): Promise<GuidelineDto> {
    const item = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!item) throw new NotFoundException('Clinical guideline not found');
    return toDto(item);
  }

  /** Drug lines for one guideline — incl. referenced generic drug/product ids. */
  async drugLinesForGuideline(guidelineId: string): Promise<GuidelineDrugLineDto[]> {
    const existing = await this.repo.findOne({ where: { id: guidelineId, deletedAt: IsNull() } });
    if (!existing) throw new NotFoundException('Clinical guideline not found');
    const lines = await this.linesRepo.find({ where: { guidelineId, deletedAt: IsNull() } });
    return lines.map((l) => ({
      id: l.id,
      indication: l.indication,
      rawText: l.rawText,
      genericDrugId: l.genericDrugId,
      genericProductId: l.genericProductId,
      regimenRole: l.regimenRole,
      mappingStatus: l.mappingStatus,
      mappingNote: l.mappingNote,
    }));
  }

  /**
   * Guidelines referencing the given generic drug(s) — used by the clinical
   * recommendation flow to pick applicable protocols for a medicine match.
   */
  async guidelinesForGenericDrugs(genericDrugIds: string[]): Promise<GuidelineDto[]> {
    if (!genericDrugIds.length) return [];
    const rows = await this.repo
      .createQueryBuilder('cg')
      .innerJoin('cg.drugLines', 'line', 'line.generic_drug_id IN (:...ids)', { ids: genericDrugIds })
      .where('line.deleted_at IS NULL')
      .andWhere('cg.deleted_at IS NULL')
      .getMany();
    return [...new Map(rows.map((row) => [row.id, row])).values()].map(toDto);
  }

  /** Generic drugs linked to one guideline (id + code + name only). */
  async genericDrugsForGuideline(guidelineId: string): Promise<Array<{ id: string; code: string; name: string }>> {
    const existing = await this.repo.findOne({ where: { id: guidelineId, deletedAt: IsNull() } });
    if (!existing) throw new NotFoundException('Clinical guideline not found');

    const lines = await this.linesRepo
      .createQueryBuilder('line')
      .innerJoin('line.genericDrug', 'drug')
      .select('drug.id', 'id')
      .addSelect('drug.code', 'code')
      .addSelect('drug.name', 'name')
      .where('line.guideline_id = :guidelineId', { guidelineId })
      .andWhere('line.generic_drug_id IS NOT NULL')
      .andWhere('line.deleted_at IS NULL')
      .getRawMany<{ id: string; code: string; name: string }>();
    return [...new Map(lines.map((drug) => [drug.id, drug])).values()];
  }
}
