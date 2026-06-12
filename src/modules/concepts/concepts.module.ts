import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptsController } from './concepts.controller';
import { ConceptsService } from './concepts.service';
import { LoincSeederService } from './seeders/loinc.seeder';
import { GoogleSheetsService } from '../../common/services/google-sheets.service';
import {
  ConceptCodingEntity,
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
  ExternalConceptMappingEntity,
  ImportTrackingEntity,
} from './entities';
import { SeedLoincCommand } from './commands/seed-loinc.command';

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
  providers: [ConceptsService, LoincSeederService, SeedLoincCommand, GoogleSheetsService],
  exports: [ConceptsService, LoincSeederService],
})
export class ConceptsModule {}
