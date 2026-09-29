export declare class ListManufacturersDto {
    page?: number;
    limit?: number;
    search?: string;
    get offset(): number;
}
export declare class CreateManufacturerDto {
    code: string;
    name: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
}
export declare class UpdateManufacturerDto {
    code?: string;
    name?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
}
