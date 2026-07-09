import { Module } from '@nestjs/common';
import { ConceptsModule } from '../modules/concepts/concepts.module';
import { FacilitiesModule } from '../modules/facilities/facilities.module';
import { DrugsModule } from '../modules/drugs/drugs.module';
import { SeedOrchestratorService } from './seed-orchestrator.service';
import { SeedCommand } from './seed.command';

@Module({
  imports: [ConceptsModule, FacilitiesModule, DrugsModule],
  providers: [SeedOrchestratorService, SeedCommand],
})
export class SeedModule {}
