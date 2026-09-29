import { Repository } from 'typeorm';
import { LocalityEntity, LocalityRelationEntity } from '../entities';
import type { LocalityListQuery, LocalityType, NearbyLocalityType } from '../types/localities.types';
export declare class LocalitiesService {
    private readonly localityRepo;
    private readonly relationRepo;
    constructor(localityRepo: Repository<LocalityEntity>, relationRepo: Repository<LocalityRelationEntity>);
    list(query: LocalityListQuery): Promise<{
        data: LocalityType[];
        total: number;
        page: number;
        limit: number;
    }>;
    get(id: string): Promise<LocalityType>;
    getOptions(type?: string, search?: string, limit?: number): Promise<{
        id: string;
        name: string;
        type: string;
    }[]>;
    nearby(id: string, limit?: number): Promise<NearbyLocalityType[]>;
}
