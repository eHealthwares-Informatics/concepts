import { Repository } from 'typeorm';
import { PharmacyEntity } from '../entities';
import { LocalityRelationEntity } from '../../localities/entities';
import type { NearbyPharmacyType, PharmacyListQuery, PharmacyType } from '../types/pharmacies.types';
export declare class PharmaciesService {
    private readonly pharmacyRepo;
    private readonly relationRepo;
    constructor(pharmacyRepo: Repository<PharmacyEntity>, relationRepo: Repository<LocalityRelationEntity>);
    private baseQuery;
    list(query: PharmacyListQuery): Promise<{
        data: PharmacyType[];
        total: number;
        page: number;
        limit: number;
    }>;
    get(id: string): Promise<PharmacyType>;
    nearby(id: string, limit?: number): Promise<NearbyPharmacyType[]>;
}
