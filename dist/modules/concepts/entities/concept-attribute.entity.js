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
exports.ConceptAttributeEntity = void 0;
const typeorm_1 = require("typeorm");
const concept_enum_1 = require("../../../common/enums/concept.enum");
let ConceptAttributeEntity = class ConceptAttributeEntity {
    id;
    concept;
    code;
    name;
    dataType;
    isRequired;
    isMultiValued;
    isSearchable;
    isFilterable;
    description;
    createdAt;
    updatedAt;
};
exports.ConceptAttributeEntity = ConceptAttributeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConceptAttributeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], ConceptAttributeEntity.prototype, "concept", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], ConceptAttributeEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], ConceptAttributeEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], ConceptAttributeEntity.prototype, "dataType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ConceptAttributeEntity.prototype, "isRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ConceptAttributeEntity.prototype, "isMultiValued", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ConceptAttributeEntity.prototype, "isSearchable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ConceptAttributeEntity.prototype, "isFilterable", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ConceptAttributeEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConceptAttributeEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConceptAttributeEntity.prototype, "updatedAt", void 0);
exports.ConceptAttributeEntity = ConceptAttributeEntity = __decorate([
    (0, typeorm_1.Entity)('concept_attributes'),
    (0, typeorm_1.Index)(['concept', 'code'], { unique: true })
], ConceptAttributeEntity);
//# sourceMappingURL=concept-attribute.entity.js.map