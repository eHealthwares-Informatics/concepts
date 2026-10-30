import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { ClinicalSeederService } from '../seeders/clinical.seeder';

@Injectable()
@Command({
  name: 'seed:clinical',
  description:
    'Seed the baseline clinical knowledge base (complaints, symptoms, red-flag rules, treatment packs)',
})
export class SeedClinicalCommand extends CommandRunner {
  private readonly logger = new Logger(SeedClinicalCommand.name);

  constructor(private readonly clinicalSeeder: ClinicalSeederService) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('=== Starting clinical seed ===');
    const result = await this.clinicalSeeder.seedClinical();
    this.logger.log(`Clinical seed: ${result.success ? '✓' : '✗'} — ${result.message}`);
  }
}
