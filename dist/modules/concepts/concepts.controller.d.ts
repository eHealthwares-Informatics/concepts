import { ConceptsService } from './concepts.service';
import { LoincSeederService } from './seeders/loinc.seeder';
export declare class ConceptsController {
    private readonly conceptsService;
    private readonly loincSeeder;
    constructor(conceptsService: ConceptsService, loincSeeder: LoincSeederService);
    addConcept(payload: any): Promise<{
        data: import("./entities").ConceptCodingEntity;
    }>;
    createCode(payload: Record<string, any>): Promise<{
        data: import("./entities").ConceptCodingEntity;
    }>;
    uploadCodes(payload: Record<string, any>[]): Promise<{
        data: import("./entities").ConceptCodingEntity[];
    }>;
    createConceptValue(payload: Record<string, any>): Promise<{
        data: import("./entities").ConceptAttributeValueEntity;
    }>;
    uploadConceptValues(payload: Record<string, any>[]): Promise<{
        data: import("./entities").ConceptAttributeValueEntity[];
    }>;
    listConcepts(query: Record<string, any>, page?: string, limit?: string): Promise<{
        data: import("./entities").ConceptCodingEntity[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: any;
    }>;
    searchConcept(concept: string, conceptCode: string, metadata?: string): Promise<{
        data: {
            metadata?: Record<string, any> | undefined;
            id: string;
            concept: import("../../common/enums/concept.enum").CodingConcept;
            code: string;
            shortName: string | undefined;
            fullName: string | undefined;
            shortDescription: string | undefined;
            fullDescription: string | undefined;
            externalMappings: import("./entities").ExternalConceptMappingEntity[];
        };
    }>;
    matchConcepts(concept: string, conceptCode: string, metadata?: string): Promise<{
        data: {
            metadata?: Record<string, any> | undefined;
            id: string;
            concept: import("../../common/enums/concept.enum").CodingConcept;
            code: string;
            shortName: string | undefined;
            fullName: string | undefined;
            shortDescription: string | undefined;
            fullDescription: string | undefined;
            externalMappings: import("./entities").ExternalConceptMappingEntity[];
        }[];
    }>;
    listValues(query: Record<string, string>, page?: string, limit?: string): Promise<{
        data: import("./entities").ConceptAttributeValueEntity[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: any;
    }>;
    listConceptAttributes(query: Record<string, string>, page?: string, concept?: string, limit?: string): Promise<{
        data: import("./entities").ConceptAttributeEntity[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: any;
    }>;
    updateValue(id: string, payload: Record<string, any>): Promise<{
        data: import("./entities").ConceptAttributeValueEntity | null;
    }>;
    deleteValue(id: string): Promise<{
        success: boolean;
    }>;
    createMapping(payload: Record<string, any>): Promise<{
        data: import("./entities").ExternalConceptMappingEntity;
    }>;
    listMappings(page?: string, limit?: string, externalConcept?: string, externalCode?: string, internalConcept?: string): Promise<{
        data: import("./entities").ExternalConceptMappingEntity[];
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
    updateMapping(id: string, payload: Record<string, any>): Promise<{
        data: import("./entities").ExternalConceptMappingEntity | null;
    }>;
    deleteMapping(id: string): Promise<{
        success: boolean;
    }>;
    getConcept(id: string): Promise<{
        data: import("./entities").ConceptCodingEntity;
    }>;
    updateConcept(id: string, payload: Record<string, any>): Promise<{
        data: import("./entities").ConceptCodingEntity;
    }>;
    deleteConcept(id: string): Promise<{
        success: boolean;
    }>;
    seedLoinc(triggeredBy?: string): Promise<import("./seeders/loinc.seeder").SeederResult>;
    getLoincImportHistory(limit?: string): Promise<{
        data: import("./entities").ImportTrackingEntity[];
    }>;
    getLoincImportStatus(): Promise<{
        data: import("./entities").ImportTrackingEntity | null;
    }>;
}
