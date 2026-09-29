import { Repository } from 'typeorm';
import { ListGenericDrugsDto } from '../dto/generic-drugs.dto';
import { GenericDrugEntity } from '../entities';
import type { GenericDrugType } from '../types/drugs.types';
export declare class GenericDrugsService {
    private readonly repo;
    constructor(repo: Repository<GenericDrugEntity>);
    list(query: ListGenericDrugsDto): Promise<{
        data: GenericDrugType[];
        total: number;
    }>;
    getByCode(code: string): Promise<GenericDrugType>;
    get(id: string): Promise<GenericDrugType>;
    private withClassifications;
}
