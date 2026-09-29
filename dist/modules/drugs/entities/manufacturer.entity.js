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
exports.ManufacturerEntity = void 0;
const typeorm_1 = require("typeorm");
const generic_product_entity_1 = require("./generic-product.entity");
let ManufacturerEntity = class ManufacturerEntity {
    id;
    code;
    name;
    country;
    phone;
    email;
    website;
    address;
    genericProducts;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.ManufacturerEntity = ManufacturerEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ManufacturerEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', unique: true }),
    __metadata("design:type", String)
], ManufacturerEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ManufacturerEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ManufacturerEntity.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ManufacturerEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ManufacturerEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ManufacturerEntity.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ManufacturerEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => generic_product_entity_1.GenericProductEntity, (gp) => gp.manufacturer),
    __metadata("design:type", Array)
], ManufacturerEntity.prototype, "genericProducts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ManufacturerEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ManufacturerEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], ManufacturerEntity.prototype, "deletedAt", void 0);
exports.ManufacturerEntity = ManufacturerEntity = __decorate([
    (0, typeorm_1.Entity)('manufacturers')
], ManufacturerEntity);
//# sourceMappingURL=manufacturer.entity.js.map