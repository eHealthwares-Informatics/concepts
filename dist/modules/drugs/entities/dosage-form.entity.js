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
exports.DosageFormEntity = void 0;
const typeorm_1 = require("typeorm");
const generic_product_entity_1 = require("./generic-product.entity");
let DosageFormEntity = class DosageFormEntity {
    id;
    code;
    name;
    description;
    genericProducts;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.DosageFormEntity = DosageFormEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DosageFormEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', unique: true }),
    __metadata("design:type", String)
], DosageFormEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DosageFormEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DosageFormEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => generic_product_entity_1.GenericProductEntity, (gp) => gp.dosageFormRef),
    __metadata("design:type", Array)
], DosageFormEntity.prototype, "genericProducts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DosageFormEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DosageFormEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], DosageFormEntity.prototype, "deletedAt", void 0);
exports.DosageFormEntity = DosageFormEntity = __decorate([
    (0, typeorm_1.Entity)('dosage_forms')
], DosageFormEntity);
//# sourceMappingURL=dosage-form.entity.js.map