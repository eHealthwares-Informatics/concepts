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
exports.LocalityRelationEntity = void 0;
const typeorm_1 = require("typeorm");
const locality_entity_1 = require("./locality.entity");
let LocalityRelationEntity = class LocalityRelationEntity {
    id;
    locality;
    localityId;
    relatedLocality;
    relatedLocalityId;
    kind;
    tier;
    distanceKm;
    pharmacyCount;
    createdAt;
    updatedAt;
};
exports.LocalityRelationEntity = LocalityRelationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LocalityRelationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => locality_entity_1.LocalityEntity, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'locality_id' }),
    __metadata("design:type", locality_entity_1.LocalityEntity)
], LocalityRelationEntity.prototype, "locality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'locality_id', type: 'uuid' }),
    __metadata("design:type", String)
], LocalityRelationEntity.prototype, "localityId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => locality_entity_1.LocalityEntity, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'related_locality_id' }),
    __metadata("design:type", Object)
], LocalityRelationEntity.prototype, "relatedLocality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_locality_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LocalityRelationEntity.prototype, "relatedLocalityId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    __metadata("design:type", String)
], LocalityRelationEntity.prototype, "kind", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20, nullable: true }),
    __metadata("design:type", Object)
], LocalityRelationEntity.prototype, "tier", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Object)
], LocalityRelationEntity.prototype, "distanceKm", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], LocalityRelationEntity.prototype, "pharmacyCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LocalityRelationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LocalityRelationEntity.prototype, "updatedAt", void 0);
exports.LocalityRelationEntity = LocalityRelationEntity = __decorate([
    (0, typeorm_1.Entity)('locality_relations'),
    (0, typeorm_1.Index)('idx_locality_relations_locality', ['localityId']),
    (0, typeorm_1.Index)('idx_locality_relations_kind', ['kind']),
    (0, typeorm_1.Unique)('uq_locality_relations_edge', ['localityId', 'relatedLocalityId', 'kind', 'tier'])
], LocalityRelationEntity);
//# sourceMappingURL=locality-relation.entity.js.map