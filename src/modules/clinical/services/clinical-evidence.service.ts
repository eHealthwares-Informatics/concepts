import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalEvidenceEntity } from '../entities';
import type { ClinicalEvidenceType } from '../types/clinical.types';

export const toClinicalEvidenceType = (
  entity: ClinicalEvidenceEntity,
): ClinicalEvidenceType => ({
  id: entity.id,
  referencedEntity: entity.referencedEntity,
  source: entity.source,
  edition: entity.edition,
  section: entity.section,
  publicationDate: entity.publicationDate,
  reviewedBy: entity.reviewedBy,
  protocolVersion: entity.protocolVersion,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

/** Source citations for packs and rules (§4.2), with reviewer audit fields. */
@Injectable()
export class ClinicalEvidenceService {
  constructor(
    @InjectRepository(ClinicalEvidenceEntity)
    private readonly repository: Repository<ClinicalEvidenceEntity>,
  ) {}

  async create(payload: Partial<ClinicalEvidenceEntity>): Promise<ClinicalEvidenceType> {
    const entity = this.repository.create({
      referencedEntity: payload.referencedEntity ?? '',
      source: payload.source ?? '',
      edition: payload.edition ?? '',
      section: payload.section ?? null,
      publicationDate: payload.publicationDate ?? null,
      reviewedBy: payload.reviewedBy ?? null,
      protocolVersion: payload.protocolVersion ?? '',
    });
    return toClinicalEvidenceType(await this.repository.save(entity));
  }

  async forEntity(referencedEntity: string): Promise<ClinicalEvidenceType[]> {
    const rows = await this.repository.find({ where: { referencedEntity } });
    return rows.map(toClinicalEvidenceType);
  }
}
