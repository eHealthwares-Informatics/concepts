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
const formulation_entity_1 = require("./formulation.entity");
const dosage_form_entity_1 = require("./dosage-form.entity");
const manufacturer_entity_1 = require("./manufacturer.entity");
const generic_drug_entity_1 = require("./generic-drug.entity");
const drug_classification_entity_1 = require("./drug-classification.entity");
let GenericProductEntity = class GenericProductEntity {
    id;
    code;
    name;
    therapeuticClass;
    pharmaceuticalClass;
    dosageForm;
    strength;
    generalUse;
    adultDosage;
    pediatricDosage;
    appendixDosages;
    emdexCode;
    atcCode;
    ndfGenericCode;
    therapeuticCategoryCodes;
    pharmaceuticalCategoryCodes;
    ndfCategoryCodes;
    emdexCategoryCodes;
    isPrescriptionRequired;
    isControlledSubstance;
    pharmaceutics;
    formulation;
    dosageFormRef;
    manufacturer;
    genericDrug;
    classifications;
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
    (0, typeorm_1.Column)({ name: 'pharmaceutical_class', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "pharmaceuticalClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dosage_form', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "dosageForm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "strength", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'general_use', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "generalUse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adult_dosage', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "adultDosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pediatric_dosage', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "pediatricDosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appendix_dosages', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "appendixDosages", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emdex_code', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "emdexCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'atc_code', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "atcCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ndf_generic_code', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "ndfGenericCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'therapeutic_category_codes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "therapeuticCategoryCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pharmaceutical_category_codes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "pharmaceuticalCategoryCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ndf_category_codes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "ndfCategoryCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emdex_category_codes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "emdexCategoryCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_prescription_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GenericProductEntity.prototype, "isPrescriptionRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_controlled_substance', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GenericProductEntity.prototype, "isControlledSubstance", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pharmaceutics_entity_1.PharmaceuticsEntity, (p) => p.genericProducts, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'pharmaceutics_id' }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "pharmaceutics", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => formulation_entity_1.FormulationEntity, (f) => f.genericProducts, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'formulation_id' }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "formulation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dosage_form_entity_1.DosageFormEntity, (df) => df.genericProducts, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'dosage_form_id' }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "dosageFormRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => manufacturer_entity_1.ManufacturerEntity, (m) => m.genericProducts, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'manufacturer_id' }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => generic_drug_entity_1.GenericDrugEntity, (g) => g.genericProducts, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'generic_drug_id' }),
    __metadata("design:type", Object)
], GenericProductEntity.prototype, "genericDrug", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => drug_classification_entity_1.DrugClassificationEntity, (c) => c.genericProducts),
    (0, typeorm_1.JoinTable)({
        name: 'generic_product_classifications',
        joinColumn: { name: 'generic_product_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'drug_classification_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], GenericProductEntity.prototype, "classifications", void 0);
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