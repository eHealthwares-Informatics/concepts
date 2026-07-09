import { Injectable, Logger } from '@nestjs/common';
import { LoincSeederService } from '../modules/concepts/seeders/loinc.seeder';
import { ICDSeederService } from '../modules/concepts/seeders/icd.seeder';
import { FacilitySeederService } from '../modules/facilities/seeders/facility.seeder';
import { DrugSeederService } from '../modules/drugs/seeders/drug.seeder';

export interface SeedAllResult {
  facility: { success: boolean; errors: number };
  loinc: { success: boolean; errors: number };
  icd: { success: boolean; errors: number };
  drug: { success: boolean; errors: number };
  totalErrors: number;
}

@Injectable()
export class SeedOrchestratorService {
  private readonly logger = new Logger(SeedOrchestratorService.name);

  constructor(
    private readonly facilitySeeder: FacilitySeederService,
    private readonly loincSeeder: LoincSeederService,
    private readonly icdSeeder: ICDSeederService,
    private readonly drugSeeder: DrugSeederService,
  ) {}

  async seedAll(): Promise<SeedAllResult> {
    const result: SeedAllResult = {
      facility: { success: false, errors: 0 },
      loinc: { success: false, errors: 0 },
      icd: { success: false, errors: 0 },
      drug: { success: false, errors: 0 },
      totalErrors: 0,
    };

   

    // 2. LOINC
    try {
      this.logger.log('=== STEP 2/4: Seeding LOINC ===');
      const loincResult = await this.loincSeeder.seedLoincData('seed:all');
      result.loinc = {
        success: loincResult.success,
        errors: loincResult.stats.errors.length,
      };
      this.logger.log(`LOINC seeding ${loincResult.success ? '✓' : '✗'} (${loincResult.stats.errors.length} errors)`);
    } catch (err: any) {
      result.loinc = { success: false, errors: 1 };
      this.logger.error(`LOINC seeding failed: ${err.message}`);
    }

    // 3. ICD
    try {
      this.logger.log('=== STEP 3/4: Seeding ICD-10 ===');
      const icdResult = await this.icdSeeder.seedICDData('seed:all');
      result.icd = {
        success: icdResult.success,
        errors: icdResult.stats.errors.length,
      };
      this.logger.log(`ICD-10 seeding ${icdResult.success ? '✓' : '✗'} (${icdResult.stats.errors.length} errors)`);
    } catch (err: any) {
      result.icd = { success: false, errors: 1 };
      this.logger.error(`ICD-10 seeding failed: ${err.message}`);
    }

    // 4. Drugs
    try {
      this.logger.log('=== STEP 4/4: Seeding drugs ===');
      const drugResult = await this.drugSeeder.seedDrugs();
      result.drug = {
        success: drugResult.success,
        errors: drugResult.success ? 0 : 1,
      };
      this.logger.log(`Drug seeding ${drugResult.success ? '✓' : '✗'}`);
    } catch (err: any) {
      result.drug = { success: false, errors: 1 };
      this.logger.error(`Drug seeding failed: ${err.message}`);
    }

     // 1. Facility
    try {
      this.logger.log('=== STEP 1/4: Seeding facilities ===');
      const facilityResult = await this.facilitySeeder.seedFacilities();
      result.facility = {
        success: facilityResult.success,
        errors: facilityResult.stats.errors.length,
      };
      this.logger.log(`Facility seeding ${facilityResult.success ? '✓' : '✗'} (${facilityResult.stats.errors.length} errors)`);
    } catch (err: any) {
      result.facility = { success: false, errors: 1 };
      this.logger.error(`Facility seeding failed: ${err.message}`);
    }

    result.totalErrors = result.facility.errors + result.loinc.errors + result.icd.errors + result.drug.errors;
    return result;
  }
}
