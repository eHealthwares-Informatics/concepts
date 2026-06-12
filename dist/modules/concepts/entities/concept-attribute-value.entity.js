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
exports.ConceptAttributeValueEntity = void 0;
const typeorm_1 = require("typeorm");
const concept_enum_1 = require("../../../common/enums/concept.enum");
const concept_coding_entity_1 = require("./concept-coding.entity");
const concept_attribute_entity_1 = require("./concept-attribute.entity");
let ConceptAttributeValueEntity = class ConceptAttributeValueEntity {
    id;
    conceptCode;
    concept;
    attribute;
    value;
    valueFormat;
    createdAt;
    updatedAt;
};
exports.ConceptAttributeValueEntity = ConceptAttributeValueEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConceptAttributeValueEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => concept_coding_entity_1.ConceptCodingEntity, (conceptCode) => conceptCode.conceptValues, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'entity', referencedColumnName: 'id' }),
    __metadata("design:type", concept_coding_entity_1.ConceptCodingEntity)
], ConceptAttributeValueEntity.prototype, "conceptCode", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-enum', { enum: concept_enum_1.CodingConcept }),
    __metadata("design:type", String)
], ConceptAttributeValueEntity.prototype, "concept", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => concept_attribute_entity_1.ConceptAttributeEntity, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'attribute_id' }),
    __metadata("design:type", concept_attribute_entity_1.ConceptAttributeEntity)
], ConceptAttributeValueEntity.prototype, "attribute", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ConceptAttributeValueEntity.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true }),
    __metadata("design:type", String)
], ConceptAttributeValueEntity.prototype, "valueFormat", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConceptAttributeValueEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConceptAttributeValueEntity.prototype, "updatedAt", void 0);
exports.ConceptAttributeValueEntity = ConceptAttributeValueEntity = __decorate([
    (0, typeorm_1.Entity)('concept_values'),
    (0, typeorm_1.Index)(['conceptCode', 'attribute'])
], ConceptAttributeValueEntity);
//# sourceMappingURL=concept-attribute-value.entity.js.map