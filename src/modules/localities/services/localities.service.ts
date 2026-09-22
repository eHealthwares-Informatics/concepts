import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalityEntity, LocalityRelationEntity } from '../entities';
import { applyFilters } from '../../concepts/repository/list';
import type {
  LocalityListQuery,
  LocalityType,
  NearbyLocalityType,
} from '../types/localities.types';

function toLocalityType(e: LocalityEntity): LocalityType {
  return {
    id: e.id,
    code: e.code,
    type: e.type,
    name: e.name,
    gazetteerWardCode: e.gazetteerWardCode,
    lon: e.lon === null ? null : Number(e.lon),
    lat: e.lat === null ? null : Number(e.lat),
    pharmacyCount: e.pharmacyCount,
    source: e.source,
    confidence: e.confidence,
  };
}

@Injectable()
export class LocalitiesService {
  constructor(
    @InjectRepository(LocalityEntity)
    private readonly localityRepo: Repository<LocalityEntity>,
    @InjectRepository(LocalityRelationEntity)
    private readonly relationRepo: Repository<LocalityRelationEntity>,
  ) {}

  async list(query: LocalityListQuery): Promise<{
    data: LocalityType[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 200);

    const qb = this.localityRepo.createQueryBuilder('locality');

    if (query.type) {
      qb.andWhere('locality.type = :type', { type: query.type });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('locality.name ILIKE :s', { s: `%${search}%` });
    }

    applyFilters(qb, 'locality', query.filters ?? {});

    const [rows, total] = await qb
      .orderBy('locality.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: rows.map(toLocalityType), total, page, limit };
  }

  async get(id: string): Promise<LocalityType> {
    const row = await this.localityRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Locality not found');
    return toLocalityType(row);
  }

  /**
   * Lightweight option list for locator filter dropdowns: id/name per locality
   * type (area | neighbourhood | settlement), ordered by name. `search`
   * narrows server-side so large lists stay cheap to browse.
   */
  async getOptions(
    type?: string,
    search?: string,
    limit = 50,
  ): Promise<{ id: string; name: string; type: string }[]> {
    const qb = this.localityRepo
      .createQueryBuilder('locality')
      .select('locality.id', 'id')
      .addSelect('locality.name', 'name')
      .addSelect('locality.type', 'type')
      .orderBy('locality.name', 'ASC')
      .limit(Math.min(Math.max(limit, 1), 200));
    if (type) {
      qb.andWhere('locality.type = :type', { type });
    }
    const trimmed = search?.trim();
    if (trimmed) {
      qb.andWhere('locality.name ILIKE :s', { s: `%${trimmed}%` });
    }
    const rows = await qb.getRawMany<Record<string, string>>();
    return rows.map((r) => ({ id: String(r.id), name: String(r.name), type: String(r.type) }));
  }

  async nearby(id: string, limit = 50): Promise<NearbyLocalityType[]> {
    const exists = await this.localityRepo.findOne({ where: { id }, select: ['id'] });
    if (!exists) throw new NotFoundException('Locality not found');

    const rows = await this.relationRepo
      .createQueryBuilder('relation')
      .leftJoinAndSelect('relation.relatedLocality', 'related')
      .where('relation.locality_id = :id', { id })
      .andWhere('relation.kind = :kind', { kind: 'nearby' })
      .getMany();

    const rank: Record<string, number> = { ward: 0, lga: 1, coord: 2 };
    rows.sort((a, b) => {
      const ra = rank[a.tier ?? 'coord'] ?? 3;
      const rb = rank[b.tier ?? 'coord'] ?? 3;
      if (ra !== rb) return ra - rb;
      const da = a.distanceKm === null ? Number.MAX_SAFE_INTEGER : Number(a.distanceKm);
      const db = b.distanceKm === null ? Number.MAX_SAFE_INTEGER : Number(b.distanceKm);
      if (da !== db) return da - db;
      return (a.relatedLocality?.name ?? '').localeCompare(b.relatedLocality?.name ?? '');
    });

    return rows.slice(0, Math.min(Math.max(limit, 1), 200)).map((r) => ({
      tier: r.tier,
      distanceKm: r.distanceKm === null ? null : Number(r.distanceKm),
      locality: r.relatedLocality ? toLocalityType(r.relatedLocality) : null,
    }));
  }
}
