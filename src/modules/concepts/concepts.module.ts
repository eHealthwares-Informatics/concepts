import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptsController } from './concepts.controller';
import { ConceptsService } from './concepts.service';
import { LoincSeederService } from './seeders/loinc.seeder';
import { ICDSeederService } from './seeders/icd.seeder';
import { GoogleSheetsService } from '../../common/services/google-sheets.service';
import {
  ConceptCodingEntity,
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
  ExternalConceptMappingEntity,
  ImportTrackingEntity,
} from './entities';
import { SeedLoincCommand } from './commands/seed-loinc.command';
import { SeedICDCommand } from './commands/seed-icd.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConceptCodingEntity,
      ConceptAttributeEntity,
      ConceptAttributeValueEntity,
      ExternalConceptMappingEntity,
      ImportTrackingEntity,
    ]),
  ],
  controllers: [ConceptsController],
  providers: [ConceptsService, LoincSeederService, ICDSeederService, SeedLoincCommand, SeedICDCommand, GoogleSheetsService],
  exports: [ConceptsService, LoincSeederService, ICDSeederService],
})
export class ConceptsModule {}
