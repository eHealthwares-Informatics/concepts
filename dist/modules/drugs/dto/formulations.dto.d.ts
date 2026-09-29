export declare class ListFormulationsDto {
    page?: number;
    limit?: number;
    search?: string;
    get offset(): number;
}
export declare class CreateFormulationDto {
    code: string;
    name: string;
    description?: string;
}
export declare class UpdateFormulationDto {
    code?: string;
    name?: string;
    description?: string;
}
