"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConceptsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const concepts_controller_1 = require("./concepts.controller");
const concepts_service_1 = require("./concepts.service");
const loinc_seeder_1 = require("./seeders/loinc.seeder");
const icd_seeder_1 = require("./seeders/icd.seeder");
const google_sheets_service_1 = require("../../common/services/google-sheets.service");
const entities_1 = require("./entities");
const seed_loinc_command_1 = require("./commands/seed-loinc.command");
const seed_icd_command_1 = require("./commands/seed-icd.command");
let ConceptsModule = class ConceptsModule {
};
exports.ConceptsModule = ConceptsModule;
exports.ConceptsModule = ConceptsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.ConceptCodingEntity,
                entities_1.ConceptAttributeEntity,
                entities_1.ConceptAttributeValueEntity,
                entities_1.ExternalConceptMappingEntity,
                entities_1.ImportTrackingEntity,
            ]),
        ],
        controllers: [concepts_controller_1.ConceptsController],
        providers: [concepts_service_1.ConceptsService, loinc_seeder_1.LoincSeederService, icd_seeder_1.ICDSeederService, seed_loinc_command_1.SeedLoincCommand, seed_icd_command_1.SeedICDCommand, google_sheets_service_1.GoogleSheetsService],
        exports: [concepts_service_1.ConceptsService, loinc_seeder_1.LoincSeederService, icd_seeder_1.ICDSeederService],
    })
], ConceptsModule);
//# sourceMappingURL=concepts.module.js.map