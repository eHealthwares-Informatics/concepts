import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { DrugSeederService } from '../seeders/drug.seeder';

@Injectable()
@Command({
  name: 'seed:drug',
  description: 'Seed generic drugs, pharmaceutics, and drug components from Nigeria EDL data',
})
export class SeedDrugCommand extends CommandRunner {
  private readonly logger = new Logger(SeedDrugCommand.name);

  constructor(private readonly drugSeeder: DrugSeederService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    this.logger.log('=== Starting drug seed ===');
    const result = await this.drugSeeder.seedDrugs();
    this.logger.log(`Drug seed: ${result.success ? '✓' : '✗'} — ${result.message}`);
  }
}
