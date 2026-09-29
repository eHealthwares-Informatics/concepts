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
exports.GenericDrugEntity = void 0;
const typeorm_1 = require("typeorm");
const generic_product_entity_1 = require("./generic-product.entity");
const drug_classification_entity_1 = require("./drug-classification.entity");
let GenericDrugEntity = class GenericDrugEntity {
    id;
    code;
    name;
    genericClass;
    pharmaceuticalClass;
    emdexCode;
    source;
    therapeuticCategoryCodes;
    pharmaceuticalCategoryCodes;
    ndfCategoryCodes;
    emdexCategoryCodes;
    genericProducts;
    classifications;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.GenericDrugEntity = GenericDrugEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GenericDrugEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', unique: true }),
    __metadata("design:type", String)
], GenericDrugEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GenericDrugEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'generic_class', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "genericClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pharmaceutical_class', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "pharmaceuticalClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emdex_code', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "emdexCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'therapeutic_category_codes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "therapeuticCategoryCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pharmaceutical_category_codes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "pharmaceuticalCategoryCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ndf_category_codes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "ndfCategoryCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emdex_category_codes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "emdexCategoryCodes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => generic_product_entity_1.GenericProductEntity, (gp) => gp.genericDrug),
    __metadata("design:type", Array)
], GenericDrugEntity.prototype, "genericProducts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => drug_classification_entity_1.DrugClassificationEntity, (c) => c.genericDrugs),
    (0, typeorm_1.JoinTable)({
        name: 'generic_drug_classifications',
        joinColumn: { name: 'generic_drug_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'drug_classification_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], GenericDrugEntity.prototype, "classifications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], GenericDrugEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], GenericDrugEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], GenericDrugEntity.prototype, "deletedAt", void 0);
exports.GenericDrugEntity = GenericDrugEntity = __decorate([
    (0, typeorm_1.Entity)('generic_drugs')
], GenericDrugEntity);
//# sourceMappingURL=generic-drug.entity.js.map