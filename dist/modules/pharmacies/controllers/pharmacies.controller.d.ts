import { PharmaciesService } from '../services/pharmacies.service';
export declare class PharmaciesController {
    private readonly pharmaciesService;
    constructor(pharmaciesService: PharmaciesService);
    list(query: Record<string, any>): Promise<{
        data: import("../types/pharmacies.types").PharmacyType[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    nearbyCoordinates(lat: string, lng: string, radius?: string, limit?: string): Promise<{
        data: {
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
        }[];
    }>;
    nearby(pharmacyId: string, limit?: string): Promise<{
        data: import("../types/pharmacies.types").NearbyPharmacyType[];
    }>;
    get(pharmacyId: string): Promise<{
        data: import("../types/pharmacies.types").PharmacyType;
    }>;
}
