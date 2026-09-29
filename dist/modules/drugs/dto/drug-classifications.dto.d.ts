export declare class ListDrugClassificationsDto {
    page?: number;
    limit?: number;
    type?: 'therapeutic' | 'pharmaceutical' | 'ndf_therapeutic' | 'ndf_pharmaceutical';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    get offset(): number;
}
