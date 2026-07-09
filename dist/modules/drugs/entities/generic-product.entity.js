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
exports.GenericProductEntity = void 0;
const typeorm_1 = require("typeorm");
const pharmaceutics_entity_1 = require("./pharmaceutics.entity");
let GenericProductEntity = class GenericProductEntity {
    id;
    code;
    name;
    therapeuticClass;
    dosageForm;
    strength;
    generalUse;
    adultDosage;
    pediatricDosage;
    isPrescriptionRequired;
    isControlledSubstance;
    pharmaceutics;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.GenericProductEntity = GenericProductEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GenericProductEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GenericProductEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GenericProductEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'therapeutic_class', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "therapeuticClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dosage_form', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "dosageForm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "strength", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'general_use', type: 'text' }),
    __metadata("design:type", String)
], GenericProductEntity.prototype, "generalUse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adult_dosage', type: 'text' }),
    __metadata("design:type", String)
], GenericProductEntity.prototype, "adultDosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pediatric_dosage', type: 'text' }),
    __metadata("design:type", String)
], GenericProductEntity.prototype, "pediatricDosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_prescription_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GenericProductEntity.prototype, "isPrescriptionRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_controlled_substance', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GenericProductEntity.prototype, "isControlledSubstance", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pharmaceutics_entity_1.PharmaceuticsEntity, (pharmaceutics) => pharmaceutics.genericProducts, {
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'pharmaceutics_id' }),
    __metadata("design:type", pharmaceutics_entity_1.PharmaceuticsEntity)
], GenericProductEntity.prototype, "pharmaceutics", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], GenericProductEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], GenericProductEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "deletedAt", void 0);
exports.GenericProductEntity = GenericProductEntity = __decorate([
    (0, typeorm_1.Entity)('generic_products')
], GenericProductEntity);
//# sourceMappingURL=generic-product.entity.js.map