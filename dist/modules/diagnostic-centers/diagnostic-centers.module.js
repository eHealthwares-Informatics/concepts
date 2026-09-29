"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticCentersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("./entities");
const entities_2 = require("../facilities/entities");
const diagnostic_centers_service_1 = require("./services/diagnostic-centers.service");
const diagnostic_centers_controller_1 = require("./controllers/diagnostic-centers.controller");
let DiagnosticCentersModule = class DiagnosticCentersModule {
};
exports.DiagnosticCentersModule = DiagnosticCentersModule;
exports.DiagnosticCentersModule = DiagnosticCentersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([entities_1.DiagnosticCenterEntity, entities_2.StateEntity, entities_2.LgaEntity])],
        controllers: [diagnostic_centers_controller_1.DiagnosticCentersController],
        providers: [diagnostic_centers_service_1.DiagnosticCentersService],
        exports: [diagnostic_centers_service_1.DiagnosticCentersService, typeorm_1.TypeOrmModule],
    })
], DiagnosticCentersModule);
//# sourceMappingURL=diagnostic-centers.module.js.map