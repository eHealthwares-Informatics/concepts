import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacilityEntity } from '../entities/facility.entity';
import { ConceptAttributeValueEntity } from '../../concepts/entities/concept-attribute-value.entity';
import { ConceptCodingEntity } from '../../concepts/entities/concept-coding.entity';
import { ConceptAttributeEntity } from '../../concepts/entities/concept-attribute.entity';
import { StateEntity } from '../entities/state.entity';
import { LgaEntity } from '../entities/lga.entity';
import { WardEntity } from '../entities/ward.entity';
import { CodingConcept } from '../../../common/enums/concept.enum';

export interface FacilitySeedRecord {
  facilityId?: string;
  unique_id?: string;
  facility_name?: string;
  alt_facility_name?: string;
  registration_no?: string;
  state_code?: string;
  lga_code?: string;
  ward_code?: string;
  facility_type_id?: string;
  facility_level_code?: string;
  ownership_code?: string;
  ownership_type_code?: string;
  operational_status_id?: string;
  registration_status_code?: string;
  license_status_code?: string;
  latitude?: string;
  longitude?: string;
  phone_number?: string;
  alternate_number?: string;
  email_address?: string;
  website?: string;
  outpatient?: string;
  inpatient?: string;
  physical_location?: string;
  [key: string]: string | undefined;
}

export interface FacilitySeedStats {
  statesCreated: number;
  lgasCreated: number;
  wardsCreated: number;
  facilityTypesCreated: number;
  facilityLevelsCreated: number;
  derivedCodesCreated: number;
  facilitiesCreated: number;
  facilitiesUpdated: number;
  facilityAttributesCreated: number;
  errors: string[];
}

export interface FacilitySeedResult {
  success: boolean;
  message: string;
  stats: FacilitySeedStats;
}

@Injectable()
export class FacilitySeederService {
  private readonly logger = new Logger(FacilitySeederService.name);

  constructor(
    @InjectRepository(FacilityEntity)
    private readonly facilityRepo: Repository<FacilityEntity>,
    @InjectRepository(ConceptCodingEntity)
    private readonly conceptCodeRepo: Repository<ConceptCodingEntity>,
    @InjectRepository(ConceptAttributeEntity)
    private readonly attributeRepo: Repository<ConceptAttributeEntity>,
    @InjectRepository(ConceptAttributeValueEntity)
    private readonly valueRepo: Repository<ConceptAttributeValueEntity>,
    @InjectRepository(StateEntity)
    private readonly stateRepo: Repository<StateEntity>,
    @InjectRepository(LgaEntity)
    private readonly lgaRepo: Repository<LgaEntity>,
    @InjectRepository(WardEntity)
    private readonly wardRepo: Repository<WardEntity>,
  ) {}

  async seedFacilities(records: FacilitySeedRecord[] = []): Promise<FacilitySeedResult> {
    const stats: FacilitySeedStats = {
      statesCreated: 0,
      lgasCreated: 0,
      wardsCreated: 0,
      facilityTypesCreated: 0,
      facilityLevelsCreated: 0,
      derivedCodesCreated: 0,
      facilitiesCreated: 0,
      facilitiesUpdated: 0,
      facilityAttributesCreated: 0,
      errors: [],
    };

    for (const record of records) {
      try {
        await this.upsertFacility(record, stats);
      } catch (err) {
        stats.errors.push(`${record.facilityId ?? record.unique_id ?? '<unknown>'}: ${err}`);
        this.logger.error(`Failed to seed facility ${record.facilityId ?? record.unique_id ?? '<unknown>'}: ${err}`);
      }
    }

    const success = stats.errors.length === 0;
    return {
      success,
      message: success
        ? `Seeded ${stats.facilitiesCreated + stats.facilitiesUpdated} facilities (${stats.facilitiesCreated} created, ${stats.facilitiesUpdated} updated) with ${stats.facilityAttributesCreated} attributes`
        : `Facility seeding completed with ${stats.errors.length} error(s)`,
      stats,
    };
  }

  private async upsertFacility(row: FacilitySeedRecord, stats: FacilitySeedStats): Promise<FacilityEntity> {
    const facilityId = row.facilityId ?? row.unique_id ?? undefined;
    if (!facilityId) {
      throw new Error('facilityId or unique_id is required');
    }

    const facilityName = row.facility_name ?? '';
    if (!facilityName) {
      throw new Error(`facility_name missing for ${facilityId}`);
    }

    const existing = await this.facilityRepo.findOne({ where: { facilityId } });
    if (existing) {
      return this.updateFacility(existing, row, stats);
    }
    return this.createFacility(row, stats);
  }

