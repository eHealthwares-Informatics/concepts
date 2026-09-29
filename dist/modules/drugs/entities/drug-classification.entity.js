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
exports.DrugClassificationEntity = void 0;
const typeorm_1 = require("typeorm");
const generic_drug_entity_1 = require("./generic-drug.entity");
const generic_product_entity_1 = require("./generic-product.entity");
let DrugClassificationEntity = class DrugClassificationEntity {
    id;
    code;
    type;
    name;
    description;
    source;
    url;
    genericDrugs;
    genericProducts;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.DrugClassificationEntity = DrugClassificationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DrugClassificationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DrugClassificationEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DrugClassificationEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DrugClassificationEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DrugClassificationEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DrugClassificationEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DrugClassificationEntity.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => generic_drug_entity_1.GenericDrugEntity, (g) => g.classifications),
    __metadata("design:type", Array)
], DrugClassificationEntity.prototype, "genericDrugs", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => generic_product_entity_1.GenericProductEntity, (p) => p.classifications),
    __metadata("design:type", Array)
], DrugClassificationEntity.prototype, "genericProducts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DrugClassificationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DrugClassificationEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], DrugClassificationEntity.prototype, "deletedAt", void 0);
exports.DrugClassificationEntity = DrugClassificationEntity = __decorate([
    (0, typeorm_1.Entity)('drug_classifications'),
    (0, typeorm_1.Unique)('uq_drug_classifications_code', ['code']),
    (0, typeorm_1.Index)('idx_drug_classifications_type', ['type'])
], DrugClassificationEntity);
//# sourceMappingURL=drug-classification.entity.js.map