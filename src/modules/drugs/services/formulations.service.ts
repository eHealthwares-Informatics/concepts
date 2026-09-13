import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { FormulationType } from '../types/drugs.types';
import { CreateFormulationDto, ListFormulationsDto, UpdateFormulationDto } from '../dto/formulations.dto';
import { FormulationEntity } from '../entities';

const toFormulationType = (entity: FormulationEntity): FormulationType => ({
  id: entity.id,
  code: entity.code,
  name: entity.name,
  description: entity.description,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});

@Injectable()
export class FormulationsService {
  constructor(
    @InjectRepository(FormulationEntity)
    private readonly formulationRepository: Repository<FormulationEntity>,
  ) {}

  async list(query: ListFormulationsDto): Promise<{ data: FormulationType[]; total: number }> {
    const qb = this.formulationRepository
      .createQueryBuilder('formulation')
      .where('formulation.deleted_at IS NULL')
      .orderBy('formulation.name', 'ASC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('formulation.name ILIKE :search', { search: `%${query.search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toFormulationType), total };
  }

  async get(id: string): Promise<FormulationType> {
    const item = await this.formulationRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!item) throw new NotFoundException('Formulation not found');
    return toFormulationType(item);
  }

  async create(payload: CreateFormulationDto): Promise<FormulationType> {
    const duplicate = await this.formulationRepository.findOne({
      where: { code: payload.code, deletedAt: IsNull() },
    });
    if (duplicate) throw new BadRequestException('Formulation code already exists');

    const entity = this.formulationRepository.create({
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
    });
    const saved = await this.formulationRepository.save(entity);
    return toFormulationType(saved);
  }

  async update(id: string, payload: UpdateFormulationDto): Promise<FormulationType> {
    const item = await this.formulationRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!item) throw new NotFoundException('Formulation not found');

    if (payload.code && payload.code !== item.code) {
      const duplicate = await this.formulationRepository.findOne({
        where: { code: payload.code, deletedAt: IsNull() },
      });
      if (duplicate) throw new BadRequestException('Formulation code already exists');
      item.code = payload.code;
    }
    if (payload.name !== undefined) item.name = payload.name;
    if (payload.description !== undefined) item.description = payload.description;

    const saved = await this.formulationRepository.save(item);
    return toFormulationType(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.formulationRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Formulation not found');
  }
}
