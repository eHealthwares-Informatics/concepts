import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateContraindicationDto,
  ListContraindicationsDto,
  UpdateContraindicationDto,
} from '../dto/red-flag-rules.dto';
import { ContraindicationEntity } from '../entities';
import type { ContraindicationType } from '../types/clinical.types';

export const toContraindicationType = (
  entity: ContraindicationEntity,
): ContraindicationType => ({
  id: entity.id,
  code: entity.code,
  applicability: entity.applicability ?? {},
  significance: entity.significance,
  medicineExclusions: entity.medicineExclusions ?? [],
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

/**
 * Contraindication screening reference (§4.2). Evaluated at recommendation
 * time: any matching significant contraindication removes the excluded
 * medicines from consideration.
 */
@Injectable()
export class ContraindicationService {
  constructor(
    @InjectRepository(ContraindicationEntity)
    private readonly repository: Repository<ContraindicationEntity>,
  ) {}

  async list(query: ListContraindicationsDto = {}): Promise<ContraindicationType[]> {
    const qb = this.repository.createQueryBuilder('contraindication').orderBy('contraindication.code', 'ASC');
    if (query.significance) {
      qb.andWhere('contraindication.significance = :significance', {
        significance: query.significance,
      });
    }
    const rows = await qb.getMany();
    return rows.map(toContraindicationType);
  }

  async create(payload: CreateContraindicationDto): Promise<ContraindicationType> {
    const code = payload.code.trim().toUpperCase();
    const duplicate = await this.repository.findOne({ where: { code } });
    if (duplicate) {
      throw new BadRequestException(`Contraindication code ${code} already exists`);
    }

    const entity = this.repository.create({
      code,
      applicability: payload.applicability ?? {},
      significance: payload.significance,
      medicineExclusions: payload.medicineExclusions ?? [],
    });
    return toContraindicationType(await this.repository.save(entity));
  }

  async update(id: string, payload: UpdateContraindicationDto): Promise<ContraindicationType> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Contraindication ${id} not found`);
    if (payload.code !== undefined) item.code = payload.code.trim().toUpperCase();
    if (payload.applicability !== undefined) item.applicability = payload.applicability;
    if (payload.significance !== undefined) item.significance = payload.significance;
    if (payload.medicineExclusions !== undefined) {
      item.medicineExclusions = payload.medicineExclusions;
    }
    return toContraindicationType(await this.repository.save(item));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete({ id });
    if (!result.affected) throw new NotFoundException(`Contraindication ${id} not found`);
  }
}
