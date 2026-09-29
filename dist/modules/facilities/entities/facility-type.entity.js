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
exports.FacilityTypeEntity = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let FacilityTypeEntity = class FacilityTypeEntity {
    id;
    code;
    name;
    createdAt;
    updatedAt;
};
exports.FacilityTypeEntity = FacilityTypeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier' }),
    __metadata("design:type", String)
], FacilityTypeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, unique: true }),
    (0, swagger_1.ApiProperty)({ description: 'Facility type code' }),
    __metadata("design:type", String)
], FacilityTypeEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, default: '' }),
    (0, swagger_1.ApiProperty)({ description: 'Facility type name', default: '' }),
    __metadata("design:type", String)
], FacilityTypeEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata("design:type", Date)
], FacilityTypeEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata("design:type", Date)
], FacilityTypeEntity.prototype, "updatedAt", void 0);
exports.FacilityTypeEntity = FacilityTypeEntity = __decorate([
    (0, typeorm_1.Entity)('facility_types')
], FacilityTypeEntity);
//# sourceMappingURL=facility-type.entity.js.map