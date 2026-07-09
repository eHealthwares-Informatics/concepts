"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrugComponentEntity = void 0;
const typeorm_1 = require("typeorm");
const pharmaceutics_entity_1 = require("./pharmaceutics.entity");
let DrugComponentEntity = class DrugComponentEntity {
    id;
    name;
    pharmaceutics;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.DrugComponentEntity = DrugComponentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DrugComponentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DrugComponentEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => pharmaceutics_entity_1.PharmaceuticsEntity, (pharmaceutics) => pharmaceutics.drugComponents),
    __metadata("design:type", Array)
], DrugComponentEntity.prototype, "pharmaceutics", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DrugComponentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DrugComponentEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], DrugComponentEntity.prototype, "deletedAt", void 0);
exports.DrugComponentEntity = DrugComponentEntity = __decorate([
    (0, typeorm_1.Entity)('drug_components')
], DrugComponentEntity);
//# sourceMappingURL=drug-component.entity.js.map