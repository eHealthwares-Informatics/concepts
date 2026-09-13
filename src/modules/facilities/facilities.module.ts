import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FacilityEntity,
  StateEntity,
  LgaEntity,
  WardEntity,
  FacilityTypeEntity,
  FacilityLevelEntity,
} from './entities';
import { ConceptAttributeValueEntity } from '../concepts/entities/concept-attribute-value.entity';
import { ConceptAttributeEntity } from '../concepts/entities/concept-attribute.entity';
import { ConceptCodingEntity } from '../concepts/entities/concept-coding.entity';
import { FacilitiesService } from './services/facilities.service';
import { FacilitiesController } from './controllers/facilities.controller';
import { FacilitySeederService } from './seeders/facility.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacilityEntity,
      StateEntity,
      LgaEntity,
      WardEntity,
      FacilityTypeEntity,
      FacilityLevelEntity,
      ConceptAttributeValueEntity,
      ConceptAttributeEntity,
      ConceptCodingEntity,
    ]),
  ],
  controllers: [FacilitiesController],
  providers: [FacilitiesService, FacilitySeederService],
  exports: [FacilitiesService, FacilitySeederService, TypeOrmModule],
})
export class FacilitiesModule {}
