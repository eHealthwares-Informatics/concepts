import { ListDrugClassificationsDto } from '../dto/drug-classifications.dto';
import { DrugClassificationsService } from '../services/drug-classifications.service';
import type { DrugClassificationType } from '../types/drugs.types';
export declare class DrugClassificationsController {
    private readonly service;
    constructor(service: DrugClassificationsService);
    list(query: ListDrugClassificationsDto): Promise<{
        data: DrugClassificationType[];
        meta: {
            total: number;
        };
    }>;
    getByCode(code: string): Promise<{
        data: DrugClassificationType;
    }>;
    relations(id: string): Promise<{
        data: {
            genericDrugs: {
                id: string;
                code: string;
                name: string;
            }[];
            genericProducts: {
                id: string;
                code: string;
                name: string;
            }[];
        };
    }>;
    get(id: string): Promise<{
        data: DrugClassificationType;
    }>;
}
