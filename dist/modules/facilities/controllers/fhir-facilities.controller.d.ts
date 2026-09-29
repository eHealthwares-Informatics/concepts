import { FacilitiesService } from '../services/facilities.service';
import { FhirLocationQueryDto } from '../dto/facilities.dto';
export declare class FhirFacilitiesController {
    private readonly facilitiesService;
    constructor(facilitiesService: FacilitiesService);
    searchLocations(query: FhirLocationQueryDto): Promise<{
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
    getLocation(id: string): Promise<Record<string, any>>;
}
