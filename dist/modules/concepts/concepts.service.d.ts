import { Repository } from 'typeorm';
import { ConceptAttributeValueEntity, ExternalConceptMappingEntity, ConceptCodingEntity, ConceptAttributeEntity } from './entities';
export declare class ConceptsService {
    private readonly conceptCodeRepository;
    private readonly conceptAttributeRepository;
    private readonly conceptValueRepository;
    private readonly externalMappingRepository;
    constructor(conceptCodeRepository: Repository<ConceptCodingEntity>, conceptAttributeRepository: Repository<ConceptAttributeEntity>, conceptValueRepository: Repository<ConceptAttributeValueEntity>, externalMappingRepository: Repository<ExternalConceptMappingEntity>);
    createCode(payload: Partial<ConceptCodingEntity>): Promise<ConceptCodingEntity>;
    uploadCodes(payload: Partial<ConceptCodingEntity>[]): Promise<ConceptCodingEntity[]>;
    addConcept(payload: {
        code: Partial<ConceptCodingEntity>;
        conceptValues?: Partial<ConceptAttributeValueEntity>[];
        externalMappings?: Partial<ExternalConceptMappingEntity>[];
    }): Promise<ConceptCodingEntity>;
    listConcepts(query: {
        page?: number;
        limit?: number;
        filters: Record<string, any>;
    }): Promise<{
        data: ConceptCodingEntity[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: any;
    }>;
    parseFilter(value: string): {
        type: string;
        value: string | undefined;
        valueTo: string | undefined;
    };
    getConcept(id: string): Promise<ConceptCodingEntity>;
    updateConcept(id: string, payload: Partial<ConceptCodingEntity>): Promise<ConceptCodingEntity>;
    deleteConcept(id: string): Promise<{
        success: boolean;
    }>;
    uploadConceptValues(payload: Partial<ConceptAttributeValueEntity>[]): Promise<ConceptAttributeValueEntity[]>;
    createConceptValue(payload: Partial<ConceptAttributeValueEntity>): Promise<ConceptAttributeValueEntity>;
    listConceptValues(query: any): Promise<{
        data: ConceptAttributeValueEntity[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: any;
    }>;
    listConceptAttributes(query: any): Promise<{
        data: ConceptAttributeEntity[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: any;
    }>;
    updateConceptValue(id: string, payload: Partial<ConceptAttributeValueEntity>): Promise<ConceptAttributeValueEntity | null>;
    deleteConceptValue(id: string): Promise<{
        success: boolean;
    }>;
    createExternalMapping(payload: Partial<ExternalConceptMappingEntity>): Promise<ExternalConceptMappingEntity>;
    listExternalMappings(query: {
        page?: number;
        limit?: number;
        externalConcept?: string;
        externalCode?: string;
        internalConcept?: string;
    }): Promise<{
        data: ExternalConceptMappingEntity[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateExternalMapping(id: string, payload: Partial<ExternalConceptMappingEntity>): Promise<ExternalConceptMappingEntity | null>;
    deleteExternalMapping(id: string): Promise<{
        success: boolean;
    }>;
    searchConcept(concept: string, conceptCode: string, metadata?: boolean): Promise<{
        metadata?: Record<string, any> | undefined;
        id: string;
        concept: import("../../common/enums/concept.enum").CodingConcept;
        code: string;
        shortName: string | undefined;
        fullName: string | undefined;
        shortDescription: string | undefined;
        fullDescription: string | undefined;
        externalMappings: ExternalConceptMappingEntity[];
    }>;
    matchConcepts(concept: string, conceptCode: string, metadata?: boolean): Promise<{
        metadata?: Record<string, any> | undefined;
        id: string;
        concept: import("../../common/enums/concept.enum").CodingConcept;
        code: string;
        shortName: string | undefined;
        fullName: string | undefined;
        shortDescription: string | undefined;
        fullDescription: string | undefined;
        externalMappings: ExternalConceptMappingEntity[];
    }[]>;
    private formatConceptResponse;
    private buildMeta;
}
