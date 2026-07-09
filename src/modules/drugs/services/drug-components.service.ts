import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { DrugComponentType } from '../types/drugs.types';
import { CreateDrugComponentDto, ListDrugComponentsDto, UpdateDrugComponentDto } from '../dto/drug-components.dto';
import { DrugComponentEntity } from '../entities';

const toDrugComponentType = (entity: DrugComponentEntity): DrugComponentType => ({
  id: entity.id,
  name: entity.name,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});

@Injectable()
export class DrugComponentsService {
  constructor(
    @InjectRepository(DrugComponentEntity)
    private readonly drugComponentRepository: Repository<DrugComponentEntity>,
  ) {}

  async list(query: ListDrugComponentsDto): Promise<{ data: DrugComponentType[]; total: number }> {
    const qb = this.drugComponentRepository
      .createQueryBuilder('drug_component')
      .where('drug_component.deleted_at IS NULL')
      .orderBy('drug_component.updated_at', 'DESC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('drug_component.name ILIKE :search', { search: `%${query.search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toDrugComponentType), total };
  }

  async get(id: string): Promise<DrugComponentType> {
    const item = await this.drugComponentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!item) throw new NotFoundException('Drug component not found');
    return toDrugComponentType(item);
  }

  async create(payload: CreateDrugComponentDto): Promise<DrugComponentType> {
    const duplicate = await this.drugComponentRepository.findOne({
      where: { name: payload.name, deletedAt: IsNull() },
    });
    if (duplicate) throw new BadRequestException('Drug component name already exists');

    const entity = this.drugComponentRepository.create({ name: payload.name });
    const saved = await this.drugComponentRepository.save(entity);
    return toDrugComponentType(saved);
  }

  async update(id: string, payload: UpdateDrugComponentDto): Promise<DrugComponentType> {
    const item = await this.drugComponentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!item) throw new NotFoundException('Drug component not found');

    if (payload.name && payload.name !== item.name) {
      const duplicate = await this.drugComponentRepository.findOne({
        where: { name: payload.name, deletedAt: IsNull() },
      });
      if (duplicate) throw new BadRequestException('Drug component name already exists');
      item.name = payload.name;
    }

    const saved = await this.drugComponentRepository.save(item);
    return toDrugComponentType(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.drugComponentRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Drug component not found');
  }
}
