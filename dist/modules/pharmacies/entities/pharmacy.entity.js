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
exports.PharmacyEntity = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../../facilities/entities");
const entities_2 = require("../../localities/entities");
let PharmacyEntity = class PharmacyEntity {
    id;
    premisesId;
    premisesName;
    premisesAddress;
    premisesState;
    pharmacistId;
    pharmacistFirstName;
    pharmacistMiddleName;
    pharmacistLastName;
    pharmacist;
    stateCode;
    stateName;
    lgaName;
    lgaCode;
    wardName;
    wardCode;
    area;
    neighbourhood;
    settlement;
    settlementCode;
    settlementX;
    settlementY;
    stateMatch;
    certificateNo;
    category;
    yearLicenced;
    dateApproved;
    isLicencePrinted;
    datePrinted;
    matchedStateCode;
    matchedLgaCode;
    matchedWardCode;
    lgaMatch;
    wardMatch;
    state;
    stateId;
    lga;
    lgaId;
    ward;
    wardId;
    areaLocality;
    areaId;
    neighbourhoodLocality;
    neighbourhoodId;
    settlementLocality;
    settlementId;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.PharmacyEntity = PharmacyEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PharmacyEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PharmacyEntity.prototype, "premisesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "premisesName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "premisesAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "premisesState", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "pharmacistId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "pharmacistFirstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "pharmacistMiddleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "pharmacistLastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "pharmacist", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "stateCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "stateName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "lgaName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "lgaCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "wardName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "wardCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "neighbourhood", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "settlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "settlementCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "settlementX", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "settlementY", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "stateMatch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "certificateNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "yearLicenced", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "dateApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PharmacyEntity.prototype, "isLicencePrinted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "datePrinted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "matchedStateCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "matchedLgaCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "matchedWardCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "lgaMatch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "wardMatch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.StateEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'state_id' }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "stateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.LgaEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'lga_id' }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "lga", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lga_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "lgaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.WardEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ward_id' }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "ward", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ward_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "wardId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_2.LocalityEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'area_id' }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "areaLocality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "areaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_2.LocalityEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'neighbourhood_id' }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "neighbourhoodLocality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'neighbourhood_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "neighbourhoodId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_2.LocalityEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'settlement_id' }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "settlementLocality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'settlement_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "settlementId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PharmacyEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PharmacyEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], PharmacyEntity.prototype, "deletedAt", void 0);
exports.PharmacyEntity = PharmacyEntity = __decorate([
    (0, typeorm_1.Entity)('pharmacies'),
    (0, typeorm_1.Index)('idx_pharmacies_premises_id', ['premisesId'], { unique: true }),
    (0, typeorm_1.Index)('idx_pharmacies_state', ['stateId']),
    (0, typeorm_1.Index)('idx_pharmacies_lga', ['lgaId']),
    (0, typeorm_1.Index)('idx_pharmacies_ward', ['wardId']),
    (0, typeorm_1.Index)('idx_pharmacies_area', ['areaId']),
    (0, typeorm_1.Index)('idx_pharmacies_neighbourhood', ['neighbourhoodId']),
    (0, typeorm_1.Index)('idx_pharmacies_settlement', ['settlementId']),
    (0, typeorm_1.Index)('idx_pharmacies_category', ['category'])
], PharmacyEntity);
//# sourceMappingURL=pharmacy.entity.js.map