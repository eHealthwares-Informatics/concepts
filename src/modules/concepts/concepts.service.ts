import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  ConceptAttributeValueEntity,
  ExternalConceptMappingEntity,
  ConceptCodingEntity,
  ConceptAttributeEntity,
} from './entities';
import { executeListQuery } from './repository/list';

@Injectable()
export class ConceptsService {
  constructor(
    @InjectRepository(ConceptCodingEntity)
    private readonly conceptCodeRepository: Repository<ConceptCodingEntity>,
    @InjectRepository(ConceptAttributeEntity)
    private readonly conceptAttributeRepository: Repository<ConceptAttributeEntity>,
    @InjectRepository(ConceptAttributeValueEntity)
    private readonly conceptValueRepository: Repository<ConceptAttributeValueEntity>,
    @InjectRepository(ExternalConceptMappingEntity)
    private readonly externalMappingRepository: Repository<ExternalConceptMappingEntity>,
  ) { }

  async createCode(payload: Partial<ConceptCodingEntity>) {
    const entity = this.conceptCodeRepository.create(payload);
    return this.conceptCodeRepository.save(entity);
  }

  async uploadCodes(payload: Partial<ConceptCodingEntity>[]) {
    return this.conceptCodeRepository.save(
      payload.map((item) => this.conceptCodeRepository.create(item)),
    );
  }

  async addConcept(payload: {
    code: Partial<ConceptCodingEntity>;
    conceptValues?: Partial<ConceptAttributeValueEntity>[];
    externalMappings?: Partial<ExternalConceptMappingEntity>[];
  }) {
    const created = await this.createCode(payload.code);

    if (payload.conceptValues?.length) {
      await this.uploadConceptValues(
        payload.conceptValues.map((value) => ({
          ...value,
          entity: created.id,
          concept: value.concept || created.concept,
        })),
      );
    }

    if (payload.externalMappings?.length) {
      await Promise.all(
        payload.externalMappings.map((mapping) =>
          this.createExternalMapping({
            ...mapping,
            conceptCodeId: created.id,
            internalConcept: mapping.internalConcept || created.concept,
            internalCode: mapping.internalCode || created.code,
          }),
        ),
      );
    }

    return this.getConcept(created.id);
  }

  async listConcepts(query: {
    page?: number;
    limit?: number;
    filters: Record<string, any>;
  }) {
    const qb = this.conceptCodeRepository.createQueryBuilder('concept')
    return executeListQuery(qb, 'concept', query)
  }
  parseFilter(value: string) {
    const [type, rawValue, rawValueTo] = value.split(':')

    return {
      type,
      value: rawValue || undefined,
      valueTo: rawValueTo || undefined,
    }
  }
  async getConcept(id: string) {
    const concept = await this.conceptCodeRepository.findOne({
      where: { id },
      relations: ['conceptValues', 'externalMappings'],
    });

    if (!concept) {
      throw new NotFoundException(`Concept not found: ${id}`);
    }

    return concept;
  }

  async updateConcept(id: string, payload: Partial<ConceptCodingEntity>) {
    await this.conceptCodeRepository.update(id, payload);
    return this.getConcept(id);
  }

  async deleteConcept(id: string) {
    await this.conceptCodeRepository.delete(id);
    return { success: true };
  }

  async uploadConceptValues(payload: Partial<ConceptAttributeValueEntity>[]) {
    return this.conceptValueRepository.save(
      payload.map((item) => this.conceptValueRepository.create(item)),
    );
  }

  async createConceptValue(payload: Partial<ConceptAttributeValueEntity>) {
    const entity = this.conceptValueRepository.create(payload);
    return this.conceptValueRepository.save(entity);
  }

  async listConceptValues(query) {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);

