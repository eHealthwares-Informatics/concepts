import { FacilityEntity } from './facility.entity';
export declare class FacilityAttributeEntity {
    id: string;
    facility: FacilityEntity;
    attributeCode: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}
