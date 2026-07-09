export declare class ListGenericProductsDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    get offset(): number;
}
export declare class CreateGenericProductDto {
    code: string;
    name: string;
    pharmaceuticsId: string;
    therapeuticClass?: string;
    dosageForm?: string;
    strength?: string;
    generalUse?: string;
    adultDosage?: string;
    pediatricDosage?: string;
    isPrescriptionRequired?: boolean;
    isControlledSubstance?: boolean;
}
export declare class UpdateGenericProductDto {
    code?: string;
    name?: string;
    pharmaceuticsId?: string;
    therapeuticClass?: string;
    dosageForm?: string;
    strength?: string;
    generalUse?: string;
    adultDosage?: string;
    pediatricDosage?: string;
    isPrescriptionRequired?: boolean;
    isControlledSubstance?: boolean;
}
