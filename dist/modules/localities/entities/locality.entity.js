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
exports.LocalityEntity = void 0;
const typeorm_1 = require("typeorm");
let LocalityEntity = class LocalityEntity {
    id;
    code;
    type;
    name;
    gazetteerWardCode;
    lon;
    lat;
    pharmacyCount;
    source;
    confidence;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.LocalityEntity = LocalityEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LocalityEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 160, unique: true }),
    __metadata("design:type", String)
], LocalityEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    __metadata("design:type", String)
], LocalityEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], LocalityEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", Object)
], LocalityEntity.prototype, "gazetteerWardCode", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Object)
], LocalityEntity.prototype, "lon", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Object)
], LocalityEntity.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], LocalityEntity.prototype, "pharmacyCount", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 30, nullable: true }),
    __metadata("design:type", Object)
], LocalityEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20, nullable: true }),
    __metadata("design:type", Object)
], LocalityEntity.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LocalityEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LocalityEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], LocalityEntity.prototype, "deletedAt", void 0);
exports.LocalityEntity = LocalityEntity = __decorate([
    (0, typeorm_1.Entity)('localities'),
    (0, typeorm_1.Index)('idx_localities_code', ['code'], { unique: true }),
    (0, typeorm_1.Index)('idx_localities_type', ['type']),
    (0, typeorm_1.Index)('idx_localities_name', ['name'])
], LocalityEntity);
//# sourceMappingURL=locality.entity.js.map