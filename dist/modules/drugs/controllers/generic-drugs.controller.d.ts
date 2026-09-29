import { ListGenericDrugsDto } from '../dto/generic-drugs.dto';
import { GenericDrugsService } from '../services/generic-drugs.service';
import type { GenericDrugType } from '../types/drugs.types';
export declare class GenericDrugsController {
    private readonly service;
    constructor(service: GenericDrugsService);
    list(query: ListGenericDrugsDto): Promise<{
        data: GenericDrugType[];
        meta: {
            total: number;
        };
    }>;
    getByCode(code: string): Promise<{
        data: GenericDrugType;
    }>;
    get(id: string): Promise<{
        data: GenericDrugType;
    }>;
}
