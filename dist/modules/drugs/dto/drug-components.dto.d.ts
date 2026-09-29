export declare class ListDrugComponentsDto {
    page?: number;
    limit?: number;
    search?: string;
    get offset(): number;
}
export declare class CreateDrugComponentDto {
    name: string;
}
export declare class UpdateDrugComponentDto {
    name?: string;
}
