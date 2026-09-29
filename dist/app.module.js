"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const concepts_module_1 = require("./modules/concepts/concepts.module");
const facilities_module_1 = require("./modules/facilities/facilities.module");
const api_explorer_module_1 = require("./modules/api-explorer/api-explorer.module");
const seed_module_1 = require("./seed/seed.module");
const drugs_module_1 = require("./modules/drugs/drugs.module");
const pharmacies_module_1 = require("./modules/pharmacies/pharmacies.module");
const entities_1 = require("./modules/pharmacies/entities");
const diagnostic_centers_module_1 = require("./modules/diagnostic-centers/diagnostic-centers.module");
const entities_2 = require("./modules/diagnostic-centers/entities");
const entities_3 = require("./modules/localities/entities");
const localities_module_1 = require("./modules/localities/localities.module");
const entities_4 = require("./modules/concepts/entities");
const entities_5 = require("./modules/facilities/entities");
const entities_6 = require("./modules/drugs/entities");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: configService.get('DB_TYPE', 'sqlite'),
                    database: configService.get('DB_NAME', 'coding-concepts.sqlite'),
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USER', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    entities: [
                        entities_4.ConceptCodingEntity,
                        entities_4.ConceptAttributeEntity,
                        entities_4.ConceptAttributeValueEntity,
                        entities_4.ExternalConceptMappingEntity,
                        entities_4.ImportTrackingEntity,
                        entities_5.FacilityEntity,
                        entities_5.StateEntity,
                        entities_5.WardEntity,
                        entities_5.LgaEntity,
                        entities_5.FacilityTypeEntity,
                        entities_5.FacilityLevelEntity,
                        entities_6.PharmaceuticsEntity,
                        entities_6.DrugComponentEntity,
                        entities_6.DrugClassificationEntity,
                        entities_6.GenericProductEntity,
                        entities_6.GenericDrugEntity,
                        entities_6.FormulationEntity,
                        entities_6.DosageFormEntity,
                        entities_6.ManufacturerEntity,
                        entities_1.PharmacyEntity,
                        entities_2.DiagnosticCenterEntity,
                        entities_3.LocalityEntity,
                        entities_3.LocalityAdminEntity,
                        entities_3.LocalityRelationEntity,
                    ],
                    synchronize: true,
                }),
            }),
            concepts_module_1.ConceptsModule,
            facilities_module_1.FacilitiesModule,
            drugs_module_1.DrugsModule,
            pharmacies_module_1.PharmaciesModule,
            diagnostic_centers_module_1.DiagnosticCentersModule,
            localities_module_1.LocalitiesModule,
            api_explorer_module_1.ApiExplorerModule,
            seed_module_1.SeedModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map