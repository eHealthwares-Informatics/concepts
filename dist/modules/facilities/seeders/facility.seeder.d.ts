import { Repository } from 'typeorm';
import { FacilityEntity } from '../entities/facility.entity';
import { ConceptAttributeValueEntity } from '../../concepts/entities/concept-attribute-value.entity';
import { ConceptCodingEntity } from '../../concepts/entities/concept-coding.entity';
import { ConceptAttributeEntity } from '../../concepts/entities/concept-attribute.entity';
import { StateEntity } from '../entities/state.entity';
import { LgaEntity } from '../entities/lga.entity';
import { WardEntity } from '../entities/ward.entity';
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
export declare class FacilitySeederService {
    private readonly facilityRepo;
    private readonly conceptCodeRepo;
    private readonly attributeRepo;
    private readonly valueRepo;
    private readonly stateRepo;
    private readonly lgaRepo;
    private readonly wardRepo;
    private readonly logger;
    constructor(facilityRepo: Repository<FacilityEntity>, conceptCodeRepo: Repository<ConceptCodingEntity>, attributeRepo: Repository<ConceptAttributeEntity>, valueRepo: Repository<ConceptAttributeValueEntity>, stateRepo: Repository<StateEntity>, lgaRepo: Repository<LgaEntity>, wardRepo: Repository<WardEntity>);
    seedFacilities(records?: FacilitySeedRecord[]): Promise<FacilitySeedResult>;
    private upsertFacility;
    private createFacility;
    private updateFacility;
    private upsertAttributes;
    private ensureFacilityCoding;
    private resolveAttributeDef;
}
