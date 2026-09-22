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
  /**
   * Pharmacies nearest to a coordinate, ordered by haversine distance.
   *
   * Uses the settlement gazetteer coordinates stored on each row. Verified
   * against true state centroids: settlementY is LATITUDE, settlementX is
   * LONGITUDE (X/Y naming in the source register is cartographic, not
   * lat/lng). Rows without numeric coordinates are excluded.
   */
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    limit: number,
  ): Promise<
    {
      id: string;
      premisesId: string;
      premisesName: string | null;
      premisesAddress: string | null;
      latitude: number;
      longitude: number;
      distanceKm: number;
      pharmacist: string | null;
      category: string | null;
      certificateNo: string | null;
      stateName: string | null;
      lgaName: string | null;
      wardName: string | null;
      areaName: string | null;
    }[]
  > {
    const rows = await this.pharmacyRepo
      .createQueryBuilder('pharmacy')
      .leftJoin('pharmacy.lga', 'l')
      .leftJoin('pharmacy.areaLocality', 'a')
      .select('pharmacy.id', 'id')
      .addSelect('pharmacy.premisesId', 'premisesId')
      .addSelect('pharmacy.premisesName', 'premisesName')
      .addSelect('pharmacy.premisesAddress', 'premisesAddress')
      .addSelect('pharmacy."settlementY"', 'lat')
      .addSelect('pharmacy."settlementX"', 'lng')
      .addSelect('pharmacy.pharmacist', 'pharmacist')
      .addSelect('pharmacy.category', 'category')
      .addSelect('pharmacy."certificateNo"', 'certificate_no')
      .addSelect('pharmacy."stateName"', 'state_name')
      .addSelect('pharmacy."wardName"', 'ward_name')
      .addSelect('l.name', 'lga_name')
      .addSelect('a.name', 'area_name')
      .addSelect(
        `(6371 * acos(least(1.0, greatest(-1.0,
          cos(radians(:plat)) * cos(radians("settlementY"::double precision))
          * cos(radians("settlementX"::double precision) - radians(:plng))
          + sin(radians(:plat)) * sin(radians("settlementY"::double precision))
        ))))`,
        'distance_km',
      )
      .setParameter('plat', lat)
      .setParameter('plng', lng)
      .andWhere("pharmacy.\"settlementY\" ~ '^[0-9]+(\\.[0-9]+)?$'")
      .andWhere("pharmacy.\"settlementX\" ~ '^[0-9]+(\\.[0-9]+)?$'")
      .orderBy('distance_km', 'ASC')
      .limit(limit)
      .getRawMany<Record<string, string | null>>();

    return rows
      .map((r) => ({
        id: String(r.id),
        premisesId: String(r.premisesId),
        premisesName: r.premisesName != null ? String(r.premisesName) : null,
        premisesAddress: r.premisesAddress != null ? String(r.premisesAddress) : null,
        latitude: Number(r.lat),
        longitude: Number(r.lng),
        distanceKm: Math.round(Number(r.distance_km) * 10) / 10,
        pharmacist: r.pharmacist != null ? String(r.pharmacist) : null,
        category: r.category != null ? String(r.category) : null,
        certificateNo: r.certificate_no != null ? String(r.certificate_no) : null,
        stateName: r.state_name != null ? String(r.state_name) : null,
        lgaName: r.lga_name != null ? String(r.lga_name) : null,
        wardName: r.ward_name != null ? String(r.ward_name) : null,
        areaName: r.area_name != null ? String(r.area_name) : null,
      }))
      .filter((r) => r.distanceKm <= radiusKm);
  }

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
