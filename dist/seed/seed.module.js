"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const concepts_module_1 = require("../modules/concepts/concepts.module");
const facilities_module_1 = require("../modules/facilities/facilities.module");
const drugs_module_1 = require("../modules/drugs/drugs.module");
const seed_orchestrator_service_1 = require("./seed-orchestrator.service");
const seed_command_1 = require("./seed.command");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [concepts_module_1.ConceptsModule, facilities_module_1.FacilitiesModule, drugs_module_1.DrugsModule],
        providers: [seed_orchestrator_service_1.SeedOrchestratorService, seed_command_1.SeedCommand],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map