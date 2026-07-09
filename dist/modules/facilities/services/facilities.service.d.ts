import { Repository } from 'typeorm';
import { FacilityEntity, StateEntity, WardEntity, LgaEntity, FacilityTypeEntity, FacilityLevelEntity } from '../entities';
import { FacilityListQueryDto, FhirLocationQueryDto } from '../dto/facilities.dto';
export declare class FacilitiesService {
    private readonly facilityRepository;
    private readonly stateRepository;
    private readonly wardRepository;
    private readonly lgaRepository;
    private readonly facilityTypeRepository;
    private readonly facilityLevelRepository;
    constructor(facilityRepository: Repository<FacilityEntity>, stateRepository: Repository<StateEntity>, wardRepository: Repository<WardEntity>, lgaRepository: Repository<LgaEntity>, facilityTypeRepository: Repository<FacilityTypeEntity>, facilityLevelRepository: Repository<FacilityLevelEntity>);
    list(query: FacilityListQueryDto): Promise<{
        data: FacilityEntity[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(id: string): Promise<FacilityEntity>;
    getByCode(code: string): Promise<FacilityEntity>;
    getStates(): Promise<StateEntity[]>;
    getWards(): Promise<WardEntity[]>;
    getLgas(): Promise<LgaEntity[]>;
    getFacilityTypes(): Promise<FacilityTypeEntity[]>;
    getFacilityLevels(): Promise<FacilityLevelEntity[]>;
    listFhirLocations(query: FhirLocationQueryDto): Promise<{
        resourceType: string;
        type: string;
        total: number;
        entry: {
            fullUrl: string;
            resource: Record<string, any>;
            search: {
                mode: string;
            };
        }[];
    }>;
    getFhirLocation(id: string): Promise<Record<string, any>>;
    toFhirLocation(facility: FacilityEntity): Record<string, any>;
}
