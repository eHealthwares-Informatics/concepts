import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilitySheetsService } from '../../common/services/facility-sheets.service';
import {
  ConceptCodingEntity,
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
} from '../concepts/entities';
import {
  FacilityEntity,
  FacilityAttributeEntity,
  StateEntity,
  WardEntity,
  LgaEntity,
  FacilityTypeEntity,
  FacilityLevelEntity,
} from './entities';
import { FacilitiesController, FhirFacilitiesController } from './controllers';
import { FacilitiesService } from './services/facilities.service';
import { FacilitySeederService } from './seeders/facility.seeder';
import { SeedFacilityCommand } from './commands/seed-facility.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacilityEntity,
      FacilityAttributeEntity,
      StateEntity,
      WardEntity,
      LgaEntity,
      FacilityTypeEntity,
      FacilityLevelEntity,
      ConceptCodingEntity,
      ConceptAttributeEntity,
      ConceptAttributeValueEntity,
    ]),
  ],
  controllers: [FacilitiesController, FhirFacilitiesController],
  providers: [
    FacilitiesService,
    FacilitySheetsService,
    FacilitySeederService,
    SeedFacilityCommand,
  ],
  exports: [FacilitiesService, FacilitySeederService],
})
export class FacilitiesModule {}
