import { Repository } from 'typeorm';
import { DiagnosticCenterEntity } from '../entities';
import type { DiagnosticCenterListQuery, DiagnosticCenterType } from '../types/diagnostic-centers.types';
export declare class DiagnosticCentersService {
    private readonly centerRepo;
    constructor(centerRepo: Repository<DiagnosticCenterEntity>);
    private baseQuery;
    list(query: DiagnosticCenterListQuery): Promise<{
        data: DiagnosticCenterType[];
        total: number;
        page: number;
        limit: number;
    }>;
    get(id: string): Promise<DiagnosticCenterType>;
    nearby(id: string, limit?: number): Promise<Array<DiagnosticCenterType & {
        nearbyTier: string;
    }>>;
}
