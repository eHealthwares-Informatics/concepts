import { LgaEntity, StateEntity } from '../../facilities/entities';
export declare class DiagnosticCenterEntity {
    id: string;
    code: string;
    name: string | null;
    address: string | null;
    description: string | null;
    stateName: string | null;
    lgaName: string | null;
    openHours: string | null;
    rating: string | null;
    providerId: string | null;
    sourceUrl: string | null;
    state: StateEntity | null;
    stateId: string | null;
    lga: LgaEntity | null;
    lgaId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
