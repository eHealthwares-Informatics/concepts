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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FhirFacilitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const facilities_service_1 = require("../services/facilities.service");
const facilities_dto_1 = require("../dto/facilities.dto");
let FhirFacilitiesController = class FhirFacilitiesController {
    facilitiesService;
    constructor(facilitiesService) {
        this.facilitiesService = facilitiesService;
    }
    async searchLocations(query) {
        return this.facilitiesService.listFhirLocations(query);
    }
    async getLocation(id) {
        return this.facilitiesService.getFhirLocation(id);
    }
};
exports.FhirFacilitiesController = FhirFacilitiesController;
__decorate([
    (0, common_1.Get)('Location'),
    (0, swagger_1.ApiOperation)({
        summary: 'FHIR Location search',
        description: 'Search for FHIR Location resources representing healthcare facilities. ' +
            'Supports filtering by identifier, name, type, physical-type (facility level), ward, and LGA. ' +
            'Returns a FHIR Bundle of type searchset.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'identifier',
        required: false,
        description: 'Search by facility identifier (facilityId)',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'name',
        required: false,
        description: 'Search by facility name (partial match, case-insensitive)',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        description: 'Filter by facility type code',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'physical-type',
        required: false,
        description: 'Filter by facility level code (maps to FHIR physicalType)',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'ward',
        required: false,
        description: 'Filter by ward code',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'lga',
        required: false,
        description: 'Filter by LGA code',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Page number (starts at 1)',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Items per page (max 100)',
        type: Number,
        example: 20,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FHIR Bundle searchset of Location resources',
        schema: {
            properties: {
                resourceType: { type: 'string', example: 'Bundle' },
                type: { type: 'string', example: 'searchset' },
                total: { type: 'integer' },
                entry: {
                    type: 'array',
                    items: {
                        properties: {
                            fullUrl: { type: 'string' },
                            resource: { type: 'object' },
                            search: { type: 'object', properties: { mode: { type: 'string' } } },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [facilities_dto_1.FhirLocationQueryDto]),
    __metadata("design:returntype", Promise)
], FhirFacilitiesController.prototype, "searchLocations", null);
__decorate([
    (0, common_1.Get)('Location/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'FHIR Location read',
        description: 'Retrieve a single FHIR Location resource by its UUID.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'The Location UUID (facility ID)',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FHIR Location resource',
        schema: {
            properties: {
                resourceType: { type: 'string', example: 'Location' },
                id: { type: 'string' },
                identifier: { type: 'array' },
                status: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'array' },
                address: { type: 'object' },
                physicalType: { type: 'object' },
                position: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Location not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FhirFacilitiesController.prototype, "getLocation", null);
exports.FhirFacilitiesController = FhirFacilitiesController = __decorate([
    (0, swagger_1.ApiTags)('FHIR - Location'),
    (0, common_1.Controller)('v1/fhir'),
    __metadata("design:paramtypes", [facilities_service_1.FacilitiesService])
], FhirFacilitiesController);
//# sourceMappingURL=fhir-facilities.controller.js.map