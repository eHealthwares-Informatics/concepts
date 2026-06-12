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
exports.FacilityEntity = void 0;
const typeorm_1 = require("typeorm");
const state_entity_1 = require("./state.entity");
const lga_entity_1 = require("./lga.entity");
const ward_entity_1 = require("./ward.entity");
const facility_type_entity_1 = require("./facility-type.entity");
const facility_level_entity_1 = require("./facility-level.entity");
let FacilityEntity = class FacilityEntity {
    id;
    facilityId;
    uniqueId;
    registrationNo;
    facilityName;
    alternativeName;
    state;
    lga;
    ward;
    facilityType;
    facilityLevel;
    ownershipCode;
    ownershipTypeCode;
    operationalStatusCode;
    registrationStatusCode;
    licenseStatusCode;
    latitude;
    longitude;
    phoneNumber;
    alternateNumber;
    emailAddress;
    website;
    outpatient;
    inpatient;
    createdAt;
    updatedAt;
};
exports.FacilityEntity = FacilityEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FacilityEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "facilityId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "uniqueId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "registrationNo", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 500 }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "facilityName", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 500, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "alternativeName", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => state_entity_1.StateEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'state_id' }),
    __metadata("design:type", state_entity_1.StateEntity)
], FacilityEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => lga_entity_1.LgaEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'lga_id' }),
    __metadata("design:type", lga_entity_1.LgaEntity)
], FacilityEntity.prototype, "lga", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => ward_entity_1.WardEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ward_id' }),
    __metadata("design:type", ward_entity_1.WardEntity)
], FacilityEntity.prototype, "ward", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => facility_type_entity_1.FacilityTypeEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'facility_type_id' }),
    __metadata("design:type", facility_type_entity_1.FacilityTypeEntity)
], FacilityEntity.prototype, "facilityType", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => facility_level_entity_1.FacilityLevelEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'facility_level_id' }),
    __metadata("design:type", facility_level_entity_1.FacilityLevelEntity)
], FacilityEntity.prototype, "facilityLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "ownershipCode", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "ownershipTypeCode", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "operationalStatusCode", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "registrationStatusCode", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "licenseStatusCode", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], FacilityEntity.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], FacilityEntity.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "alternateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 200, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "emailAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 500, nullable: true }),
    __metadata("design:type", String)
], FacilityEntity.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], FacilityEntity.prototype, "outpatient", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], FacilityEntity.prototype, "inpatient", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FacilityEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FacilityEntity.prototype, "updatedAt", void 0);
exports.FacilityEntity = FacilityEntity = __decorate([
    (0, typeorm_1.Entity)('facilities'),
    (0, typeorm_1.Index)(['ownershipTypeCode']),
    (0, typeorm_1.Index)(['operationalStatusCode'])
], FacilityEntity);
//# sourceMappingURL=facility.entity.js.map