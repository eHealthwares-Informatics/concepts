import { CodingConcept } from '../../../common/enums/concept.enum';
import { ConceptCodingEntity } from './concept-coding.entity';
import { ConceptAttributeEntity } from './concept-attribute.entity';
import { FacilityEntity } from '../../facilities/entities/facility.entity';
export declare class ConceptAttributeValueEntity {
    id: string;
    conceptCode: ConceptCodingEntity;
    concept: CodingConcept;
    attribute: ConceptAttributeEntity;
    facility?: FacilityEntity;
    value: string;
    valueFormat?: string;
    createdAt: Date;
    updatedAt: Date;
}
