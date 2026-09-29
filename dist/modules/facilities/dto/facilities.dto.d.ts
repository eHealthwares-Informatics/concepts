export declare class FacilityListQueryDto {
    code?: string;
    search?: string;
    state?: string;
    ward?: string;
    lga?: string;
    ward_name?: string;
    facility_type?: string;
    facility_level?: string;
    ownership_code?: string;
    name_like?: string;
    page?: number;
    limit?: number;
}
export declare class FhirLocationQueryDto {
    identifier?: string;
    name?: string;
    type?: string;
    'physical-type'?: string;
    ward?: string;
    lga?: string;
    page?: number;
    limit?: number;
}
