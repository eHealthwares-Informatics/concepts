import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyEntity } from './entities';
import {
  LgaEntity,
  StateEntity,
  WardEntity,
} from '../facilities/entities';
import { LocalityEntity, LocalityRelationEntity } from '../localities/entities';
import { PharmaciesService } from './services/pharmacies.service';
import { PharmaciesController } from './controllers/pharmacies.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PharmacyEntity,
      StateEntity,
      LgaEntity,
      WardEntity,
      LocalityEntity,
      LocalityRelationEntity,
    ]),
  ],
  controllers: [PharmaciesController],
  providers: [PharmaciesService],
  exports: [PharmaciesService, TypeOrmModule],
})
export class PharmaciesModule {}
