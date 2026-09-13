import { CreateManufacturerDto, ListManufacturersDto, UpdateManufacturerDto } from '../dto/manufacturers.dto';
import { ManufacturersService } from '../services/manufacturers.service';
export declare class ManufacturersController {
    private readonly manufacturersService;
    constructor(manufacturersService: ManufacturersService);
    list(query: ListManufacturersDto): Promise<{
        data: import("../types/drugs.types").ManufacturerType[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(manufacturerId: string): Promise<{
        data: import("../types/drugs.types").ManufacturerType;
    }>;
    create(payload: CreateManufacturerDto): Promise<{
        data: import("../types/drugs.types").ManufacturerType;
    }>;
    replace(manufacturerId: string, payload: UpdateManufacturerDto): Promise<{
        data: import("../types/drugs.types").ManufacturerType;
    }>;
    patch(manufacturerId: string, payload: UpdateManufacturerDto): Promise<{
        data: import("../types/drugs.types").ManufacturerType;
    }>;
    remove(manufacturerId: string): Promise<void>;
}
