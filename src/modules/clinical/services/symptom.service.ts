import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateComplaintSymptomDto,
  CreateSymptomDto,
  ListSymptomsDto,
} from '../dto/complaints.dto';
import { ComplaintSymptomEntity, SymptomEntity } from '../entities';
import type { ComplaintSymptomType, SymptomType } from '../types/clinical.types';

export const toSymptomType = (entity: SymptomEntity): SymptomType => ({
  id: entity.id,
  code: entity.code,
  name: entity.name,
  synonyms: entity.synonyms ?? [],
  category: entity.category,
  interpretation: entity.interpretation ?? {},
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

export const toComplaintSymptomType = (
  entity: ComplaintSymptomEntity,
): ComplaintSymptomType => ({
  id: entity.id,
  complaintCode: entity.complaintCode,
  symptomCode: entity.symptomCode,
  applicability: entity.applicability,
  questionRef: entity.questionRef,
  conditionalRules: entity.conditionalRules ?? {},
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

/**
 * Symptom vocabulary + complaint↔symptom associations. Both are consumed by
 * the clerking questionnaire (which symptoms to ask) and the rules engine
 * (which findings a rule references).
 */
@Injectable()
export class SymptomService {
  constructor(
    @InjectRepository(SymptomEntity)
    private readonly repository: Repository<SymptomEntity>,
    @InjectRepository(ComplaintSymptomEntity)
    private readonly associations: Repository<ComplaintSymptomEntity>,
  ) {}

  async list(query: ListSymptomsDto): Promise<{ data: SymptomType[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('symptom')
      .orderBy('symptom.category', 'ASC')
      .addOrderBy('symptom.name', 'ASC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('(LOWER(symptom.code) LIKE LOWER(:search) OR LOWER(symptom.name) LIKE LOWER(:search))', {
        search: `%${query.search}%`,
      });
    }
    if (query.category) {
      qb.andWhere('symptom.category = :category', { category: query.category });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toSymptomType), total };
  }

  async get(id: string): Promise<SymptomType> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Symptom ${id} not found`);
    return toSymptomType(item);
  }

  async create(payload: CreateSymptomDto): Promise<SymptomType> {
    const entity = this.repository.create({
      code: payload.code.trim().toUpperCase(),
      name: payload.name.trim(),
      synonyms: payload.synonyms ?? [],
      category: payload.category.trim(),
      interpretation: payload.interpretation ?? {},
    });
    return toSymptomType(await this.repository.save(entity));
  }

  /** Symptoms applicable to one or more complaints (§6 clinical service). */
  async complaintsSymptoms(complaintCodes: string[]): Promise<{
    assocs: ComplaintSymptomType[];
    symptoms: SymptomType[];
  }> {
    const codes = (complaintCodes ?? []).map((code) => code.toUpperCase());
    const assocs = codes.length
      ? await this.associations
          .createQueryBuilder('assoc')
          .where('assoc.complaint_code IN (:...codes)', { codes })
          .getMany()
      : [];
    const symptomCodes = [...new Set(assocs.map((assoc) => assoc.symptomCode))];
    const symptoms = symptomCodes.length
      ? await this.repository
          .createQueryBuilder('symptom')
          .where('symptom.code IN (:...codes)', { codes: symptomCodes })
          .getMany()
      : [];
    return {
      assocs: assocs.map(toComplaintSymptomType),
      symptoms: symptoms.map(toSymptomType),
    };
  }

  async createAssociation(payload: CreateComplaintSymptomDto): Promise<ComplaintSymptomType> {
    const entity = this.associations.create({
      complaintCode: payload.complaintCode.trim().toUpperCase(),
      symptomCode: payload.symptomCode.trim().toUpperCase(),
      applicability: payload.applicability ?? 'PRIMARY',
      questionRef: payload.questionRef ?? null,
      conditionalRules: payload.conditionalRules ?? {},
    });
    return toComplaintSymptomType(await this.associations.save(entity));
  }

  async findAssociations(complaintCode: string): Promise<ComplaintSymptomType[]> {
    const rows = await this.associations
      .createQueryBuilder('assoc')
      .where('assoc.complaint_code = :complaintCode', {
        complaintCode: (complaintCode ?? '').toUpperCase(),
      })
      .orderBy('assoc.applicability', 'ASC')
      .getMany();
    return rows.map(toComplaintSymptomType);
  }

  async update(id: string, payload: Partial<CreateSymptomDto>): Promise<SymptomType> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Symptom ${id} not found`);
    if (payload.code !== undefined) item.code = payload.code.trim().toUpperCase();
    if (payload.name !== undefined) item.name = payload.name.trim();
    if (payload.synonyms !== undefined) item.synonyms = payload.synonyms;
    if (payload.category !== undefined) item.category = payload.category.trim();
    if (payload.interpretation !== undefined) item.interpretation = payload.interpretation;
    return toSymptomType(await this.repository.save(item));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete({ id });
    if (!result.affected) throw new NotFoundException(`Symptom ${id} not found`);
  }
}
