import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticCenterEntity } from '../entities';
import { applyFilters } from '../../concepts/repository/list';
import type {
  DiagnosticCenterListQuery,
  DiagnosticCenterType,
} from '../types/diagnostic-centers.types';

function toGeoRef(e: { id: string; code: string; name: string } | null) {
  return e ? { id: e.id, code: e.code, name: e.name } : null;
}

function toCenterType(e: DiagnosticCenterEntity): DiagnosticCenterType {
  return {
    id: e.id,
    code: e.code,
    name: e.name,
    address: e.address,
    description: e.description,
    stateName: e.stateName,
    lgaName: e.lgaName,
    openHours: e.openHours,
    rating: e.rating,
    providerId: e.providerId,
    sourceUrl: e.sourceUrl,
    state: toGeoRef(e.state),
    lga: toGeoRef(e.lga),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
  };
}

@Injectable()
export class DiagnosticCentersService {
  constructor(
    @InjectRepository(DiagnosticCenterEntity)
    private readonly centerRepo: Repository<DiagnosticCenterEntity>,
  ) {}

  private baseQuery() {
    return this.centerRepo
      .createQueryBuilder('center')
      .leftJoinAndSelect('center.state', 'state')
      .leftJoinAndSelect('center.lga', 'lga');
  }

  async list(query: DiagnosticCenterListQuery): Promise<{
    data: DiagnosticCenterType[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);

    const qb = this.baseQuery();

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(center.name ILIKE :s OR center.address ILIKE :s OR center.description ILIKE :s OR center.lgaName ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    applyFilters(qb, 'center', query.filters ?? {});

    const [rows, total] = await qb
      .orderBy('center.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: rows.map(toCenterType), total, page, limit };
  }

  async get(id: string): Promise<DiagnosticCenterType> {
    const row = await this.baseQuery().where('center.id = :id', { id }).getOne();
    if (!row) throw new NotFoundException('Diagnostic center not found');
    return toCenterType(row);
  }

  /**
   * Centers near a given center. The directory carries no coordinates, so
   * proximity is tiered by admin area instead: same LGA first, then the same
   * state, each ordered by name. Rows carry `nearbyTier`.
   */
  async nearby(
    id: string,
    limit = 50,
  ): Promise<Array<DiagnosticCenterType & { nearbyTier: string }>> {
    const center = await this.centerRepo.findOne({
      where: { id },
      select: ['id', 'lgaId', 'stateId'],
    });
    if (!center) throw new NotFoundException('Diagnostic center not found');

    const sameLga = center.lgaId
      ? await this.baseQuery()
          .where('center.lga_id = :lgaId', { lgaId: center.lgaId })
          .andWhere('center.id != :id', { id })
          .orderBy('center.name', 'ASC')
          .getMany()
      : [];

    const lgaIds = new Set(sameLga.map((row) => row.id));
    const sameState =
      center.stateId
        ? (await this.baseQuery()
            .where('center.state_id = :stateId', { stateId: center.stateId })
            .andWhere('center.id != :id', { id })
            .orderBy('center.name', 'ASC')
            .getMany()
          ).filter((row) => !lgaIds.has(row.id))
        : [];

    return [
      ...sameLga.map((row) => ({ ...toCenterType(row), nearbyTier: 'lga' })),
      ...sameState.map((row) => ({ ...toCenterType(row), nearbyTier: 'state' })),
    ].slice(0, Math.min(Math.max(limit, 1), 200));
  }
}
