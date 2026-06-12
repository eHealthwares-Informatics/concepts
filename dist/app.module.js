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
const entities_1 = require("./modules/concepts/entities");
const entities_2 = require("./modules/facilities/entities");
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
                        entities_1.ConceptCodingEntity,
                        entities_1.ConceptAttributeEntity,
                        entities_1.ConceptAttributeValueEntity,
                        entities_1.ExternalConceptMappingEntity,
                        entities_1.ImportTrackingEntity,
                        entities_2.FacilityEntity,
                        entities_2.FacilityAttributeEntity,
                        entities_2.StateEntity,
                        entities_2.WardEntity,
                        entities_2.LgaEntity,
                        entities_2.FacilityTypeEntity,
                        entities_2.FacilityLevelEntity,
                    ],
                    synchronize: true,
                }),
            }),
            concepts_module_1.ConceptsModule,
            facilities_module_1.FacilitiesModule,
            api_explorer_module_1.ApiExplorerModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map