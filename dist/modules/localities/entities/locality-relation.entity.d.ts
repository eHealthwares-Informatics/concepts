import { LocalityEntity } from './locality.entity';
export declare class LocalityRelationEntity {
    id: string;
    locality: LocalityEntity;
    localityId: string;
    relatedLocality: LocalityEntity | null;
    relatedLocalityId: string | null;
    kind: string;
    tier: string | null;
    distanceKm: number | null;
    pharmacyCount: number;
    createdAt: Date;
    updatedAt: Date;
}
