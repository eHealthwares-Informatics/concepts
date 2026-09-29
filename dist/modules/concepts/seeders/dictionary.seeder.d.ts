import { Repository } from 'typeorm';
import { ConceptCodingEntity, ConceptAttributeEntity, ConceptAttributeValueEntity, ImportTrackingEntity } from '../entities';
export interface DictionarySeederResult {
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
export declare class DictionarySeederService {
    private readonly conceptCodeRepository;
    private readonly attributeRepository;
    private readonly valueRepository;
    private readonly trackingRepository;
    private readonly logger;
    constructor(conceptCodeRepository: Repository<ConceptCodingEntity>, attributeRepository: Repository<ConceptAttributeEntity>, valueRepository: Repository<ConceptAttributeValueEntity>, trackingRepository: Repository<ImportTrackingEntity>);
    seedDictionaryData(triggeredBy?: string): Promise<DictionarySeederResult>;
    private resolveSeedsDir;
    private readCsv;
}
