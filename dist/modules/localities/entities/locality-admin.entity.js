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
exports.LocalityAdminEntity = void 0;
const typeorm_1 = require("typeorm");
const locality_entity_1 = require("./locality.entity");
const entities_1 = require("../../facilities/entities");
let LocalityAdminEntity = class LocalityAdminEntity {
    id;
    locality;
    localityId;
    state;
    stateId;
    lga;
    lgaId;
    ward;
    wardId;
    pharmacyCount;
    createdAt;
    updatedAt;
};
exports.LocalityAdminEntity = LocalityAdminEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LocalityAdminEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => locality_entity_1.LocalityEntity, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'locality_id' }),
    __metadata("design:type", locality_entity_1.LocalityEntity)
], LocalityAdminEntity.prototype, "locality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'locality_id', type: 'uuid' }),
    __metadata("design:type", String)
], LocalityAdminEntity.prototype, "localityId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.StateEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'state_id' }),
    __metadata("design:type", Object)
], LocalityAdminEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LocalityAdminEntity.prototype, "stateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.LgaEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'lga_id' }),
    __metadata("design:type", Object)
], LocalityAdminEntity.prototype, "lga", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lga_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LocalityAdminEntity.prototype, "lgaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.WardEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ward_id' }),
    __metadata("design:type", Object)
], LocalityAdminEntity.prototype, "ward", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ward_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LocalityAdminEntity.prototype, "wardId", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], LocalityAdminEntity.prototype, "pharmacyCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LocalityAdminEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LocalityAdminEntity.prototype, "updatedAt", void 0);
exports.LocalityAdminEntity = LocalityAdminEntity = __decorate([
    (0, typeorm_1.Entity)('locality_admins'),
    (0, typeorm_1.Index)('idx_locality_admins_locality', ['localityId']),
    (0, typeorm_1.Unique)('uq_locality_admins_position', ['localityId', 'stateId', 'lgaId', 'wardId'])
], LocalityAdminEntity);
//# sourceMappingURL=locality-admin.entity.js.map