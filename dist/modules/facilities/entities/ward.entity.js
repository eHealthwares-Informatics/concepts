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
exports.WardEntity = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let WardEntity = class WardEntity {
    id;
    code;
    name;
    lgaCode;
    createdAt;
    updatedAt;
};
exports.WardEntity = WardEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier' }),
    __metadata("design:type", String)
], WardEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, unique: true }),
    (0, swagger_1.ApiProperty)({ description: 'Ward code' }),
    __metadata("design:type", String)
], WardEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, default: '' }),
    (0, swagger_1.ApiProperty)({ description: 'Ward name', default: '' }),
    __metadata("design:type", String)
], WardEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'LGA code this ward belongs to', nullable: true }),
    __metadata("design:type", String)
], WardEntity.prototype, "lgaCode", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata("design:type", Date)
], WardEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata("design:type", Date)
], WardEntity.prototype, "updatedAt", void 0);
exports.WardEntity = WardEntity = __decorate([
    (0, typeorm_1.Entity)('wards'),
    (0, typeorm_1.Index)(['lgaCode'])
], WardEntity);
//# sourceMappingURL=ward.entity.js.map