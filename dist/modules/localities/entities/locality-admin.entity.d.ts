import { LocalityEntity } from './locality.entity';
import { LgaEntity, StateEntity, WardEntity } from '../../facilities/entities';
export declare class LocalityAdminEntity {
    id: string;
    locality: LocalityEntity;
    localityId: string;
    state: StateEntity | null;
    stateId: string | null;
    lga: LgaEntity | null;
    lgaId: string | null;
    ward: WardEntity | null;
    wardId: string | null;
    pharmacyCount: number;
    createdAt: Date;
    updatedAt: Date;
}
