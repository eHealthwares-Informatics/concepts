import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  LocalityAdminEntity,
  LocalityEntity,
  LocalityRelationEntity,
} from './entities';
import { LocalitiesService } from './services/localities.service';
import { LocalitiesController } from './controllers/localities.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocalityEntity,
      LocalityAdminEntity,
      LocalityRelationEntity,
    ]),
  ],
  controllers: [LocalitiesController],
  providers: [LocalitiesService],
  exports: [LocalitiesService, TypeOrmModule],
})
export class LocalitiesModule {}
