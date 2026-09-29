export declare class LocalityEntity {
    id: string;
    code: string;
    type: string;
    name: string;
    gazetteerWardCode: string | null;
    lon: number | null;
    lat: number | null;
    pharmacyCount: number;
    source: string | null;
    confidence: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
