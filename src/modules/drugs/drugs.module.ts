import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugComponentsController } from './controllers/drug-components.controller';
import { GenericProductsController } from './controllers/generic-products.controller';
import { PharmaceuticsController } from './controllers/pharmaceutics.controller';
import { FormulationsController } from './controllers/formulations.controller';
import { DosageFormsController } from './controllers/dosage-forms.controller';
import { ManufacturersController } from './controllers/manufacturers.controller';
import {
  DrugComponentEntity,
  GenericProductEntity,
  PharmaceuticsEntity,
  FormulationEntity,
  DosageFormEntity,
  ManufacturerEntity,
} from './entities';
import { DrugComponentsService } from './services/drug-components.service';
import { GenericProductsService } from './services/generic-products.service';
import { PharmaceuticsService } from './services/pharmaceutics.service';
import { FormulationsService } from './services/formulations.service';
import { DosageFormsService } from './services/dosage-forms.service';
import { ManufacturersService } from './services/manufacturers.service';
import { DrugSeederService } from './seeders/drug.seeder';
import { SeedDrugCommand } from './commands/seed-drug.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PharmaceuticsEntity,
      DrugComponentEntity,
      GenericProductEntity,
      FormulationEntity,
      DosageFormEntity,
      ManufacturerEntity,
    ]),
  ],
  controllers: [
    PharmaceuticsController,
    DrugComponentsController,
    GenericProductsController,
    FormulationsController,
    DosageFormsController,
    ManufacturersController,
  ],
  providers: [
    PharmaceuticsService,
    DrugComponentsService,
    GenericProductsService,
    FormulationsService,
    DosageFormsService,
    ManufacturersService,
    DrugSeederService,
    SeedDrugCommand,
  ],
  exports: [
    PharmaceuticsService,
    DrugComponentsService,
    GenericProductsService,
    FormulationsService,
    DosageFormsService,
    ManufacturersService,
    DrugSeederService,
  ],
})
export class DrugsModule {}
