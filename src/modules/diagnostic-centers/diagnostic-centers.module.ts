import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticCenterEntity } from './entities';
import { LgaEntity, StateEntity } from '../facilities/entities';
import { DiagnosticCentersService } from './services/diagnostic-centers.service';
import { DiagnosticCentersController } from './controllers/diagnostic-centers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiagnosticCenterEntity, StateEntity, LgaEntity])],
  controllers: [DiagnosticCentersController],
  providers: [DiagnosticCentersService],
  exports: [DiagnosticCentersService, TypeOrmModule],
})
export class DiagnosticCentersModule {}
