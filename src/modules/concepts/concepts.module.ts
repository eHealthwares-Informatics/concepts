import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConceptCodingEntity,
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
  ExternalConceptMappingEntity,
  ImportTrackingEntity,
  StateCodingEntity,
  LgaCodingEntity,
  WardCodingEntity,
} from './entities';
import { LoincSeederService } from './seeders/loinc.seeder';
import { ICDSeederService } from './seeders/icd.seeder';
import { DictionarySeederService } from './seeders/dictionary.seeder';
import { GoogleSheetsService } from '../../common/services/google-sheets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConceptCodingEntity,
      ConceptAttributeEntity,
      ConceptAttributeValueEntity,
      ExternalConceptMappingEntity,
      ImportTrackingEntity,
      ConceptAttributeValueEntity,
      StateCodingEntity,
      LgaCodingEntity,
      WardCodingEntity,
    ]),
  ],
  providers: [LoincSeederService, ICDSeederService, DictionarySeederService, GoogleSheetsService],
  exports: [
    TypeOrmModule,
    LoincSeederService,
    ICDSeederService,
    DictionarySeederService,
  ],
})
export class ConceptsModule {}
