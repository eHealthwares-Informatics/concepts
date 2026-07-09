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
exports.FacilityAttributeEntity = void 0;
const typeorm_1 = require("typeorm");
const facility_entity_1 = require("./facility.entity");
let FacilityAttributeEntity = class FacilityAttributeEntity {
    id;
    facility;
    attributeCode;
    value;
    createdAt;
    updatedAt;
};
exports.FacilityAttributeEntity = FacilityAttributeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FacilityAttributeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => facility_entity_1.FacilityEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'facility_id' }),
    __metadata("design:type", facility_entity_1.FacilityEntity)
], FacilityAttributeEntity.prototype, "facility", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], FacilityAttributeEntity.prototype, "attributeCode", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], FacilityAttributeEntity.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FacilityAttributeEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FacilityAttributeEntity.prototype, "updatedAt", void 0);
exports.FacilityAttributeEntity = FacilityAttributeEntity = __decorate([
    (0, typeorm_1.Entity)('facility_attributes'),
    (0, typeorm_1.Index)(['facility', 'attributeCode'])
], FacilityAttributeEntity);
//# sourceMappingURL=facility-attribute.entity.js.map