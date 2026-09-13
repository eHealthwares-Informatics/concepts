import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { DosageFormType } from '../types/drugs.types';
import { CreateDosageFormDto, ListDosageFormsDto, UpdateDosageFormDto } from '../dto/dosage-forms.dto';
import { DosageFormEntity } from '../entities';

const toDosageFormType = (entity: DosageFormEntity): DosageFormType => ({
  id: entity.id,
  code: entity.code,
  name: entity.name,
  description: entity.description,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});

@Injectable()
export class DosageFormsService {
  constructor(
    @InjectRepository(DosageFormEntity)
    private readonly dosageFormRepository: Repository<DosageFormEntity>,
  ) {}

  async list(query: ListDosageFormsDto): Promise<{ data: DosageFormType[]; total: number }> {
    const qb = this.dosageFormRepository
      .createQueryBuilder('dosage_form')
      .where('dosage_form.deleted_at IS NULL')
      .orderBy('dosage_form.name', 'ASC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('dosage_form.name ILIKE :search', { search: `%${query.search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toDosageFormType), total };
  }

  async get(id: string): Promise<DosageFormType> {
    const item = await this.dosageFormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!item) throw new NotFoundException('Dosage form not found');
    return toDosageFormType(item);
  }

  async create(payload: CreateDosageFormDto): Promise<DosageFormType> {
    const duplicate = await this.dosageFormRepository.findOne({
      where: { code: payload.code, deletedAt: IsNull() },
    });
    if (duplicate) throw new BadRequestException('Dosage form code already exists');

    const entity = this.dosageFormRepository.create({
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
    });
    const saved = await this.dosageFormRepository.save(entity);
    return toDosageFormType(saved);
  }

  async update(id: string, payload: UpdateDosageFormDto): Promise<DosageFormType> {
    const item = await this.dosageFormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!item) throw new NotFoundException('Dosage form not found');

    if (payload.code && payload.code !== item.code) {
      const duplicate = await this.dosageFormRepository.findOne({
        where: { code: payload.code, deletedAt: IsNull() },
      });
      if (duplicate) throw new BadRequestException('Dosage form code already exists');
      item.code = payload.code;
    }
    if (payload.name !== undefined) item.name = payload.name;
    if (payload.description !== undefined) item.description = payload.description;

    const saved = await this.dosageFormRepository.save(item);
    return toDosageFormType(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.dosageFormRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Dosage form not found');
  }
}
