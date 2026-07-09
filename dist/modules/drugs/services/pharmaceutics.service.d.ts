import { Repository } from 'typeorm';
import type { PharmaceuticsType } from '../types/drugs.types';
import { CreatePharmaceuticsDto, ListPharmaceuticsDto, UpdatePharmaceuticsDto } from '../dto/pharmaceutics.dto';
import { DrugComponentEntity, PharmaceuticsEntity } from '../entities';
export declare class PharmaceuticsService {
    private readonly pharmaceuticsRepository;
    private readonly drugComponentRepository;
    constructor(pharmaceuticsRepository: Repository<PharmaceuticsEntity>, drugComponentRepository: Repository<DrugComponentEntity>);
    list(query: ListPharmaceuticsDto): Promise<{
        data: PharmaceuticsType[];
        total: number;
    }>;
    get(id: string): Promise<PharmaceuticsType>;
    getByCode(code: string): Promise<PharmaceuticsType>;
    create(payload: CreatePharmaceuticsDto): Promise<PharmaceuticsType>;
    update(id: string, payload: UpdatePharmaceuticsDto): Promise<PharmaceuticsType>;
    remove(id: string): Promise<void>;
    private resolveDrugComponents;
}
