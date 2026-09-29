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
exports.ConceptCodingEntity = void 0;
const typeorm_1 = require("typeorm");
const concept_enum_1 = require("../../../common/enums/concept.enum");
const external_concept_mapping_entity_1 = require("./external-concept-mapping.entity");
const concept_attribute_value_entity_1 = require("./concept-attribute-value.entity");
let ConceptCodingEntity = class ConceptCodingEntity {
    id;
    concept;
    code;
    name;
    shortName;
    longName;
    shortDescription;
    longDescription;
    conceptValues;
    externalMappings;
    createdAt;
    updatedAt;
};
exports.ConceptCodingEntity = ConceptCodingEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConceptCodingEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], ConceptCodingEntity.prototype, "concept", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], ConceptCodingEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true }),
    __metadata("design:type", String)
], ConceptCodingEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true }),
    __metadata("design:type", String)
], ConceptCodingEntity.prototype, "shortName", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 500, nullable: true }),
    __metadata("design:type", String)
], ConceptCodingEntity.prototype, "longName", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ConceptCodingEntity.prototype, "shortDescription", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ConceptCodingEntity.prototype, "longDescription", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => concept_attribute_value_entity_1.ConceptAttributeValueEntity, (value) => value.conceptCode, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ConceptCodingEntity.prototype, "conceptValues", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => external_concept_mapping_entity_1.ExternalConceptMappingEntity, (mapping) => mapping.conceptCode, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ConceptCodingEntity.prototype, "externalMappings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConceptCodingEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConceptCodingEntity.prototype, "updatedAt", void 0);
exports.ConceptCodingEntity = ConceptCodingEntity = __decorate([
    (0, typeorm_1.Entity)('concept_codes'),
    (0, typeorm_1.Index)(['concept', 'code'])
], ConceptCodingEntity);
//# sourceMappingURL=concept-coding.entity.js.map