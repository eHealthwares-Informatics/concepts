import { CodingConcept } from '../../../common/enums/concept.enum';
import { ExternalConceptMappingEntity } from './external-concept-mapping.entity';
import { ConceptAttributeValueEntity } from './concept-attribute-value.entity';
export declare class ConceptCodingEntity {
    id: string;
    concept: CodingConcept;
    code: string;
    name?: string;
    shortName?: string;
    longName?: string;
    shortDescription?: string;
    longDescription?: string;
    conceptValues?: ConceptAttributeValueEntity[];
    externalMappings?: ExternalConceptMappingEntity[];
    createdAt: Date;
    updatedAt: Date;
}
