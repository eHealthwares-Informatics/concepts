import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateComplaintDto, ListComplaintsDto, UpdateComplaintDto } from '../dto/complaints.dto';
import { ComplaintEntity } from '../entities';
import type { ComplaintType } from '../types/clinical.types';
import { ClinicalStatus } from '../types/clinical-triage.types';

export const toComplaintType = (entity: ComplaintEntity): ComplaintType => ({
  id: entity.id,
  code: entity.code,
  name: entity.name,
  slug: entity.slug,
  category: entity.category,
  synonyms: entity.synonyms ?? [],
  localExpressions: entity.localExpressions ?? [],
  status: entity.status,
  sourceRefs: entity.sourceRefs ?? [],
  metadata: entity.metadata ?? {},
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

/**
 * Complaint reference data (§4.2): canonical pharmacy-triageable conditions
 * with synonyms and local expressions so free text resolves to one row.
 */
@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(ComplaintEntity)
    private readonly repository: Repository<ComplaintEntity>,
  ) {}

  async list(query: ListComplaintsDto): Promise<{ data: ComplaintType[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('complaint')
      .orderBy('complaint.category', 'ASC')
      .addOrderBy('complaint.name', 'ASC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere(
        '(LOWER(complaint.code) LIKE LOWER(:search) OR LOWER(complaint.name) LIKE LOWER(:search) OR LOWER(complaint.slug) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }
    if (query.category) {
      qb.andWhere('complaint.category = :category', { category: query.category });
    }
    if (query.status) {
      qb.andWhere('complaint.status = :status', { status: query.status });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toComplaintType), total };
  }

  async get(id: string): Promise<ComplaintType> {
    return toComplaintType(await this.findOne(id));
  }

  async findOne(id: string): Promise<ComplaintEntity> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Complaint ${id} not found`);
    return item;
  }

  async findByCode(code: string): Promise<ComplaintType | null> {
    const item = await this.repository.findOne({ where: { code: code.toUpperCase() } });
    return item ? toComplaintType(item) : null;
  }

  /** Canonical complaint resolution from free text / aliases (§6). */
  async resolveFromText(text: string): Promise<ComplaintType[]> {
    const needle = (text ?? '').toLowerCase().trim();
    if (!needle) return [];
    const all = await this.repository.find();
    return all
      .filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          (item.synonyms ?? []).some((s) => needle.includes(s.toLowerCase())) ||
          (item.localExpressions ?? []).some((s) => needle.includes(s.toLowerCase())),
      )
      .map(toComplaintType);
  }

  async create(payload: CreateComplaintDto): Promise<ComplaintType> {
    const code = payload.code.trim().toUpperCase();
    const duplicate = await this.repository.findOne({ where: { code } });
    if (duplicate) throw new BadRequestException(`Complaint code ${code} already exists`);

    const entity = this.repository.create({
      code,
      name: payload.name.trim(),
      slug: payload.slug.trim().toLowerCase(),
      category: payload.category.trim(),
      synonyms: payload.synonyms ?? [],
      localExpressions: payload.localExpressions ?? [],
      status: payload.status ?? ClinicalStatus.ACTIVE,
      sourceRefs: payload.sourceRefs ?? [],
      metadata: payload.metadata ?? {},
    });
    return toComplaintType(await this.repository.save(entity));
  }

  async update(id: string, payload: UpdateComplaintDto): Promise<ComplaintType> {
    const item = await this.findOne(id);

    if (payload.code !== undefined) {
      const code = payload.code.trim().toUpperCase();
      if (code !== item.code) {
        const duplicate = await this.repository.findOne({ where: { code } });
        if (duplicate) throw new BadRequestException(`Complaint code ${code} already exists`);
      }
      item.code = code;
    }
    if (payload.name !== undefined) item.name = payload.name.trim();
    if (payload.slug !== undefined) item.slug = payload.slug.trim().toLowerCase();
    if (payload.category !== undefined) item.category = payload.category.trim();
    if (payload.synonyms !== undefined) item.synonyms = payload.synonyms;
    if (payload.localExpressions !== undefined) item.localExpressions = payload.localExpressions;
    if (payload.status !== undefined) item.status = payload.status;
    if (payload.sourceRefs !== undefined) item.sourceRefs = payload.sourceRefs;
    if (payload.metadata !== undefined) item.metadata = payload.metadata;

    return toComplaintType(await this.repository.save(item));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete({ id });
    if (!result.affected) throw new NotFoundException(`Complaint ${id} not found`);
  }
}
