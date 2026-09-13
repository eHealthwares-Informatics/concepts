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
const entities_2 = require("./modules/localities/entities");
const localities_module_1 = require("./modules/localities/localities.module");
const entities_3 = require("./modules/concepts/entities");
const entities_4 = require("./modules/facilities/entities");
const entities_5 = require("./modules/drugs/entities");
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
                        entities_3.ConceptCodingEntity,
                        entities_3.ConceptAttributeEntity,
                        entities_3.ConceptAttributeValueEntity,
                        entities_3.ExternalConceptMappingEntity,
                        entities_3.ImportTrackingEntity,
                        entities_4.FacilityEntity,
                        entities_4.StateEntity,
                        entities_4.WardEntity,
                        entities_4.LgaEntity,
                        entities_4.FacilityTypeEntity,
                        entities_4.FacilityLevelEntity,
                        entities_5.PharmaceuticsEntity,
                        entities_5.DrugComponentEntity,
                        entities_5.GenericProductEntity,
                        entities_5.FormulationEntity,
                        entities_5.DosageFormEntity,
                        entities_5.ManufacturerEntity,
                        entities_1.PharmacyEntity,
                        entities_2.LocalityEntity,
                        entities_2.LocalityAdminEntity,
                        entities_2.LocalityRelationEntity,
                    ],
                    synchronize: true,
                }),
            }),
            concepts_module_1.ConceptsModule,
            facilities_module_1.FacilitiesModule,
            drugs_module_1.DrugsModule,
            pharmacies_module_1.PharmaciesModule,
            localities_module_1.LocalitiesModule,
            api_explorer_module_1.ApiExplorerModule,
            seed_module_1.SeedModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map