import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptsModule } from './modules/concepts/concepts.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { ApiExplorerModule } from './modules/api-explorer/api-explorer.module';
import {
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
  ExternalConceptMappingEntity,
  ConceptCodingEntity,
  ImportTrackingEntity,
} from './modules/concepts/entities';
import {
  FacilityEntity,
  FacilityAttributeEntity,
  StateEntity,
  WardEntity,
  LgaEntity,
  FacilityTypeEntity,
  FacilityLevelEntity,
} from './modules/facilities/entities';

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
          FacilityAttributeEntity,
          StateEntity,
          WardEntity,
          LgaEntity,
          FacilityTypeEntity,
          FacilityLevelEntity,
        ],
        synchronize: true,
      }),
    }),
    ConceptsModule,
    FacilitiesModule,
    ApiExplorerModule,
  ],
})
export class AppModule {}
