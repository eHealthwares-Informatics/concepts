export declare class ListDosageFormsDto {
    page?: number;
    limit?: number;
    search?: string;
    get offset(): number;
}
export declare class CreateDosageFormDto {
    code: string;
    name: string;
    description?: string;
}
export declare class UpdateDosageFormDto {
    code?: string;
    name?: string;
    description?: string;
}
