import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptsModule } from './modules/concepts/concepts.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { ApiExplorerModule } from './modules/api-explorer/api-explorer.module';
import { SeedModule } from './seed/seed.module';
import { DrugsModule } from './modules/drugs/drugs.module';
import { PharmaciesModule } from './modules/pharmacies/pharmacies.module';
import { PharmacyEntity } from './modules/pharmacies/entities';
import { DiagnosticCentersModule } from './modules/diagnostic-centers/diagnostic-centers.module';
import { DiagnosticCenterEntity } from './modules/diagnostic-centers/entities';
import {
  LocalityAdminEntity,
  LocalityEntity,
  LocalityRelationEntity,
} from './modules/localities/entities';
import { LocalitiesModule } from './modules/localities/localities.module';
import {
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
  ExternalConceptMappingEntity,
  ConceptCodingEntity,
  ImportTrackingEntity,
} from './modules/concepts/entities';
import {
  FacilityEntity,
  StateEntity,
  WardEntity,
  LgaEntity,
  FacilityTypeEntity,
  FacilityLevelEntity,
} from './modules/facilities/entities';
import {
  PharmaceuticsEntity,
  DrugComponentEntity,
  GenericProductEntity,
  GenericDrugEntity,
  DrugClassificationEntity,
  FormulationEntity,
  DosageFormEntity,
  ManufacturerEntity,
} from './modules/drugs/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE', 'sqlite') as 'sqlite' | 'postgres',
        database: configService.get<string>('DB_NAME', 'coding-concepts.sqlite'),
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        entities: [
          ConceptCodingEntity,
          ConceptAttributeEntity,
          ConceptAttributeValueEntity,
          ExternalConceptMappingEntity,
          ImportTrackingEntity,
          FacilityEntity,
          StateEntity,
          WardEntity,
          LgaEntity,
          FacilityTypeEntity,
          FacilityLevelEntity,
          PharmaceuticsEntity,
          DrugComponentEntity,
          DrugClassificationEntity,
          GenericProductEntity,
          GenericDrugEntity,
          FormulationEntity,
          DosageFormEntity,
          ManufacturerEntity,
          PharmacyEntity,
          DiagnosticCenterEntity,
          LocalityEntity,
          LocalityAdminEntity,
          LocalityRelationEntity,
        ],
        synchronize: true,
      }),
    }),
    ConceptsModule,
    FacilitiesModule,
    DrugsModule,
    PharmaciesModule,
    DiagnosticCentersModule,
    LocalitiesModule,
    ApiExplorerModule,
    SeedModule,
  ],
})
export class AppModule {}
