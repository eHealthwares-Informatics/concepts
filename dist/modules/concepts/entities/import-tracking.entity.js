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
exports.ImportTrackingEntity = void 0;
const typeorm_1 = require("typeorm");
let ImportTrackingEntity = class ImportTrackingEntity {
    id;
    concept;
    revision;
    totalRowsProcessed;
    rowsAdded;
    rowsModified;
    rowsDeleted;
    status;
    errorMessage;
    notes;
    timestamp;
    triggeredBy;
};
exports.ImportTrackingEntity = ImportTrackingEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ImportTrackingEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], ImportTrackingEntity.prototype, "concept", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], ImportTrackingEntity.prototype, "revision", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], ImportTrackingEntity.prototype, "totalRowsProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], ImportTrackingEntity.prototype, "rowsAdded", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], ImportTrackingEntity.prototype, "rowsModified", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], ImportTrackingEntity.prototype, "rowsDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ImportTrackingEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ImportTrackingEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ImportTrackingEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ImportTrackingEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true }),
    __metadata("design:type", String)
], ImportTrackingEntity.prototype, "triggeredBy", void 0);
exports.ImportTrackingEntity = ImportTrackingEntity = __decorate([
    (0, typeorm_1.Entity)('import_tracking'),
    (0, typeorm_1.Index)(['concept', 'revision'])
], ImportTrackingEntity);
//# sourceMappingURL=import-tracking.entity.js.map