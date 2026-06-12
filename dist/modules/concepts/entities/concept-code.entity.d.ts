import { CodingConcept } from '../../../common/enums/concept.enum';
import { ExternalConceptMappingEntity } from './external-concept-mapping.entity';
import { ConceptAttributeValueEntity } from './concept-attribute-value.entity';
export declare class ConceptCodeEntity {
    id: string;
    concept: CodingConcept;
    code: string;
    shortName?: string;
    fullName?: string;
    shortDescription?: string;
    fullDescription?: string;
    conceptValues?: ConceptAttributeValueEntity[];
    externalMappings?: ExternalConceptMappingEntity[];
    createdAt: Date;
    updatedAt: Date;
}
