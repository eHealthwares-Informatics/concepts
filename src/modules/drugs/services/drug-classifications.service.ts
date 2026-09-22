import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ListDrugClassificationsDto } from '../dto/drug-classifications.dto';
import { DrugClassificationEntity } from '../entities';
import type { DrugClassificationType } from '../types/drugs.types';

function toType(entity: DrugClassificationEntity): DrugClassificationType {
  return { id: entity.id, code: entity.code, type: entity.type, name: entity.name };
}

@Injectable()
export class DrugClassificationsService {
  constructor(
    @InjectRepository(DrugClassificationEntity)
    private readonly repo: Repository<DrugClassificationEntity>,
  ) {}

  allowSort = new Set(['code', 'type', 'name', 'created_at', 'updated_at']);

  async list(query: ListDrugClassificationsDto): Promise<{ data: DrugClassificationType[]; total: number }> {
    const sortBy = this.allowSort.has(query.sortBy ?? '') ? query.sortBy : 'name';
    const qb = this.repo
      .createQueryBuilder('dc')
      .where('dc.deleted_at IS NULL')
      .orderBy(`dc.${sortBy}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
      .skip(query.offset)
      .take(query.limit);
    if (query.type) qb.andWhere('dc.type = :type', { type: query.type });
    if (query.search) {
      qb.andWhere('(dc.code ILIKE :s OR dc.name ILIKE :s)', { s: `%${query.search}%` });
    }
    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toType), total };
  }

  async getByCode(code: string): Promise<DrugClassificationType> {
    const item = await this.repo.findOne({ where: { code, deletedAt: IsNull() } });
    if (!item) throw new NotFoundException('Drug classification not found');
    return toType(item);
  }

  async get(id: string): Promise<DrugClassificationType> {
    const item = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!item) throw new NotFoundException('Drug classification not found');
    return toType(item);
  }

  async getRelations(id: string): Promise<{
    genericDrugs: Array<{ id: string; code: string; name: string }>;
    genericProducts: Array<{ id: string; code: string; name: string }>;
  }> {
    const item = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { genericDrugs: true, genericProducts: true },
    });
    if (!item) throw new NotFoundException('Drug classification not found');
    return {
      genericDrugs: (item.genericDrugs ?? []).map((d) => ({ id: d.id, code: d.code, name: d.name })),
      genericProducts: (item.genericProducts ?? []).map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
      })),
    };
  }
}