import { CreateFormulationDto, ListFormulationsDto, UpdateFormulationDto } from '../dto/formulations.dto';
import { FormulationsService } from '../services/formulations.service';
export declare class FormulationsController {
    private readonly formulationsService;
    constructor(formulationsService: FormulationsService);
    list(query: ListFormulationsDto): Promise<{
        data: import("../types/drugs.types").FormulationType[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(formulationId: string): Promise<{
        data: import("../types/drugs.types").FormulationType;
    }>;
    create(payload: CreateFormulationDto): Promise<{
        data: import("../types/drugs.types").FormulationType;
    }>;
    replace(formulationId: string, payload: UpdateFormulationDto): Promise<{
        data: import("../types/drugs.types").FormulationType;
    }>;
    patch(formulationId: string, payload: UpdateFormulationDto): Promise<{
        data: import("../types/drugs.types").FormulationType;
    }>;
    remove(formulationId: string): Promise<void>;
}
