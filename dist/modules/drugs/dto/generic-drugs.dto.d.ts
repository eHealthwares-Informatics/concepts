export declare class ListGenericDrugsDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    get offset(): number;
}
