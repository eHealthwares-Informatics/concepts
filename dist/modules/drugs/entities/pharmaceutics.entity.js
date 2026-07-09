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
exports.PharmaceuticsEntity = void 0;
const typeorm_1 = require("typeorm");
const generic_product_entity_1 = require("./generic-product.entity");
const drug_component_entity_1 = require("./drug-component.entity");
let PharmaceuticsEntity = class PharmaceuticsEntity {
    id;
    code;
    commonBrandName;
    commonGenericName;
    clinicalName;
    drugClass;
    chemicalConstituents;
    pharmaceutics;
    indications;
    contraindications;
    mechanism;
    missedDose;
    drugInteractions;
    dosage;
    genericProducts;
    drugComponents;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.PharmaceuticsEntity = PharmaceuticsEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PharmaceuticsEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PharmaceuticsEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'common_brand_name', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "commonBrandName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'common_generic_name', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "commonGenericName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clinical_name', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "clinicalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'drug_class', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "drugClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'chemical_constituents', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "chemicalConstituents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'pharmaceutics', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "pharmaceutics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "indications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "contraindications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "mechanism", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'missed_dose', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "missedDose", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'drug_interactions', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "drugInteractions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dosage', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => generic_product_entity_1.GenericProductEntity, (genericProduct) => genericProduct.pharmaceutics),
    __metadata("design:type", Array)
], PharmaceuticsEntity.prototype, "genericProducts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => drug_component_entity_1.DrugComponentEntity, (drugComponent) => drugComponent.pharmaceutics),
    (0, typeorm_1.JoinTable)({
        name: 'pharmaceutics_drug_components',
        joinColumn: { name: 'pharmaceutics_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'drug_component_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], PharmaceuticsEntity.prototype, "drugComponents", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PharmaceuticsEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PharmaceuticsEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "deletedAt", void 0);
exports.PharmaceuticsEntity = PharmaceuticsEntity = __decorate([
    (0, typeorm_1.Entity)('pharmaceutics')
], PharmaceuticsEntity);
//# sourceMappingURL=pharmaceutics.entity.js.map