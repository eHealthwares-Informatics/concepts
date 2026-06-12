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
exports.FhirLocationQueryDto = exports.FacilityListQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FacilityListQueryDto {
    code;
    ward;
    lga;
    facility_type;
    facility_level;
    ownership_code;
    page = 1;
    limit = 20;
}
exports.FacilityListQueryDto = FacilityListQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by facility code (facilityId)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FacilityListQueryDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by ward code. Joins through WardEntity and matches on code.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FacilityListQueryDto.prototype, "ward", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by LGA code. Joins through LgaEntity and matches on code.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FacilityListQueryDto.prototype, "lga", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by facility type code. Joins through FacilityTypeEntity and matches on code.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FacilityListQueryDto.prototype, "facility_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by facility level code. Joins through FacilityLevelEntity and matches on code.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FacilityListQueryDto.prototype, "facility_level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by facility level code. Joins through FacilityLevelEntity and matches on code.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FacilityListQueryDto.prototype, "ownership_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FacilityListQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page (max 100)', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], FacilityListQueryDto.prototype, "limit", void 0);
class FhirLocationQueryDto {
    identifier;
    name;
    type;
    'physical-type';
    ward;
    lga;
    page = 1;
    limit = 20;
}
exports.FhirLocationQueryDto = FhirLocationQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by identifier value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FhirLocationQueryDto.prototype, "identifier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by facility name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FhirLocationQueryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by facility type code. Joins through FacilityTypeEntity.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FhirLocationQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by facility level code (maps to FHIR physicalType). Joins through FacilityLevelEntity.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FhirLocationQueryDto.prototype, "physical-type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by ward code. Joins through WardEntity and matches on code.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FhirLocationQueryDto.prototype, "ward", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by LGA code. Joins through LgaEntity and matches on code.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FhirLocationQueryDto.prototype, "lga", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FhirLocationQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page (max 100)', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], FhirLocationQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=facilities.dto.js.map