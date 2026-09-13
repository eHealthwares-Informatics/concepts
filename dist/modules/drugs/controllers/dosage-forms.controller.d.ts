import { CreateDosageFormDto, ListDosageFormsDto, UpdateDosageFormDto } from '../dto/dosage-forms.dto';
import { DosageFormsService } from '../services/dosage-forms.service';
export declare class DosageFormsController {
    private readonly dosageFormsService;
    constructor(dosageFormsService: DosageFormsService);
    list(query: ListDosageFormsDto): Promise<{
        data: import("../types/drugs.types").DosageFormType[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(dosageFormId: string): Promise<{
        data: import("../types/drugs.types").DosageFormType;
    }>;
    create(payload: CreateDosageFormDto): Promise<{
        data: import("../types/drugs.types").DosageFormType;
    }>;
    replace(dosageFormId: string, payload: UpdateDosageFormDto): Promise<{
        data: import("../types/drugs.types").DosageFormType;
    }>;
    patch(dosageFormId: string, payload: UpdateDosageFormDto): Promise<{
        data: import("../types/drugs.types").DosageFormType;
    }>;
    remove(dosageFormId: string): Promise<void>;
}
