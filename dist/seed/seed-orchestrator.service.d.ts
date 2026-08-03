import { LoincSeederService } from '../modules/concepts/seeders/loinc.seeder';
import { ICDSeederService } from '../modules/concepts/seeders/icd.seeder';
import { DictionarySeederService } from '../modules/concepts/seeders/dictionary.seeder';
import { FacilitySeederService } from '../modules/facilities/seeders/facility.seeder';
import { DrugSeederService } from '../modules/drugs/seeders/drug.seeder';
export interface SeedAllResult {
    facility: {
        success: boolean;
        errors: number;
    };
    loinc: {
        success: boolean;
        errors: number;
    };
    icd: {
        success: boolean;
        errors: number;
    };
    drug: {
        success: boolean;
        errors: number;
    };
    dictionary: {
        success: boolean;
        errors: number;
    };
    totalErrors: number;
}
export declare class SeedOrchestratorService {
    private readonly facilitySeeder;
    private readonly loincSeeder;
    private readonly icdSeeder;
    private readonly drugSeeder;
    private readonly dictionarySeeder;
    private readonly logger;
    constructor(facilitySeeder: FacilitySeederService, loincSeeder: LoincSeederService, icdSeeder: ICDSeederService, drugSeeder: DrugSeederService, dictionarySeeder: DictionarySeederService);
    seedAll(): Promise<SeedAllResult>;
}
