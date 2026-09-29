export declare class ImportTrackingEntity {
    id: string;
    concept: string;
    revision: string;
    totalRowsProcessed: number;
    rowsAdded: number;
    rowsModified: number;
    rowsDeleted: number;
    status: string;
    errorMessage?: string;
    notes?: string;
    timestamp: Date;
    triggeredBy?: string;
}
