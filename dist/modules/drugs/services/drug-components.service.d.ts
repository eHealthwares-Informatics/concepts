import { Repository } from 'typeorm';
import type { DrugComponentType } from '../types/drugs.types';
import { CreateDrugComponentDto, ListDrugComponentsDto, UpdateDrugComponentDto } from '../dto/drug-components.dto';
import { DrugComponentEntity } from '../entities';
export declare class DrugComponentsService {
    private readonly drugComponentRepository;
    constructor(drugComponentRepository: Repository<DrugComponentEntity>);
    list(query: ListDrugComponentsDto): Promise<{
        data: DrugComponentType[];
        total: number;
    }>;
    get(id: string): Promise<DrugComponentType>;
    create(payload: CreateDrugComponentDto): Promise<DrugComponentType>;
    update(id: string, payload: UpdateDrugComponentDto): Promise<DrugComponentType>;
    remove(id: string): Promise<void>;
}
