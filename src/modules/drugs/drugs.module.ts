import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugComponentsController } from './controllers/drug-components.controller';
import { GenericProductsController } from './controllers/generic-products.controller';
import { PharmaceuticsController } from './controllers/pharmaceutics.controller';
import {
  DrugComponentEntity,
  GenericProductEntity,
  PharmaceuticsEntity,
} from './entities';
import { DrugComponentsService } from './services/drug-components.service';
import { GenericProductsService } from './services/generic-products.service';
import { PharmaceuticsService } from './services/pharmaceutics.service';
import { DrugSeederService } from './seeders/drug.seeder';
import { SeedDrugCommand } from './commands/seed-drug.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PharmaceuticsEntity,
      DrugComponentEntity,
      GenericProductEntity,
    ]),
  ],
  controllers: [
    PharmaceuticsController,
    DrugComponentsController,
    GenericProductsController,
  ],
  providers: [
    PharmaceuticsService,
    DrugComponentsService,
    GenericProductsService,
    DrugSeederService,
    SeedDrugCommand,
  ],
  exports: [
    PharmaceuticsService,
    DrugComponentsService,
    GenericProductsService,
    DrugSeederService,
  ],
})
export class DrugsModule {}
