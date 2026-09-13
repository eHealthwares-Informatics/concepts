import { Repository } from 'typeorm';
import type { ManufacturerType } from '../types/drugs.types';
import { CreateManufacturerDto, ListManufacturersDto, UpdateManufacturerDto } from '../dto/manufacturers.dto';
import { ManufacturerEntity } from '../entities';
export declare class ManufacturersService {
    private readonly manufacturerRepository;
    constructor(manufacturerRepository: Repository<ManufacturerEntity>);
    list(query: ListManufacturersDto): Promise<{
        data: ManufacturerType[];
        total: number;
    }>;
    get(id: string): Promise<ManufacturerType>;
    create(payload: CreateManufacturerDto): Promise<ManufacturerType>;
    update(id: string, payload: UpdateManufacturerDto): Promise<ManufacturerType>;
    remove(id: string): Promise<void>;
}
