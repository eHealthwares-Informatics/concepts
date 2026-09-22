import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugComponentsController } from './controllers/drug-components.controller';
import { GenericProductsController } from './controllers/generic-products.controller';
import { GenericDrugsController } from './controllers/generic-drugs.controller';
import { PharmaceuticsController } from './controllers/pharmaceutics.controller';
import { FormulationsController } from './controllers/formulations.controller';
import { DosageFormsController } from './controllers/dosage-forms.controller';
import { ManufacturersController } from './controllers/manufacturers.controller';
import { DrugClassificationsController } from './controllers/drug-classifications.controller';
import {
  DrugComponentEntity,
  GenericProductEntity,
  GenericDrugEntity,
  DrugClassificationEntity,
  PharmaceuticsEntity,
  FormulationEntity,
  DosageFormEntity,
  ManufacturerEntity,
} from './entities';
import { DrugComponentsService } from './services/drug-components.service';
import { GenericProductsService } from './services/generic-products.service';
import { GenericDrugsService } from './services/generic-drugs.service';
import { PharmaceuticsService } from './services/pharmaceutics.service';
import { FormulationsService } from './services/formulations.service';
import { DosageFormsService } from './services/dosage-forms.service';
import { ManufacturersService } from './services/manufacturers.service';
import { DrugClassificationsService } from './services/drug-classifications.service';
import { DrugSeederService } from './seeders/drug.seeder';
import { SeedDrugCommand } from './commands/seed-drug.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PharmaceuticsEntity,
      DrugComponentEntity,
      GenericProductEntity,
      GenericDrugEntity,
      DrugClassificationEntity,
      FormulationEntity,
      DosageFormEntity,
      ManufacturerEntity,
    ]),
  ],
  controllers: [
    PharmaceuticsController,
    DrugComponentsController,
    GenericProductsController,
    GenericDrugsController,
    FormulationsController,
    DosageFormsController,
    ManufacturersController,
    DrugClassificationsController,
  ],
  providers: [
    PharmaceuticsService,
    DrugComponentsService,
    GenericProductsService,
    GenericDrugsService,
    FormulationsService,
    DosageFormsService,
    ManufacturersService,
    DrugClassificationsService,
    DrugSeederService,
    SeedDrugCommand,
  ],
  exports: [
    PharmaceuticsService,
    DrugComponentsService,
    GenericProductsService,
    GenericDrugsService,
    FormulationsService,
    DosageFormsService,
    ManufacturersService,
    DrugClassificationsService,
    DrugSeederService,
  ],
})
export class DrugsModule {}
