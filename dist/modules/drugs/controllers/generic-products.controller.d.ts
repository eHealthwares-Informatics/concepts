import { CreateGenericProductDto, ListGenericProductsDto, UpdateGenericProductDto } from '../dto/generic-products.dto';
import { GenericProductsService } from '../services/generic-products.service';
export declare class GenericProductsController {
    private readonly genericProductsService;
    constructor(genericProductsService: GenericProductsService);
    list(query: ListGenericProductsDto): Promise<{
        data: import("../types/drugs.types").GenericProductType[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    search(query: ListGenericProductsDto): Promise<{
        data: {
            id: string;
            code: string;
            name: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getByCode(code: string): Promise<{
        data: import("../types/drugs.types").GenericProductType;
    }>;
    get(genericProductId: string): Promise<{
        data: import("../types/drugs.types").GenericProductType;
    }>;
    create(payload: CreateGenericProductDto): Promise<{
        data: import("../types/drugs.types").GenericProductType;
    }>;
    replace(genericProductId: string, payload: UpdateGenericProductDto): Promise<{
        data: import("../types/drugs.types").GenericProductType;
    }>;
    patch(genericProductId: string, payload: UpdateGenericProductDto): Promise<{
        data: import("../types/drugs.types").GenericProductType;
    }>;
    remove(genericProductId: string): Promise<void>;
}
