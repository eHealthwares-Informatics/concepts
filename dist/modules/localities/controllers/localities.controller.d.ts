import { LocalitiesService } from '../services/localities.service';
export declare class LocalitiesController {
    private readonly localitiesService;
    constructor(localitiesService: LocalitiesService);
    list(query: Record<string, any>): Promise<{
        data: import("../types/localities.types").LocalityType[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    options(type?: string, search?: string, limit?: string): Promise<{
        data: {
            id: string;
            name: string;
            type: string;
        }[];
    }>;
    nearby(localityId: string, limit?: string): Promise<{
        data: import("../types/localities.types").NearbyLocalityType[];
    }>;
    get(localityId: string): Promise<{
        data: import("../types/localities.types").LocalityType;
    }>;
}
