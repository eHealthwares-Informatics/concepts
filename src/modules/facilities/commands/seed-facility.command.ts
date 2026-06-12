import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { FacilitySeederService } from '../seeders/facility.seeder';

@Injectable()
@Command({
  name: 'seed:facility',
  description: 'Import facility registry data from Google Sheets',
})
export class SeedFacilityCommand extends CommandRunner {
  private readonly logger = new Logger(SeedFacilityCommand.name);

  constructor(private readonly facilitySeeder: FacilitySeederService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      this.logger.log('Starting facility seeding process...');
      const result = await this.facilitySeeder.seedFacilities();

      if (result.success) {
        this.logger.log('✓ Facility seeding completed successfully');
        this.logger.log(`  States: ${result.stats.statesCreated}`);
        this.logger.log(`  LGAs: ${result.stats.lgasCreated}`);
        this.logger.log(`  Wards: ${result.stats.wardsCreated}`);
        this.logger.log(`  Facility Types: ${result.stats.facilityTypesCreated}`);
        this.logger.log(`  Facility Levels: ${result.stats.facilityLevelsCreated}`);
        this.logger.log(`  Derived Codes: ${result.stats.derivedCodesCreated}`);
        this.logger.log(`  Facilities Created: ${result.stats.facilitiesCreated}`);
        this.logger.log(`  Facilities Updated: ${result.stats.facilitiesUpdated}`);
        this.logger.log(`  Facility Attributes: ${result.stats.facilityAttributesCreated}`);
        if (result.stats.errors.length > 0) {
          this.logger.warn(`  Errors: ${result.stats.errors.length}`);
          for (const err of result.stats.errors.slice(0, 10)) {
            this.logger.warn(`    - ${err}`);
          }
        }
      } else {
        this.logger.error('✗ Facility seeding failed');
        this.logger.error(`  ${result.message}`);
        process.exit(1);
      }
    } catch (error: any) {
      this.logger.error(`Facility seeding command failed: ${error.message}`);
      process.exit(1);
    }
  }
}
