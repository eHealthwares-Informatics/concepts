import { FacilityEntity } from './facility.entity';
import { ConceptAttributeEntity } from '../../concepts/entities/concept-attribute.entity';
export declare class FacilityAttributeEntity {
    id: string;
    facility: FacilityEntity;
    attribute: ConceptAttributeEntity;
    createdAt: Date;
    updatedAt: Date;
}
