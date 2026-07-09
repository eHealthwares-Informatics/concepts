"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrugsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const drug_components_controller_1 = require("./controllers/drug-components.controller");
const generic_products_controller_1 = require("./controllers/generic-products.controller");
const pharmaceutics_controller_1 = require("./controllers/pharmaceutics.controller");
const entities_1 = require("./entities");
const drug_components_service_1 = require("./services/drug-components.service");
const generic_products_service_1 = require("./services/generic-products.service");
const pharmaceutics_service_1 = require("./services/pharmaceutics.service");
const drug_seeder_1 = require("./seeders/drug.seeder");
const seed_drug_command_1 = require("./commands/seed-drug.command");
let DrugsModule = class DrugsModule {
};
exports.DrugsModule = DrugsModule;
exports.DrugsModule = DrugsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.PharmaceuticsEntity,
                entities_1.DrugComponentEntity,
                entities_1.GenericProductEntity,
            ]),
        ],
        controllers: [
            pharmaceutics_controller_1.PharmaceuticsController,
            drug_components_controller_1.DrugComponentsController,
            generic_products_controller_1.GenericProductsController,
        ],
        providers: [
            pharmaceutics_service_1.PharmaceuticsService,
            drug_components_service_1.DrugComponentsService,
            generic_products_service_1.GenericProductsService,
            drug_seeder_1.DrugSeederService,
            seed_drug_command_1.SeedDrugCommand,
        ],
        exports: [
            pharmaceutics_service_1.PharmaceuticsService,
            drug_components_service_1.DrugComponentsService,
            generic_products_service_1.GenericProductsService,
            drug_seeder_1.DrugSeederService,
        ],
    })
], DrugsModule);
//# sourceMappingURL=drugs.module.js.map