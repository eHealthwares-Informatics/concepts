import { FacilitiesService } from '../services/facilities.service';
import { FacilityListQueryDto } from '../dto/facilities.dto';
import { FacilityEntity } from '../entities/facility.entity';
export declare class FacilitiesController {
    private readonly facilitiesService;
    constructor(facilitiesService: FacilitiesService);
    list(query: FacilityListQueryDto): Promise<{
        data: FacilityEntity[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getByCode(code: string): Promise<{
        data: FacilityEntity;
    }>;
    listStates(): Promise<{
        data: import("../entities").StateEntity[];
    }>;
    listWards(): Promise<{
        data: import("../entities").WardEntity[];
    }>;
    listLgas(): Promise<{
        data: import("../entities").LgaEntity[];
    }>;
    listFacilityTypes(): Promise<{
        data: import("../entities").FacilityTypeEntity[];
    }>;
    listFacilityLevels(): Promise<{
        data: import("../entities").FacilityLevelEntity[];
    }>;
    getById(id: string): Promise<{
        data: FacilityEntity;
    }>;
}
