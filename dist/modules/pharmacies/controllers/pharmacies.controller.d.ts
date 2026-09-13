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
    nearby(pharmacyId: string, limit?: string): Promise<{
        data: import("../types/pharmacies.types").NearbyPharmacyType[];
    }>;
    get(pharmacyId: string): Promise<{
        data: import("../types/pharmacies.types").PharmacyType;
    }>;
}
