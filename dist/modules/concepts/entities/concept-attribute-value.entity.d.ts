import { CodingConcept } from '../../../common/enums/concept.enum';
import { ConceptCodingEntity } from './concept-coding.entity';
import { ConceptAttributeEntity } from './concept-attribute.entity';
export declare class ConceptAttributeValueEntity {
    id: string;
    conceptCode: ConceptCodingEntity;
    concept: CodingConcept;
    attribute: ConceptAttributeEntity;
    value: string;
    valueFormat?: string;
    createdAt: Date;
    updatedAt: Date;
}
