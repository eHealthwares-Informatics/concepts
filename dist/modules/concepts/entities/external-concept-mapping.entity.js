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
exports.ExternalConceptMappingEntity = void 0;
const typeorm_1 = require("typeorm");
const concept_enum_1 = require("../../../common/enums/concept.enum");
const concept_coding_entity_1 = require("./concept-coding.entity");
let ExternalConceptMappingEntity = class ExternalConceptMappingEntity {
    id;
    externalConcept;
    externalCode;
    internalConcept;
    internalCode;
    conceptCodeId;
    conceptCode;
    createdAt;
    updatedAt;
};
exports.ExternalConceptMappingEntity = ExternalConceptMappingEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExternalConceptMappingEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], ExternalConceptMappingEntity.prototype, "externalConcept", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], ExternalConceptMappingEntity.prototype, "externalCode", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], ExternalConceptMappingEntity.prototype, "internalConcept", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true }),
    __metadata("design:type", String)
], ExternalConceptMappingEntity.prototype, "internalCode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => concept_coding_entity_1.ConceptCodingEntity, (conceptCode) => conceptCode.externalMappings, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'conceptCodeId', referencedColumnName: 'id' }),
    __metadata("design:type", concept_coding_entity_1.ConceptCodingEntity)
], ExternalConceptMappingEntity.prototype, "conceptCode", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExternalConceptMappingEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ExternalConceptMappingEntity.prototype, "updatedAt", void 0);
exports.ExternalConceptMappingEntity = ExternalConceptMappingEntity = __decorate([
    (0, typeorm_1.Entity)('external_concept_mappings'),
    (0, typeorm_1.Index)(['externalConcept', 'externalCode'])
], ExternalConceptMappingEntity);
//# sourceMappingURL=external-concept-mapping.entity.js.map