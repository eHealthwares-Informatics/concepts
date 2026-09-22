import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ListGenericDrugsDto } from '../dto/generic-drugs.dto';
import { GenericDrugEntity } from '../entities';
import type { DrugClassificationType, GenericDrugType } from '../types/drugs.types';

function toDrugClassificationType(c: { id: string; code: string; type: string; name: string }): DrugClassificationType {
  return { id: c.id, code: c.code, type: c.type, name: c.name };
}

function toGenericDrugType(entity: GenericDrugEntity): GenericDrugType {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    genericClass: entity.genericClass,
    pharmaceuticalClass: entity.pharmaceuticalClass,
    emdexCode: entity.emdexCode,
    source: entity.source,
    classifications: (entity.classifications ?? []).map(toDrugClassificationType),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
  };
}

@Injectable()
export class GenericDrugsService {
  constructor(
    @InjectRepository(GenericDrugEntity)
    private readonly repo: Repository<GenericDrugEntity>,
  ) {}

  async list(query: ListGenericDrugsDto): Promise<{ data: GenericDrugType[]; total: number }> {
    const qb = this.repo
      .createQueryBuilder('gd')
      .where('gd.deleted_at IS NULL')
      .orderBy(`gd.${query.sortBy ?? 'name'}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
      .skip(query.offset)
      .take(query.limit);
    if (query.search) {
      qb.andWhere('(gd.code ILIKE :s OR gd.name ILIKE :s OR gd.generic_class ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }
    const [data, total] = await qb.getManyAndCount();
    await this.withClassifications(data);
    return { data: data.map(toGenericDrugType), total };
  }

  async getByCode(code: string): Promise<GenericDrugType> {
    const item = await this.repo.findOne({ where: { code, deletedAt: IsNull() }, relations: { classifications: true } });
    if (!item) throw new NotFoundException('Generic drug not found');
    return toGenericDrugType(item);
  }

  async get(id: string): Promise<GenericDrugType> {
    const item = await this.repo.findOne({ where: { id, deletedAt: IsNull() }, relations: { classifications: true } });
    if (!item) throw new NotFoundException('Generic drug not found');
    return toGenericDrugType(item);
  }

  private async withClassifications(entities: GenericDrugEntity[]): Promise<void> {
    if (!entities.length) return;
    const ids = entities.map((e) => e.id);
    const rows = await this.repo
      .createQueryBuilder('gd')
      .leftJoinAndSelect('gd.classifications', 'c')
      .where('gd.id IN (:...ids)', { ids })
      .getMany();
    const byId = new Map(rows.map((r) => [r.id, r.classifications ?? []]));
    for (const ent of entities) ent.classifications = byId.get(ent.id) ?? [];
  }
}