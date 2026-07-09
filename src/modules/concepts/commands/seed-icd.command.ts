import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { ICDSeederService } from '../seeders/icd.seeder';

@Injectable()
@Command({
  name: 'seed:icd',
  description: 'Import ICD-10 data from Google Sheets',
})
export class SeedICDCommand extends CommandRunner {
  private readonly logger = new Logger(SeedICDCommand.name);

  constructor(private readonly icdSeeder: ICDSeederService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      this.logger.log('Starting ICD-10 seeding process...');

      const triggeredBy = passedParams[0] || 'cli';
      const result = await this.icdSeeder.seedICDData(triggeredBy);

      if (result.success) {
        this.logger.log('✓ Seeding completed successfully');
        this.logger.log(`  - Codes created: ${result.stats.codesCreated}`);
        this.logger.log(`  - Attributes created: ${result.stats.attributesCreated}`);
        this.logger.log(`  - Values created: ${result.stats.valuesCreated}`);

        if (result.stats.errors.length > 0) {
          this.logger.warn(`  - Errors encountered: ${result.stats.errors.length}`);
          result.stats.errors.slice(0, 5).forEach((error) => {
            this.logger.warn(`    • ${error}`);
          });
          if (result.stats.errors.length > 5) {
            this.logger.warn(`    ... and ${result.stats.errors.length - 5} more`);
          }
        }
      } else {
        this.logger.error('✗ Seeding failed');
        this.logger.error(`  - ${result.message}`);
        process.exit(1);
      }
    } catch (error: any) {
      this.logger.error(`Seeding command failed: ${error.message}`);
      process.exit(1);
    }
  }
}
