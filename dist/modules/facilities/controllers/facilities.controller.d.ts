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
    nearby(lat: string, lng: string, radius?: string, limit?: string): Promise<{
        data: {
            id: string;
            facilityId: string;
            facilityName: string | null;
            latitude: number;
            longitude: number;
            coordinatesCorrected: boolean;
            distanceKm: number;
            state: {
                code: string;
                name: string;
            } | null;
            lga: {
                code: string;
                name: string;
            } | null;
            ward: {
                code: string;
                name: string;
            } | null;
            facilityType: {
                code: string;
                name: string;
            } | null;
            facilityLevel: {
                code: string;
                name: string;
            } | null;
            phoneNumber: string | null;
            emailAddress: string | null;
            website: string | null;
        }[];
    }>;
    listCentroids(by?: 'state' | 'lga'): Promise<{
        data: {
            code: string;
            name: string;
            latitude: number;
            longitude: number;
            facilityCount: number;
        }[];
    }>;
    listWards(): Promise<{
        data: import("../entities").WardEntity[];
    }>;
    listWardOptions(search?: string, lga?: string, state?: string, limit?: string): Promise<{
        data: {
            name: string;
            lgaCode: string | null;
        }[];
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
    nearbyFacility(facilityId: string, radius?: string, limit?: string, nameLike?: string): Promise<{
        data: {
            id: string;
            facilityId: string;
            facilityName: string | null;
            latitude: number;
            longitude: number;
            coordinatesCorrected: boolean;
            distanceKm: number;
            state: {
                code: string;
                name: string;
            } | null;
            lga: {
                code: string;
                name: string;
            } | null;
            ward: {
                code: string;
                name: string;
            } | null;
            facilityType: {
                code: string;
                name: string;
            } | null;
            facilityLevel: {
                code: string;
                name: string;
            } | null;
            phoneNumber: string | null;
            emailAddress: string | null;
            website: string | null;
        }[];
    }>;
    getById(id: string): Promise<{
        data: FacilityEntity;
    }>;
}
