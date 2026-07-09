import { CodingConcept } from '../../../common/enums/concept.enum';
import { ConceptCodingEntity } from './concept-coding.entity';
export declare class ExternalConceptMappingEntity {
    id: string;
    externalConcept: CodingConcept;
    externalCode: string;
    internalConcept: CodingConcept;
    internalCode?: string;
    conceptCodeId?: string;
    conceptCode?: ConceptCodingEntity;
    createdAt: Date;
    updatedAt: Date;
}
