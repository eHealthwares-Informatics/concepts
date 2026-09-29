import { Repository } from 'typeorm';
import { DrugComponentEntity, GenericProductEntity, PharmaceuticsEntity } from '../entities';
export interface DrugSeederResult {
    success: boolean;
    message: string;
    stats: {
        drugComponents: number;
        pharmaceutics: number;
        genericProducts: number;
    };
}
export declare class DrugSeederService {
    private readonly componentRepository;
    private readonly pharmaceuticsRepository;
    private readonly genericRepository;
    private readonly logger;
    constructor(componentRepository: Repository<DrugComponentEntity>, pharmaceuticsRepository: Repository<PharmaceuticsEntity>, genericRepository: Repository<GenericProductEntity>);
    seedDrugs(): Promise<DrugSeederResult>;
    private loadCaches;
}
