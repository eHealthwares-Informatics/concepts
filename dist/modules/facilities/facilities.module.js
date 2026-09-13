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
const entities_1 = require("./entities");
const concept_attribute_value_entity_1 = require("../concepts/entities/concept-attribute-value.entity");
const concept_attribute_entity_1 = require("../concepts/entities/concept-attribute.entity");
const concept_coding_entity_1 = require("../concepts/entities/concept-coding.entity");
const facilities_service_1 = require("./services/facilities.service");
const facilities_controller_1 = require("./controllers/facilities.controller");
const facility_seeder_1 = require("./seeders/facility.seeder");
let FacilitiesModule = class FacilitiesModule {
};
exports.FacilitiesModule = FacilitiesModule;
exports.FacilitiesModule = FacilitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.FacilityEntity,
                entities_1.StateEntity,
                entities_1.LgaEntity,
                entities_1.WardEntity,
                entities_1.FacilityTypeEntity,
                entities_1.FacilityLevelEntity,
                concept_attribute_value_entity_1.ConceptAttributeValueEntity,
                concept_attribute_entity_1.ConceptAttributeEntity,
                concept_coding_entity_1.ConceptCodingEntity,
            ]),
        ],
        controllers: [facilities_controller_1.FacilitiesController],
        providers: [facilities_service_1.FacilitiesService, facility_seeder_1.FacilitySeederService],
        exports: [facilities_service_1.FacilitiesService, facility_seeder_1.FacilitySeederService, typeorm_1.TypeOrmModule],
    })
], FacilitiesModule);
//# sourceMappingURL=facilities.module.js.map