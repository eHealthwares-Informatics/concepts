import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PharmacyEntity } from '../entities';
import { LocalityEntity, LocalityRelationEntity } from '../../localities/entities';
import { applyFilters } from '../../concepts/repository/list';
import type {
  LocalityRef,
  NearbyPharmacyType,
  PharmacyListQuery,
  PharmacyType,
} from '../types/pharmacies.types';

const NEARBY_TIER_RANK: Record<string, number> = {
  area: 0,
  ward: 0,
  lga: 1,
  coord: 2,
};

function toLocalityRef(e: LocalityEntity | null): LocalityRef | null {
  return e ? { id: e.id, code: e.code, name: e.name, type: e.type } : null;
}

function toPharmacyType(e: PharmacyEntity): PharmacyType {
  return {
    id: e.id,
    premisesId: e.premisesId,
    premisesName: e.premisesName,
    premisesAddress: e.premisesAddress,
    premisesState: e.premisesState,
    pharmacistId: e.pharmacistId,
    pharmacistFirstName: e.pharmacistFirstName,
    pharmacistMiddleName: e.pharmacistMiddleName,
    pharmacistLastName: e.pharmacistLastName,
    pharmacist: e.pharmacist,
    stateCode: e.stateCode,
    stateName: e.stateName,
    lgaName: e.lgaName,
    lgaCode: e.lgaCode,
    wardName: e.wardName,
    wardCode: e.wardCode,
    area: e.area,
    neighbourhood: e.neighbourhood,
    settlement: e.settlement,
    settlementCode: e.settlementCode,
    stateMatch: e.stateMatch,
    certificateNo: e.certificateNo,
    category: e.category,
    yearLicenced: e.yearLicenced,
    dateApproved: e.dateApproved,
    isLicencePrinted: !!e.isLicencePrinted,
    datePrinted: e.datePrinted,
    matchedStateCode: e.matchedStateCode,
    matchedLgaCode: e.matchedLgaCode,
    matchedWardCode: e.matchedWardCode,
    lgaMatch: e.lgaMatch,
    wardMatch: e.wardMatch,
    state: e.state ? { id: e.state.id, code: e.state.code, name: e.state.name } : null,
    lga: e.lga ? { id: e.lga.id, code: e.lga.code, name: e.lga.name } : null,
    ward: e.ward ? { id: e.ward.id, code: e.ward.code, name: e.ward.name } : null,
    areaLocality: toLocalityRef(e.areaLocality),
    neighbourhoodLocality: toLocalityRef(e.neighbourhoodLocality),
    settlementLocality: toLocalityRef(e.settlementLocality),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
  };
}

@Injectable()
export class PharmaciesService {
  constructor(
    @InjectRepository(PharmacyEntity)
    private readonly pharmacyRepo: Repository<PharmacyEntity>,
    @InjectRepository(LocalityRelationEntity)
    private readonly relationRepo: Repository<LocalityRelationEntity>,
  ) {}

  private baseQuery() {
    return this.pharmacyRepo
      .createQueryBuilder('pharmacy')
      .leftJoinAndSelect('pharmacy.state', 'state')
      .leftJoinAndSelect('pharmacy.lga', 'lga')
      .leftJoinAndSelect('pharmacy.ward', 'ward')
      .leftJoinAndSelect('pharmacy.areaLocality', 'area')
      .leftJoinAndSelect('pharmacy.neighbourhoodLocality', 'neighbourhood')
      .leftJoinAndSelect('pharmacy.settlementLocality', 'settlement');
  }

  async list(query: PharmacyListQuery): Promise<{
    data: PharmacyType[];
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
        '(pharmacy.premisesName ILIKE :s OR pharmacy.pharmacist ILIKE :s OR pharmacy.certificateNo ILIKE :s OR pharmacy.premisesAddress ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    applyFilters(qb, 'pharmacy', query.filters ?? {});

    const [rows, total] = await qb
      .orderBy('pharmacy.premisesName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: rows.map(toPharmacyType), total, page, limit };
  }

  async get(id: string): Promise<PharmacyType> {
    const row = await this.baseQuery().where('pharmacy.id = :id', { id }).getOne();
    if (!row) throw new NotFoundException('Pharmacy not found');
    return toPharmacyType(row);
  }

  /**
   * Pharmacies in the same area and in neighbouring areas (precomputed
   * locality_relations edges), ordered by proximity tier then distance.
   */
  async nearby(id: string, limit = 50): Promise<NearbyPharmacyType[]> {
    const pharmacy = await this.pharmacyRepo.findOne({
      where: { id },
      select: ['id', 'areaId'],
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found');
    if (!pharmacy.areaId) return [];

    const ranking = new Map<string, { tier: string; distanceKm: number | null }>();
    ranking.set(pharmacy.areaId, { tier: 'area', distanceKm: 0 });

    const edges = await this.relationRepo
      .createQueryBuilder('relation')
      .where('relation.locality_id = :id', { id: pharmacy.areaId })
      .andWhere('relation.kind = :kind', { kind: 'nearby' })
      .getMany();

    for (const edge of edges) {
      if (!edge.relatedLocalityId || ranking.has(edge.relatedLocalityId)) continue;
      ranking.set(edge.relatedLocalityId, {
        tier: edge.tier ?? 'coord',
        distanceKm: edge.distanceKm === null ? null : Number(edge.distanceKm),
      });
    }

    const rows = await this.baseQuery()
      .where('pharmacy.area_id IN (:...ids)', { ids: [...ranking.keys()] })
      .andWhere('pharmacy.id != :id', { id })
      .getMany();

    const rankOf = (areaId: string | null) =>
      areaId ? NEARBY_TIER_RANK[ranking.get(areaId)?.tier ?? 'coord'] ?? 3 : 3;

    rows.sort((a, b) => {
      const ra = rankOf(a.areaId);
      const rb = rankOf(b.areaId);
      if (ra !== rb) return ra - rb;
      const da = ranking.get(a.areaId ?? '')?.distanceKm ?? Number.MAX_SAFE_INTEGER;
      const db = ranking.get(b.areaId ?? '')?.distanceKm ?? Number.MAX_SAFE_INTEGER;
      if (da !== db) return da - db;
      return (a.premisesName ?? '').localeCompare(b.premisesName ?? '');
    });

    return rows.slice(0, Math.min(Math.max(limit, 1), 200)).map((row) => {
      const rank = row.areaId ? ranking.get(row.areaId) : undefined;
      return {
        ...toPharmacyType(row),
        nearbyTier: rank?.tier ?? null,
        nearbyDistanceKm: rank?.distanceKm ?? null,
      };
    });
  }
}
