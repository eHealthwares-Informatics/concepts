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
exports.DiagnosticCenterEntity = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../../facilities/entities");
let DiagnosticCenterEntity = class DiagnosticCenterEntity {
    id;
    code;
    name;
    address;
    description;
    stateName;
    lgaName;
    openHours;
    rating;
    providerId;
    sourceUrl;
    state;
    stateId;
    lga;
    lgaId;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.DiagnosticCenterEntity = DiagnosticCenterEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DiagnosticCenterEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], DiagnosticCenterEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "stateName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "lgaName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "openHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "sourceUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.StateEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'state_id' }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "stateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.LgaEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'lga_id' }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "lga", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lga_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "lgaId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DiagnosticCenterEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DiagnosticCenterEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], DiagnosticCenterEntity.prototype, "deletedAt", void 0);
exports.DiagnosticCenterEntity = DiagnosticCenterEntity = __decorate([
    (0, typeorm_1.Entity)('diagnostic_centers'),
    (0, typeorm_1.Index)('idx_diagnostic_centers_code', ['code'], { unique: true }),
    (0, typeorm_1.Index)('idx_diagnostic_centers_state', ['stateId']),
    (0, typeorm_1.Index)('idx_diagnostic_centers_lga', ['lgaId'])
], DiagnosticCenterEntity);
//# sourceMappingURL=diagnostic-center.entity.js.map