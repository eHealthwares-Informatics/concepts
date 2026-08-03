import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeedOrchestratorService } from './seed-orchestrator.service';

@Injectable()
@Command({
  name: 'seed:all',
  description: 'Run all seeders (dictionary → facility → LOINC → ICD-10 → drugs) in sequence',
})
export class SeedCommand extends CommandRunner implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedCommand.name);

  constructor(
    private readonly seedOrchestrator: SeedOrchestratorService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  onApplicationBootstrap() {
    const seedOnStart = this.configService.get<string>('SEED_ON_START', 'false');
    if (seedOnStart.toLowerCase() === 'true') {
      this.logger.log('SEED_ON_START=true — running all seeders...');
      this.run([]).catch((err) => {
        this.logger.error(`Seed-on-start failed: ${err.message}`);
      });
    }
  }

  async run(passedParams: string[]): Promise<void> {
    this.logger.log('=== Starting full seed (dictionary → facility → LOINC → ICD-10 → drugs) ===');

    const result = await this.seedOrchestrator.seedAll();

    this.logger.log('=== Seed results ===');
    this.logger.log(`  Facility:    ${result.facility.success ? '✓' : '✗'} (${result.facility.errors} errors)`);
    this.logger.log(`  Dictionary:  ${result.dictionary.success ? '✓' : '✗'} (${result.dictionary.errors} errors)`);
    this.logger.log(`  LOINC:       ${result.loinc.success ? '✓' : '✗'} (${result.loinc.errors} errors)`);
    this.logger.log(`  ICD-10:      ${result.icd.success ? '✓' : '✗'} (${result.icd.errors} errors)`);
    this.logger.log(`  Drugs:       ${result.drug.success ? '✓' : '✗'} (${result.drug.errors} errors)`);
    this.logger.log(`  Total:       ${result.totalErrors} errors across all seeders`);

    if (result.totalErrors > 0) {
      this.logger.warn('Seeding completed with errors — check logs above for details');
    }
  }
}
