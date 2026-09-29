import { CodingConcept } from '../../../common/enums/concept.enum';
export declare class ConceptAttributeEntity {
    id: string;
    concept: CodingConcept;
    code: string;
    name: string;
    dataType: string;
    isRequired: boolean;
    isMultiValued: boolean;
    isSearchable: boolean;
    isFilterable: boolean;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
