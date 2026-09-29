import { DiagnosticCentersService } from '../services/diagnostic-centers.service';
export declare class DiagnosticCentersController {
    private readonly centersService;
    constructor(centersService: DiagnosticCentersService);
    list(query: Record<string, any>): Promise<{
        data: import("../types/diagnostic-centers.types").DiagnosticCenterType[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    nearby(id: string, limit?: string): Promise<{
        data: (import("../types/diagnostic-centers.types").DiagnosticCenterType & {
            nearbyTier: string;
        })[];
    }>;
    get(id: string): Promise<{
        data: import("../types/diagnostic-centers.types").DiagnosticCenterType;
    }>;
}
