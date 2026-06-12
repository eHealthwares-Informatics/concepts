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
    if (query.ward) {
      qb.andWhere('w.code = :ward', {
        ward: query.ward,
      });
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

  async getWards() {
    return this.wardRepository.find({ order: { code: 'ASC' } });
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
      fullUrl: `http://localhost:3013/api/v1/fhir/Location/${facility.id}`,
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
