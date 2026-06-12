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
exports.LgaEntity = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let LgaEntity = class LgaEntity {
    id;
    code;
    name;
    stateCode;
    createdAt;
    updatedAt;
};
exports.LgaEntity = LgaEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier' }),
    __metadata("design:type", String)
], LgaEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, unique: true }),
    (0, swagger_1.ApiProperty)({ description: 'LGA code' }),
    __metadata("design:type", String)
], LgaEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, default: '' }),
    (0, swagger_1.ApiProperty)({ description: 'LGA name', default: '' }),
    __metadata("design:type", String)
], LgaEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'State code this LGA belongs to', nullable: true }),
    __metadata("design:type", String)
], LgaEntity.prototype, "stateCode", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata("design:type", Date)
], LgaEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata("design:type", Date)
], LgaEntity.prototype, "updatedAt", void 0);
exports.LgaEntity = LgaEntity = __decorate([
    (0, typeorm_1.Entity)('lgas'),
    (0, typeorm_1.Index)(['stateCode'])
], LgaEntity);
//# sourceMappingURL=lga.entity.js.map