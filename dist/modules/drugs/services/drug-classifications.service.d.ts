import { Repository } from 'typeorm';
import { ListDrugClassificationsDto } from '../dto/drug-classifications.dto';
import { DrugClassificationEntity } from '../entities';
import type { DrugClassificationType } from '../types/drugs.types';
export declare class DrugClassificationsService {
    private readonly repo;
    constructor(repo: Repository<DrugClassificationEntity>);
    allowSort: Set<string>;
    list(query: ListDrugClassificationsDto): Promise<{
        data: DrugClassificationType[];
        total: number;
    }>;
    getByCode(code: string): Promise<DrugClassificationType>;
    get(id: string): Promise<DrugClassificationType>;
    getRelations(id: string): Promise<{
        genericDrugs: Array<{
            id: string;
            code: string;
            name: string;
        }>;
        genericProducts: Array<{
            id: string;
            code: string;
            name: string;
        }>;
    }>;
}
