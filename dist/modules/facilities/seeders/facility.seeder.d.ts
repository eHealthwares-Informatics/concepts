import { Repository } from 'typeorm';
import { FacilitySheetsService } from '../../../common/services/facility-sheets.service';
import { ConceptCodingEntity, ConceptAttributeEntity, ConceptAttributeValueEntity } from '../../concepts/entities';
import { FacilityEntity } from '../entities/facility.entity';
import { FacilityAttributeEntity } from '../entities/facility-attribute.entity';
import { StateEntity } from '../entities/state.entity';
import { LgaEntity } from '../entities/lga.entity';
import { WardEntity } from '../entities/ward.entity';
import { FacilityTypeEntity } from '../entities/facility-type.entity';
import { FacilityLevelEntity } from '../entities/facility-level.entity';
export interface FacilitySeederResult {
    success: boolean;
    message: string;
    stats: {
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
    };
}
export declare class FacilitySeederService {
    private facilitySheetsService;
    private conceptCodeRepository;
    private attributeRepository;
    private valueRepository;
    private facilityRepository;
    private facilityAttributeRepository;
    private stateRepository;
    private lgaRepository;
    private wardRepository;
    private facilityTypeRepository;
    private facilityLevelRepository;
    private readonly logger;
    constructor(facilitySheetsService: FacilitySheetsService, conceptCodeRepository: Repository<ConceptCodingEntity>, attributeRepository: Repository<ConceptAttributeEntity>, valueRepository: Repository<ConceptAttributeValueEntity>, facilityRepository: Repository<FacilityEntity>, facilityAttributeRepository: Repository<FacilityAttributeEntity>, stateRepository: Repository<StateEntity>, lgaRepository: Repository<LgaEntity>, wardRepository: Repository<WardEntity>, facilityTypeRepository: Repository<FacilityTypeEntity>, facilityLevelRepository: Repository<FacilityLevelEntity>);
    seedFacilities(): Promise<FacilitySeederResult>;
    private resolveColumn;
    private collectDerivedCodes;
    private importReferenceData;
    private importDerivedCodes;
    private ensureHierarchyAttributes;
    private buildLookupMaps;
    private resolveFacilityId;
    private upsertFacility;
}
