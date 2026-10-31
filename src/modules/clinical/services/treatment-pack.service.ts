import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateTreatmentPackDto,
  ListTreatmentPacksDto,
  TreatmentPackItemDto,
  UpdateTreatmentPackDto,
} from '../dto/treatment-packs.dto';
import { TreatmentPackEntity, TreatmentPackItemEntity } from '../entities';
import type { ResolvedPackType, TreatmentPackItemType, TreatmentPackType } from '../types/clinical.types';
import { TreatmentPackStatus } from '../types/clinical-triage.types';
import { ClinicalMedicationService } from './clinical-medication.service';

const toItemType = (entity: TreatmentPackItemEntity): TreatmentPackItemType => ({
  id: entity.id,
  itemType: entity.itemType,
  genericDrugId: entity.genericDrugId,
  genericDrugCode: entity.genericDrugCode,
  supportiveCareRef: entity.supportiveCareRef,
  protocolRegimenCode: entity.protocolRegimenCode,
  instructions: entity.instructions ?? {},
  sequence: entity.sequence,
  required: entity.required,
});

export const toTreatmentPackType = (entity: TreatmentPackEntity): TreatmentPackType => ({
  id: entity.id,
  code: entity.code,
  name: entity.name,
  description: entity.description,
  complaintCodes: entity.complaintCodes ?? [],
  eligibilityRules: entity.eligibilityRules ?? {},
  exclusionRules: entity.exclusionRules ?? {},
  evidence: entity.evidence ?? {},
  status: entity.status,
  version: entity.version,
  items: [...(entity.items ?? [])]
    .sort((a, b) => a.sequence - b.sequence)
    .map(toItemType),
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

/**
 * Treatment packs (§9). Pack eligibility is server-authoritative: only APPROVED
 * packs matching the requested complaint codes pass, and exclusion rules are
 * evaluated against the caller-supplied patient context. A pack existing in the
 * database never makes it recommendable.
 */
@Injectable()
export class TreatmentPackService {
  constructor(
    @InjectRepository(TreatmentPackEntity)
    private readonly repository: Repository<TreatmentPackEntity>,
    @InjectRepository(TreatmentPackItemEntity)
    private readonly items: Repository<TreatmentPackItemEntity>,
    private readonly medications: ClinicalMedicationService,
  ) {}

  async list(query: ListTreatmentPacksDto): Promise<{ data: TreatmentPackType[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('pack')
      .leftJoinAndSelect('pack.items', 'item')
      .orderBy('pack.code', 'ASC')
      .addOrderBy('item.sequence', 'ASC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('(LOWER(pack.code) LIKE LOWER(:search) OR LOWER(pack.name) LIKE LOWER(:search))', {
        search: `%${query.search}%`,
      });
    }
    if (query.status) {
      qb.andWhere('pack.status = :status', { status: query.status });
    }
    if (query.complaintCode) {
      qb.andWhere('LOWER(pack.complaint_codes) LIKE LOWER(:complaintCode)', {
        complaintCode: `%${query.complaintCode.toLowerCase()}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toTreatmentPackType), total };
  }

  async get(id: string): Promise<TreatmentPackType> {
    return toTreatmentPackType(await this.findOne(id));
  }

  async findOne(id: string): Promise<TreatmentPackEntity> {
    const item = await this.repository.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!item) throw new NotFoundException(`TreatmentPack ${id} not found`);
    return item;
  }

  async create(payload: CreateTreatmentPackDto): Promise<TreatmentPackType> {
    const code = payload.code.trim().toUpperCase();
    const duplicate = await this.repository.findOne({ where: { code } });
    if (duplicate) throw new BadRequestException(`Treatment pack ${code} already exists`);

    const entity = this.repository.create({
      code,
      name: payload.name.trim(),
      description: payload.description ?? null,
      complaintCodes: (payload.complaintCodes ?? []).map((item) => item.toUpperCase()),
      eligibilityRules: payload.eligibilityRules ?? {},
      exclusionRules: payload.exclusionRules ?? {},
      evidence: payload.evidence ?? {},
      status: payload.status ?? TreatmentPackStatus.DRAFT,
      version: 1,
    });
    const saved = await this.repository.save(entity);
    await this.replaceItems(saved, payload.items ?? []);
    return toTreatmentPackType(await this.findOne(saved.id));
  }

  /**
   * Resolve packs (§9.2): APPROVED status + complaint-code intersection +
   * exclusion rules checked against the patient context. Ordered by pack code
   * for determinism.
   */
  async resolve(
    complaintCodes: string[],
    patientContext: Record<string, any> = {},
  ): Promise<ResolvedPackType[]> {
    const requested = (complaintCodes ?? []).map((code) => code.toUpperCase());
    if (!requested.length) return [];

    const approved = await this.repository.find({
      where: { status: TreatmentPackStatus.APPROVED },
      relations: { items: true },
    });

    const excluded = (patientContext.contraindications ?? []) as string[];

    return approved
      .filter((pack) =>
        (pack.complaintCodes ?? [])
          .map((code) => code.toUpperCase())
          .some((code) => requested.includes(code)),
      )
      .filter((pack) => {
        const exclusionCodes = (pack.exclusionRules ?? {}).contraindications ?? [];
        return !(Array.isArray(exclusionCodes)
          ? exclusionCodes.some((code: string) => excluded.includes(code))
          : false);
      })
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((pack) => ({
        packId: pack.id,
        packCode: pack.code,
        name: pack.name,
        version: pack.version,
        items: [...(pack.items ?? [])].sort((a, b) => a.sequence - b.sequence).map(toItemType),
        counselling: (pack.items ?? [])
          .filter((item) => item.itemType === 'COUNSELLING')
          .map((item) => item.instructions ?? {}),
        warnings: pack.exclusionRules ?? {},
        requiresPharmacistReview: Object.keys(pack.eligibilityRules ?? {}).includes(
          'pharmacistReview',
        ),
      }));
  }

  /** Admin edit — bumps `version` (§9.3 #7). */
  async update(id: string, payload: UpdateTreatmentPackDto): Promise<TreatmentPackType> {
    const pack = await this.findOne(id);

    if (payload.code !== undefined) pack.code = payload.code.trim().toUpperCase();
    if (payload.name !== undefined) pack.name = payload.name.trim();
    if (payload.description !== undefined) pack.description = payload.description;
    if (payload.complaintCodes !== undefined) {
      pack.complaintCodes = payload.complaintCodes.map((code) => code.toUpperCase());
    }
    if (payload.eligibilityRules !== undefined) pack.eligibilityRules = payload.eligibilityRules;
    if (payload.exclusionRules !== undefined) pack.exclusionRules = payload.exclusionRules;
    if (payload.evidence !== undefined) pack.evidence = payload.evidence;
    if (payload.status !== undefined) pack.status = payload.status;
    pack.version = (pack.version ?? 1) + 1;

    await this.repository.save(pack);
    if (payload.items !== undefined) await this.replaceItems(pack, payload.items);
    return toTreatmentPackType(await this.findOne(id));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete({ id });
    if (!result.affected) throw new NotFoundException(`TreatmentPack ${id} not found`);
  }

  /**
   * Rewrites a pack's items, resolving generic references against
   * `generic_drugs` so both the FK and the GN code stay consistent.
   */
  private async replaceItems(
    pack: TreatmentPackEntity,
    items: TreatmentPackItemDto[],
  ): Promise<void> {
    const ids = items.map((item) => item.genericDrugId).filter((id): id is string => Boolean(id));
    const codes = items
      .map((item) => item.genericDrugCode)
      .filter((code): code is string => Boolean(code));
    const drugs = await this.medications.findForItems(ids, codes);
    const byId = new Map(drugs.map((drug) => [drug.id, drug]));
    const byCode = new Map(drugs.map((drug) => [drug.code.toUpperCase(), drug]));

    await this.items.delete({ packId: pack.id });

    const rows: TreatmentPackItemEntity[] = items.map((item, index) => {
      const itemType = item.itemType ?? 'GENERIC_MEDICINE';
      const drug =
        (item.genericDrugId ? byId.get(item.genericDrugId) : undefined) ??
        (item.genericDrugCode ? byCode.get(item.genericDrugCode.toUpperCase()) : undefined);

      if (itemType === 'GENERIC_MEDICINE' && !drug) {
        throw new BadRequestException(
          `Pack item ${index} references an unknown generic medicine (${item.genericDrugCode ?? item.genericDrugId ?? 'none'})`,
        );
      }

      return this.items.create({
        packId: pack.id,
        itemType,
        genericDrugId: drug?.id ?? null,
        genericDrugCode: drug?.code ?? item.genericDrugCode ?? null,
        supportiveCareRef: item.supportiveCareRef ?? null,
        protocolRegimenCode: item.protocolRegimenCode ?? null,
        instructions: item.instructions ?? {},
        sequence: item.sequence ?? index,
        required: item.required ?? true,
      });
    });

    if (rows.length) await this.items.save(rows);
  }
}