  private async createFacility(row: FacilitySeedRecord, stats: FacilitySeedStats): Promise<FacilityEntity> {
    const facility = this.facilityRepo.create({
      facilityId: row.facilityId ?? row.unique_id ?? undefined,
      uniqueId: row.unique_id ?? undefined,
      facilityName: row.facility_name ?? undefined,
      alternativeName: row.alt_facility_name ?? undefined,
      registrationNo: row.registration_no ?? undefined,
      registrationStatus: row.registration_status_code ?? row.registration_no ? undefined : undefined,
      emailAddress: row.email_address ?? undefined,
      phoneNumber: row.phone_number ?? undefined,
      ownershipCode: row.ownership_code ?? undefined,
      ownershipTypeCode: row.ownership_type_code ?? undefined,
      operationalStatusCode: row.operational_status_id ?? undefined,
      licenseStatus: row.license_status_code ?? undefined,
      latitude: row.latitude != null ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude != null ? parseFloat(row.longitude) : undefined,
      website: row.website ?? undefined,
      alternateNumber: row.alternate_number ?? undefined,
      outpatient: row.outpatient ? row.outpatient === '1' || row.outpatient === 'true' || row.outpatient === 'yes' : false,
      inpatient: row.inpatient ? row.inpatient === '1' || row.inpatient === 'true' || row.inpatient === 'yes' : false,
      state: row.state_code ? { id: row.state_code } as any : undefined,
      lga: row.lga_code ? { id: row.lga_code } as any : undefined,
      ward: row.ward_code ? { id: row.ward_code } as any : undefined,
      facilityType: row.facility_type_id ? { id: row.facility_type_id } as any : undefined,
      facilityLevel: row.facility_level_code ? { id: row.facility_level_code } as any : undefined,
    });
    const saved = await this.facilityRepo.save(facility);
    stats.facilitiesCreated++;
    return saved;
  }

  private async updateFacility(facility: FacilityEntity, row: FacilitySeedRecord, stats: FacilitySeedStats): Promise<FacilityEntity> {
    facility.facilityName = row.facility_name ?? facility.facilityName;
    facility.alternativeName = row.alt_facility_name ?? facility.alternativeName;
    facility.registrationNo = row.registration_no ?? facility.registrationNo;
    facility.registrationStatus = row.registration_status_code ?? facility.registrationStatus;
    facility.emailAddress = row.email_address ?? facility.emailAddress;
    facility.phoneNumber = row.phone_number ?? facility.phoneNumber;
    facility.ownershipCode = row.ownership_code ?? facility.ownershipCode;
    facility.ownershipTypeCode = row.ownership_type_code ?? facility.ownershipTypeCode;
    facility.operationalStatusCode = row.operational_status_id ?? facility.operationalStatusCode;
    facility.licenseStatus = row.license_status_code ?? facility.licenseStatus;
    facility.latitude = row.latitude != null ? parseFloat(row.latitude) : facility.latitude;
    facility.longitude = row.longitude != null ? parseFloat(row.longitude) : facility.longitude;
    facility.website = row.website ?? facility.website;
    facility.alternateNumber = row.alternate_number ?? facility.alternateNumber;
    facility.outpatient = row.outpatient ? row.outpatient === '1' || row.outpatient === 'true' || row.outpatient === 'yes' : facility.outpatient;
    facility.inpatient = row.inpatient ? row.inpatient === '1' || row.inpatient === 'true' || row.inpatient === 'yes' : facility.inpatient;

    if (row.state_code) {
      const state = await this.stateRepo.findOne({ where: { code: row.state_code } });
      facility.state = state ? { id: state.id } as any : facility.state;
    }
    if (row.lga_code) {
      const lga = await this.lgaRepo.findOne({ where: { code: row.lga_code } });
      facility.lga = lga ? { id: lga.id } as any : facility.lga;
    }
    if (row.ward_code) {
      const ward = await this.wardRepo.findOne({ where: { code: row.ward_code } });
      facility.ward = ward ? { id: ward.id } as any : facility.ward;
    }
    if (row.facility_type_id) {
      facility.facilityType = { id: row.facility_type_id } as any;
    }
    if (row.facility_level_code) {
      facility.facilityLevel = { id: row.facility_level_code } as any;
    }

    stats.facilitiesUpdated++;
    return facility;
  }

  private async upsertAttributes(facility: FacilityEntity, row: FacilitySeedRecord, stats: FacilitySeedStats): Promise<void> {
    const coding = await this.ensureFacilityCoding(facility.id);
    const fields = new Set([
      'ownership_code', 'ownership_type_code', 'operational_status_id',
      'registration_status_code', 'license_status_code', 'latitude', 'longitude',
      'phone_number', 'alternate_number', 'email_address', 'website',
      'outpatient', 'inpatient', 'physical_location', 'facility_level_code',
      'facility_type_id',
    ]);

    const values: ConceptAttributeValueEntity[] = [];
    for (const [key, value] of Object.entries(row)) {
      if (!value || value.trim() === '') continue;
      if (!fields.has(key)) continue;

      const attrDef = await this.resolveAttributeDef(key);
      values.push(this.valueRepo.create({
        concept: CodingConcept.FACILITY,
        conceptCode: coding,
        facility: { id: facility.id } as any,
        attribute: attrDef,
        value: value,
      }));
    }
    if (values.length > 0) {
      await this.valueRepo.save(values);
      stats.facilityAttributesCreated += values.length;
    }
  }

  private async ensureFacilityCoding(facilityId: string): Promise<ConceptCodingEntity> {
    let coding = await this.conceptCodeRepo.findOne({
      where: { concept: CodingConcept.FACILITY, code: facilityId },
    });
    if (!coding) {
      coding = this.conceptCodeRepo.create({
        concept: CodingConcept.FACILITY,
        code: facilityId,
      });
      coding = await this.conceptCodeRepo.save(coding);
    }
    return coding;
  }

  private async resolveAttributeDef(key: string): Promise<ConceptAttributeEntity> {
    const normalized = key.toLowerCase().replace(/\s+/g, '_');
    let attr = await this.attributeRepo.findOne({
      where: { concept: CodingConcept.FACILITY, code: normalized },
    });
    if (!attr) {
      attr = this.attributeRepo.create({
        concept: CodingConcept.FACILITY,
        code: normalized,
        name: normalized,
        dataType: 'string',
      });
      attr = await this.attributeRepo.save(attr);
    }
    return attr;
  }
}
