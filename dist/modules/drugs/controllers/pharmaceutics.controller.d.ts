import { CreatePharmaceuticsDto, ListPharmaceuticsDto, UpdatePharmaceuticsDto } from '../dto/pharmaceutics.dto';
import { PharmaceuticsService } from '../services/pharmaceutics.service';
export declare class PharmaceuticsController {
    private readonly pharmaceuticsService;
    constructor(pharmaceuticsService: PharmaceuticsService);
    list(query: ListPharmaceuticsDto): Promise<{
        data: import("../types/drugs.types").PharmaceuticsType[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(pharmaceuticsId: string): Promise<{
        data: import("../types/drugs.types").PharmaceuticsType;
    }>;
    create(payload: CreatePharmaceuticsDto): Promise<{
        data: import("../types/drugs.types").PharmaceuticsType;
    }>;
    replace(pharmaceuticsId: string, payload: UpdatePharmaceuticsDto): Promise<{
        data: import("../types/drugs.types").PharmaceuticsType;
    }>;
    patch(pharmaceuticsId: string, payload: UpdatePharmaceuticsDto): Promise<{
        data: import("../types/drugs.types").PharmaceuticsType;
    }>;
    remove(pharmaceuticsId: string): Promise<void>;
}
