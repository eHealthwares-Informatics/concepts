"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilitiesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const facility_sheets_service_1 = require("../../common/services/facility-sheets.service");
const entities_1 = require("../concepts/entities");
const entities_2 = require("./entities");
const controllers_1 = require("./controllers");
const facilities_service_1 = require("./services/facilities.service");
const facility_seeder_1 = require("./seeders/facility.seeder");
const seed_facility_command_1 = require("./commands/seed-facility.command");
let FacilitiesModule = class FacilitiesModule {
};
exports.FacilitiesModule = FacilitiesModule;
exports.FacilitiesModule = FacilitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_2.FacilityEntity,
                entities_2.FacilityAttributeEntity,
                entities_2.StateEntity,
                entities_2.WardEntity,
                entities_2.LgaEntity,
                entities_2.FacilityTypeEntity,
                entities_2.FacilityLevelEntity,
                entities_1.ConceptCodingEntity,
                entities_1.ConceptAttributeEntity,
                entities_1.ConceptAttributeValueEntity,
            ]),
        ],
        controllers: [controllers_1.FacilitiesController, controllers_1.FhirFacilitiesController],
        providers: [
            facilities_service_1.FacilitiesService,
            facility_sheets_service_1.FacilitySheetsService,
            facility_seeder_1.FacilitySeederService,
            seed_facility_command_1.SeedFacilityCommand,
        ],
        exports: [facilities_service_1.FacilitiesService, facility_seeder_1.FacilitySeederService],
    })
], FacilitiesModule);
//# sourceMappingURL=facilities.module.js.map