    const qb = this.conceptValueRepository
      .createQueryBuilder('cv')
    const result = await executeListQuery(qb, 'cv', query)
    return result;
  }

  async listConceptAttributes(query) {
    const qb = this.conceptAttributeRepository
      .createQueryBuilder('ca')
    const result = await executeListQuery(qb, 'ca', query)
    return result;
  }

  

  async updateConceptValue(id: string, payload: Partial<ConceptAttributeValueEntity>) {
    await this.conceptValueRepository.update(id, payload);
    return this.conceptValueRepository.findOne({ where: { id } });
  }

  async deleteConceptValue(id: string) {
    await this.conceptValueRepository.delete(id);
    return { success: true };
  }

  async createExternalMapping(payload: Partial<ExternalConceptMappingEntity>) {
    const entity = this.externalMappingRepository.create(payload);
    return this.externalMappingRepository.save(entity);
  }

  async listExternalMappings(query: {
    page?: number;
    limit?: number;
    externalConcept?: string;
    externalCode?: string;
    internalConcept?: string;
  }) {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
    const where: Record<string, any> = {};

    if (query.externalConcept) {
      where.externalConcept = query.externalConcept;
    }
    if (query.internalConcept) {
      where.internalConcept = query.internalConcept;
    }
    if (query.externalCode) {
      where.externalCode = ILike(`%${query.externalCode}%`);
    }

    const [data, total] = await this.externalMappingRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const meta = this.buildMeta(page, limit, total);

    return {
      data,
      pagination: meta,
      meta,
    };
  }

  async updateExternalMapping(
    id: string,
    payload: Partial<ExternalConceptMappingEntity>,
  ) {
    await this.externalMappingRepository.update(id, payload);
    return this.externalMappingRepository.findOne({ where: { id } });
  }

  async deleteExternalMapping(id: string) {
    await this.externalMappingRepository.delete(id);
    return { success: true };
  }

  async searchConcept(concept: string, conceptCode: string, metadata = false) {
    const conceptCoding = await this.conceptCodeRepository.findOne({
      where: [
        { concept: concept as any, code: conceptCode },
        { concept: concept as any, shortName: ILike(`%${conceptCode}%`) },
        { concept: concept as any, longName: ILike(`%${conceptCode}%`) },
      ],
      relations: ['conceptValues', 'externalMappings'],
      order: { createdAt: 'ASC' },
    });

    if (!conceptCoding) {
      throw new NotFoundException(
        `No concept found for concept ${concept} and search term ${conceptCode} `,
      );
    }

    return this.formatConceptResponse(conceptCoding, metadata);
  }

  async matchConcepts(concept: string, conceptCode: string, metadata = false) {
    const concepts = await this.conceptCodeRepository.find({
      where: [
        { concept: concept as any, code: ILike(`%${conceptCode}%`) },
        { concept: concept as any, shortName: ILike(`%${conceptCode}%`) },
        { concept: concept as any, longName: ILike(`%${conceptCode}%`) },
      ],
      relations: ['conceptValues', 'externalMappings'],
      order: { shortName: 'ASC', code: 'ASC' },
    });

    return concepts.map((concept) => this.formatConceptResponse(concept, metadata));
  }

  private formatConceptResponse(concept: ConceptCodingEntity, metadata: boolean) {
    return {
      id: concept.id,
      concept: concept.concept,
      code: concept.code,
      shortName: concept.shortName,
      fullName: concept.longName,
      shortDescription: concept.shortDescription,
      fullDescription: concept.longDescription,
      externalMappings: concept.externalMappings || [],
      ...(metadata
        ? {
          metadata: (concept.conceptValues || []).reduce<Record<string, any>>(
            (accumulator, value) => {
              accumulator[value.attribute.code] = {
                attributeId: value.attribute.id,
                attributeCode: value.attribute.code,
                attributeName: value.attribute.name,
                attributeValue: value.value,
                valueFormat: value.valueFormat,
              };
              return accumulator;
            },
            {},
          ),
        }
        : {}),
    };
  }

  private buildMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
