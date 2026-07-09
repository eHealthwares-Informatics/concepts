export declare class ListPharmaceuticsDto {
    page?: number;
    limit?: number;
    search?: string;
    get offset(): number;
}
export declare class CreatePharmaceuticsDto {
    code: string;
    commonBrandName?: string;
    commonGenericName?: string;
    clinicalName?: string;
    drugClass?: string;
    chemicalConstituents?: string;
    pharmaceutics?: string;
    indications?: string;
    contraindications?: string;
    mechanism?: string;
    missedDose?: string;
    drugInteractions?: string;
    dosage?: string;
    drugComponentIds?: string[];
}
export declare class UpdatePharmaceuticsDto extends CreatePharmaceuticsDto {
}
