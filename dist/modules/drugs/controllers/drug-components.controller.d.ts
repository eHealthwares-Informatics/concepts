import { CreateDrugComponentDto, ListDrugComponentsDto, UpdateDrugComponentDto } from '../dto/drug-components.dto';
import { DrugComponentsService } from '../services/drug-components.service';
export declare class DrugComponentsController {
    private readonly drugComponentsService;
    constructor(drugComponentsService: DrugComponentsService);
    list(query: ListDrugComponentsDto): Promise<{
        data: import("../types/drugs.types").DrugComponentType[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(drugComponentId: string): Promise<{
        data: import("../types/drugs.types").DrugComponentType;
    }>;
    create(payload: CreateDrugComponentDto): Promise<{
        data: import("../types/drugs.types").DrugComponentType;
    }>;
    replace(drugComponentId: string, payload: UpdateDrugComponentDto): Promise<{
        data: import("../types/drugs.types").DrugComponentType;
    }>;
    patch(drugComponentId: string, payload: UpdateDrugComponentDto): Promise<{
        data: import("../types/drugs.types").DrugComponentType;
    }>;
    remove(drugComponentId: string): Promise<void>;
}
