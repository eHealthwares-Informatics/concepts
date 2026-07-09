import { Repository } from 'typeorm';
import type { GenericProductType } from '../types/drugs.types';
import { CreateGenericProductDto, ListGenericProductsDto, UpdateGenericProductDto } from '../dto/generic-products.dto';
import { GenericProductEntity, PharmaceuticsEntity } from '../entities';
export declare class GenericProductsService {
    private readonly genericProductRepository;
    private readonly pharmaceuticsRepository;
    constructor(genericProductRepository: Repository<GenericProductEntity>, pharmaceuticsRepository: Repository<PharmaceuticsEntity>);
    list(query: ListGenericProductsDto): Promise<{
        data: GenericProductType[];
        total: number;
    }>;
    get(id: string): Promise<GenericProductType>;
    getByCode(code: string): Promise<GenericProductType>;
    create(payload: CreateGenericProductDto): Promise<GenericProductType>;
    update(id: string, payload: UpdateGenericProductDto): Promise<GenericProductType>;
    remove(id: string): Promise<void>;
    searchAll(): Promise<GenericProductType[]>;
}
