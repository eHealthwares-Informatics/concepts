"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmaciesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("./entities");
const entities_2 = require("../facilities/entities");
const entities_3 = require("../localities/entities");
const pharmacies_service_1 = require("./services/pharmacies.service");
const pharmacies_controller_1 = require("./controllers/pharmacies.controller");
let PharmaciesModule = class PharmaciesModule {
};
exports.PharmaciesModule = PharmaciesModule;
exports.PharmaciesModule = PharmaciesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.PharmacyEntity,
                entities_2.StateEntity,
                entities_2.LgaEntity,
                entities_2.WardEntity,
                entities_3.LocalityEntity,
                entities_3.LocalityRelationEntity,
            ]),
        ],
        controllers: [pharmacies_controller_1.PharmaciesController],
        providers: [pharmacies_service_1.PharmaciesService],
        exports: [pharmacies_service_1.PharmaciesService, typeorm_1.TypeOrmModule],
    })
], PharmaciesModule);
//# sourceMappingURL=pharmacies.module.js.map