import { Repository } from 'typeorm';
import { GoogleSheetsService } from '../../../common/services/google-sheets.service';
import { ConceptCodingEntity, ConceptAttributeEntity, ConceptAttributeValueEntity, ImportTrackingEntity } from '../entities';
export interface SeederResult {
    success: boolean;
    message: string;
    stats: {
        codesCreated: number;
        attributesCreated: number;
        valuesCreated: number;
        errors: string[];
    };
    tracking: Partial<ImportTrackingEntity>;
}
export declare class LoincSeederService {
    private googleSheetsService;
    private conceptCodeRepository;
    private attributeRepository;
    private valueRepository;
    private trackingRepository;
    private readonly logger;
    constructor(googleSheetsService: GoogleSheetsService, conceptCodeRepository: Repository<ConceptCodingEntity>, attributeRepository: Repository<ConceptAttributeEntity>, valueRepository: Repository<ConceptAttributeValueEntity>, trackingRepository: Repository<ImportTrackingEntity>);
    seedLoincData(triggeredBy?: string): Promise<SeederResult>;
    private processAndCreateAttributes;
    private processChangedRows;
    private toSnakeCase;
    private getChangedRowsFromPreviousImport;
    getImportHistory(limit?: number): Promise<ImportTrackingEntity[]>;
    getLatestImportStatus(): Promise<ImportTrackingEntity | null>;
}
