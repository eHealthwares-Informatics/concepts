import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FacilityEntity,
  StateEntity,
  WardEntity,
  LgaEntity,
  FacilityTypeEntity,
  FacilityLevelEntity,
} from '../entities';
import { FacilityListQueryDto, FhirLocationQueryDto } from '../dto/facilities.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(FacilityEntity)
    private readonly facilityRepository: Repository<FacilityEntity>,
    @InjectRepository(StateEntity)
    private readonly stateRepository: Repository<StateEntity>,
    @InjectRepository(WardEntity)
    private readonly wardRepository: Repository<WardEntity>,
    @InjectRepository(LgaEntity)
    private readonly lgaRepository: Repository<LgaEntity>,
    @InjectRepository(FacilityTypeEntity)
    private readonly facilityTypeRepository: Repository<FacilityTypeEntity>,
    @InjectRepository(FacilityLevelEntity)
    private readonly facilityLevelRepository: Repository<FacilityLevelEntity>,
  ) {}

  async list(query: FacilityListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const qb = this.facilityRepository.createQueryBuilder('f')
    .leftJoinAndSelect('f.state', 's')
  .leftJoinAndSelect('f.lga', 'l')
  .leftJoinAndSelect('f.ward', 'w')
  .leftJoinAndSelect('f.facilityType', 'ft')
  .leftJoinAndSelect('f.facilityLevel', 'fl');

    if (query.code) {
      qb.andWhere('f.facilityId = :code', { code: query.code });
    }
    if (query.search) {
      qb.andWhere('(f.facilityName ILIKE :search OR f.alternativeName ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.state) {
      qb.andWhere('s.code = :stateCode', { stateCode: query.state });
    }
    if (query.ward) {
      qb.andWhere('w.code = :ward', {
        ward: query.ward,
      });
    }
    if (query.ward_name) {
      qb.andWhere('w.name ILIKE :wardName', { wardName: query.ward_name });
    }
    if (query.lga) {
      qb.andWhere('l.code = :lga', {
        lga: query.lga,
      });
    }
    if (query.facility_type) {
      qb.andWhere('ft.code = :facilityType', {
        facilityType: query.facility_type,
      });
    }
    if (query.facility_level) {
      qb.andWhere(
        'fl.code = :facilityLevel',
        { facilityLevel: query.facility_level },
      );
    }
    if (query.ownership_code) {
      qb.andWhere(
        'f.ownershipCode = :ownershipCode',
        { ownershipCode: query.ownership_code },
      );
    }
    if (query.name_like) {
      qb.andWhere('f.facilityName ILIKE :nameLike', {
        nameLike: `%${query.name_like}%`,
      });
    }

    

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('f.facilityName', 'ASC')
      .getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const facility = await this.facilityRepository.findOne({
      where: { id },
      relations: ['state', 'lga', 'ward', 'facilityType', 'facilityLevel'],
    });
    if (!facility) {
      throw new NotFoundException(`Facility not found: ${id}`);
    }
    return facility;
  }

  async getByCode(code: string) {
    const facility = await this.facilityRepository.findOne({
      where: { facilityId: code },
      relations: ['state', 'lga', 'ward', 'facilityType', 'facilityLevel'],
    });
    if (!facility) {
      throw new NotFoundException(`Facility not found with code: ${code}`);
    }
    return facility;
  }

  async getStates() {
    return this.stateRepository.find({ order: { code: 'ASC' } });
  }

  /**
   * Facilities nearest to a coordinate, ordered by haversine distance.
   *
   * The source registry has latitude/longitude TRANSPOSED for a band of
   * northern states (verified against true state centroids). Rather than
   * trust any single orientation, the distance is computed against the
   * *smaller* of the two possible readings (stored as-is vs swapped) and the
   * row is flagged `coordinatesCorrected` when the swap was used. Stored
   * data is never mutated.
   */
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    limit: number,
  ): Promise<
    {
      id: string;
      facilityId: string;
      facilityName: string | null;
      latitude: number;
      longitude: number;
      coordinatesCorrected: boolean;
      distanceKm: number;
      state: { code: string; name: string } | null;
      lga: { code: string; name: string } | null;
      ward: { code: string; name: string } | null;
      facilityType: { code: string; name: string } | null;
      facilityLevel: { code: string; name: string } | null;
      phoneNumber: string | null;
      emailAddress: string | null;
      website: string | null;
    }[]
  > {
    // Haversine on an arbitrary (lat_expr, lng_expr) pair.
    const hav = (latExpr: string, lngExpr: string) =>
      `(6371 * acos(least(1.0, greatest(-1.0,
        cos(radians(:plat)) * cos(radians(${latExpr})) * cos(radians(${lngExpr}) - radians(:plng))
        + sin(radians(:plat)) * sin(radians(${latExpr}))
      ))))`;

    const direct = hav('f.latitude', 'f.longitude');
    const swapped = hav('f.longitude', 'f.latitude');
    // Smaller of the two orientations wins, with the correction flag.
    const best = `LEAST(${direct}, ${swapped})`;

    const rows = await this.nearbyRows({ lat, lng, radiusKm, limit });
    return rows;
  }

  /**
   * Facilities nearest to a given facility (haversine around its own stored
   * coordinates). `nameLike` constrains the subset — e.g. `hospital` for the
   * hospitals registry. Returns [] when the anchor facility has no coordinates.
   */
  async findNearbyFacility(
    facilityId: string,
    opts: { radiusKm?: number; limit?: number; nameLike?: string } = {},
  ) {
    const facility = await this.facilityRepository.findOne({
      where: { id: facilityId },
      select: ['id', 'latitude', 'longitude', 'facilityName'],
    });
    if (!facility) throw new NotFoundException('Facility not found');
    if (facility.latitude == null || facility.longitude == null) return [];

    return this.nearbyRows({
      lat: Number(facility.latitude),
      lng: Number(facility.longitude),
      radiusKm: opts.radiusKm ?? 25,
      limit: opts.limit ?? 50,
      nameLike: opts.nameLike,
      excludeId: facilityId,
    });
  }

  /** Shared haversine nearest-search (handles the transposed-coordinate band). */
  private async nearbyRows(opts: {
    lat: number;
    lng: number;
    radiusKm: number;
    limit: number;
    nameLike?: string;
    excludeId?: string;
  }) {
    const { lat, lng, radiusKm, limit, nameLike, excludeId } = opts;
    // Haversine on an arbitrary (lat_expr, lng_expr) pair.
    const hav = (latExpr: string, lngExpr: string) =>
      `(6371 * acos(least(1.0, greatest(-1.0,
        cos(radians(:plat)) * cos(radians(${latExpr})) * cos(radians(${lngExpr}) - radians(:plng))
        + sin(radians(:plat)) * sin(radians(${latExpr}))
      ))))`;

    const direct = hav('f.latitude', 'f.longitude');
    const swapped = hav('f.longitude', 'f.latitude');
    // Smaller of the two orientations wins, with the correction flag.
    const best = `LEAST(${direct}, ${swapped})`;

    const qb = this.facilityRepository
      .createQueryBuilder('f')
      .leftJoin('f.state', 's')
      .leftJoin('f.lga', 'l')
      .leftJoin('f.ward', 'w')
      .leftJoin('f.facilityType', 'ft')
      .leftJoin('f.facilityLevel', 'fl')
      .select('f.id', 'id')
      .addSelect('f.facilityId', 'facilityId')
      .addSelect('f.facilityName', 'facilityName')
      .addSelect('f.latitude', 'storedLat')
      .addSelect('f.longitude', 'storedLng')
      .addSelect('f.phoneNumber', 'phone_number')
      .addSelect('f.emailAddress', 'email_address')
      .addSelect('f.website', 'website')
      .addSelect('s.code', 's_code')
      .addSelect('s.name', 's_name')
      .addSelect('l.code', 'l_code')
      .addSelect('l.name', 'l_name')
      .addSelect('w.code', 'w_code')
      .addSelect('w.name', 'w_name')
      .addSelect('ft.code', 'ft_code')
      .addSelect('ft.name', 'ft_name')
      .addSelect('fl.code', 'fl_code')
      .addSelect('fl.name', 'fl_name')
      .addSelect(
        `(${swapped} <= ${direct})`,
        'corrected',
      )
      .addSelect(`CASE WHEN ${swapped} <= ${direct} THEN f.longitude ELSE f.latitude END`, 'lat')
      .addSelect(`CASE WHEN ${swapped} <= ${direct} THEN f.latitude ELSE f.longitude END`, 'lng')
      .addSelect(best, 'distance_km')
      .setParameter('plat', lat)
      .setParameter('plng', lng)
      .andWhere('f.latitude IS NOT NULL AND f.longitude IS NOT NULL');

    if (nameLike) {
      qb.andWhere('f.facilityName ILIKE :nameLike', { nameLike: `%${nameLike}%` });
    }
    if (excludeId) {
      qb.andWhere('f.id != :excludeId', { excludeId });
    }

    const rows = await qb
      .orderBy('distance_km', 'ASC')
      .limit(limit)
      .getRawMany<Record<string, string | boolean | null>>();

    return rows
      .map((r) => ({
        id: String(r.id),
        facilityId: String(r.facilityId),
        facilityName: r.facilityName != null ? String(r.facilityName) : null,
        latitude: Number(r.lat),
        longitude: Number(r.lng),
        coordinatesCorrected: Boolean(r.corrected),
        distanceKm: Math.round(Number(r.distance_km) * 10) / 10,
        state: r.s_code ? { code: String(r.s_code), name: String(r.s_name) } : null,
        lga: r.l_code ? { code: String(r.l_code), name: String(r.l_name) } : null,
        ward: r.w_code ? { code: String(r.w_code), name: String(r.w_name) } : null,
        facilityType: r.ft_code
          ? { code: String(r.ft_code), name: String(r.ft_name) }
          : null,
        facilityLevel: r.fl_code
          ? { code: String(r.fl_code), name: String(r.fl_name) }
          : null,
        phoneNumber: r.phone_number != null ? String(r.phone_number) : null,
        emailAddress: r.email_address != null ? String(r.email_address) : null,
        website: r.website != null ? String(r.website) : null,
      }))
      .filter((r) => r.distanceKm <= radiusKm);
  }

  /**
   * Average facility coordinates grouped by state or LGA — data-derived map
   * centroids for area-level pins (e.g. pharmacies, which carry no point
   * coordinates of their own).
   */
  async getCentroids(by: 'state' | 'lga' = 'state') {
    const isState = by !== 'lga';
    const joinAlias = isState ? 'cs' : 'cl';
    const qb = this.facilityRepository
      .createQueryBuilder('f')
      .leftJoin(isState ? 'f.state' : 'f.lga', joinAlias)
      .select(`${joinAlias}.code`, 'code')
      .addSelect(`${joinAlias}.name`, 'name')
      .addSelect('AVG(f.latitude)', 'latitude')
      .addSelect('AVG(f.longitude)', 'longitude')
      .addSelect('COUNT(*)', 'facilityCount')
      .where(`${joinAlias}.id IS NOT NULL`)
      .andWhere('f.latitude IS NOT NULL')
      .andWhere('f.longitude IS NOT NULL')
      .groupBy(`${joinAlias}.id`)
      .addGroupBy(`${joinAlias}.code`)
      .addGroupBy(`${joinAlias}.name`)
      .orderBy(`${joinAlias}.name`, 'ASC');

    const rows = await qb.getRawMany<Record<string, string | null>>();
    return rows
      .filter((r) => r.code != null)
      .map((r) => ({
        code: String(r.code),
        name: r.name != null ? String(r.name) : String(r.code),
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        facilityCount: Number(r.facilityCount ?? 0),
      }));
  }

  async getWards() {
    return this.wardRepository.find({ order: { code: 'ASC' } });
  }

  /**
   * Distinct ward names (with parent LGA code) for locator filter dropdowns.
   * Derived from the facilities themselves — the wards table's own lgaCode/
   * stateCode hierarchy columns are unpopulated in this dataset, but each
   * facility's ward/LGA/state relations are real, so joining through the
   * facilities gives correctly state/LGA-scoped ward options.
   */
  async getWardOptions(
    search?: string,
    lgaCode?: string,
    stateCode?: string,
    limit = 50,
  ): Promise<{ name: string; lgaCode: string | null }[]> {
    const qb = this.facilityRepository
      .createQueryBuilder('f')
      .innerJoin('f.ward', 'w')
      .leftJoin('f.lga', 'l')
      .leftJoin('f.state', 's')
      .select('w.name', 'name')
      .addSelect('MIN(l.code)', 'lgaCode')
      .where("w.name IS NOT NULL AND w.name <> ''")
      .groupBy('w.name')
      // Numeric-code ward names (e.g. "13371") are common in the registry —
      // push them behind human-readable names when no search narrows them.
      .orderBy("(MIN(w.name) ~ '^[0-9]+$')", 'ASC')
      .addOrderBy('w.name', 'ASC')
      .limit(Math.min(Math.max(limit, 1), 200));
    const trimmed = search?.trim();
    if (trimmed) {
      qb.andWhere('w.name ILIKE :s', { s: `%${trimmed}%` });
    }
    if (lgaCode) {
      qb.andWhere('l.code = :lgaCode', { lgaCode });
    }
    if (stateCode) {
      qb.andWhere('s.code = :stateCode', { stateCode });
    }
    const rows = await qb.getRawMany<Record<string, string | null>>();
    return rows.map((r) => ({ name: String(r.name), lgaCode: r.lgaCode ?? null }));
  }

  async getLgas() {
    return this.lgaRepository.find({ order: { code: 'ASC' } });
  }

  async getFacilityTypes() {
    return this.facilityTypeRepository.find({ order: { code: 'ASC' } });
  }

  async getFacilityLevels() {
    return this.facilityLevelRepository.find({ order: { code: 'ASC' } });
  }

  async listFhirLocations(query: FhirLocationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const qb = this.facilityRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.state', 'state')
      .leftJoinAndSelect('f.lga', 'lga')
      .leftJoinAndSelect('f.ward', 'ward')
      .leftJoinAndSelect('f.facilityType', 'facilityType')
      .leftJoinAndSelect('f.facilityLevel', 'facilityLevel');

    if (query.identifier) {
      qb.andWhere('f.facilityId = :identifier', { identifier: query.identifier });
    }
    if (query.name) {
      qb.andWhere('f.facilityName ILIKE :name', { name: `%${query.name}%` });
    }
    if (query.type) {
      qb.andWhere('facilityType.code = :type', { type: query.type });
    }
    if (query['physical-type']) {
      qb.andWhere('facilityLevel.code = :level', { level: query['physical-type'] });
    }
    if (query.ward) {
      qb.andWhere('ward.code = :ward', { ward: query.ward });
    }
    if (query.lga) {
      qb.andWhere('lga.code = :lga', { lga: query.lga });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('f.facilityName', 'ASC')
      .getManyAndCount();

    const entries = data.map((facility) => ({
      fullUrl: `http://localhost:8004/api/v1/fhir/Location/${facility.id}`,
      resource: this.toFhirLocation(facility),
      search: {
        mode: 'match',
      },
    }));

    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total,
      entry: entries,
    };

    return bundle;
  }

  async getFhirLocation(id: string) {
    const facility = await this.getById(id);
    return this.toFhirLocation(facility);
  }

  toFhirLocation(facility: FacilityEntity) {
    const location: Record<string, any> = {
      resourceType: 'Location',
      id: facility.id,
      identifier: [
        {
          system: 'urn:oid:2.16.840.1.113883.3.1234',
          value: facility.facilityId,
        },
      ],
      status: 'active',
      name: facility.facilityName || '',
      description: facility.alternativeName || undefined,
      mode: 'instance',
      type: facility.facilityType
        ? [
            {
              coding: [
                {
                  system: 'urn:ietf:rfc:3986',
                  code: facility.facilityType.code,
                  display: facility.facilityType.name || '',
                },
              ],
            },
          ]
        : undefined,
      address: {
        district: facility.lga?.code || undefined,
        state: facility.state?.code || undefined,
      },
      physicalType: facility.facilityLevel
        ? {
            coding: [
              {
                system: 'urn:ietf:rfc:3986',
                code: facility.facilityLevel.code,
                display: facility.facilityLevel.name || '',
              },
            ],
          }
        : undefined,
      position: {
        latitude: facility.latitude ? Number(facility.latitude) : undefined,
        longitude: facility.longitude ? Number(facility.longitude) : undefined,
      },
      telecom: facility.phoneNumber
        ? [{ system: 'phone', value: facility.phoneNumber, use: 'work' }]
        : undefined,
    };

    if (facility.ward) {
      location.extension = [
        {
          url: 'http://example.org/fhir/StructureDefinition/ward',
          valueCode: facility.ward.code,
          valueString: facility.ward.name || undefined,
        },
      ];
    }

    return location;
  }
}
