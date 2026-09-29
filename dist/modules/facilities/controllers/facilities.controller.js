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
exports.FacilitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const facilities_service_1 = require("../services/facilities.service");
const facilities_dto_1 = require("../dto/facilities.dto");
const facility_entity_1 = require("../entities/facility.entity");
let FacilitiesController = class FacilitiesController {
    facilitiesService;
    constructor(facilitiesService) {
        this.facilitiesService = facilitiesService;
    }
    async list(query) {
        return this.facilitiesService.list(query);
    }
    async getByCode(code) {
        return { data: await this.facilitiesService.getByCode(code) };
    }
    async listStates() {
        return { data: await this.facilitiesService.getStates() };
    }
    async nearby(lat, lng, radius, limit) {
        return {
            data: await this.facilitiesService.findNearby(Number(lat), Number(lng), Number(radius || 50), Math.min(Math.max(Number(limit || 20), 1), 100)),
        };
    }
    async listCentroids(by) {
        return { data: await this.facilitiesService.getCentroids(by === 'lga' ? 'lga' : 'state') };
    }
    async listWards() {
        return { data: await this.facilitiesService.getWards() };
    }
    async listWardOptions(search, lga, state, limit) {
        return { data: await this.facilitiesService.getWardOptions(search, lga, state, Number(limit || 50)) };
    }
    async listLgas() {
        return { data: await this.facilitiesService.getLgas() };
    }
    async listFacilityTypes() {
        return { data: await this.facilitiesService.getFacilityTypes() };
    }
    async listFacilityLevels() {
        return { data: await this.facilitiesService.getFacilityLevels() };
    }
    async nearbyFacility(facilityId, radius, limit, nameLike) {
        return {
            data: await this.facilitiesService.findNearbyFacility(facilityId, {
                radiusKm: Number(radius || 25),
                limit: Math.min(Math.max(Number(limit || 50), 1), 100),
                nameLike: nameLike || undefined,
            }),
        };
    }
    async getById(id) {
        return { data: await this.facilitiesService.getById(id) };
    }
};
exports.FacilitiesController = FacilitiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List/search facilities',
        description: 'Query facilities by code, ward, LGA, facility type, and facility level. ' +
            'All filters are optional, combinable, and use the entity codes for matching. ' +
            'Returns paginated results.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'code',
        required: false,
        description: 'Filter by facility code (exact match on facilityId)',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'ward',
        required: false,
        description: 'Filter by ward code (exact match on WardEntity.code)',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'lga',
        required: false,
        description: 'Filter by LGA code (exact match on LgaEntity.code)',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'facility_type',
        required: false,
        description: 'Filter by facility type code (exact match on FacilityTypeEntity.code)',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'facility_level',
        required: false,
        description: 'Filter by facility level code (exact match on FacilityLevelEntity.code)',
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
        description: 'Paginated list of facilities',
        schema: {
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: (0, swagger_1.getSchemaPath)(facility_entity_1.FacilityEntity) },
                },
                meta: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [facilities_dto_1.FacilityListQueryDto]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get facility by code',
        description: 'Retrieve a single facility by its unique facility code (facilityId). Includes related state, LGA, ward, facility type, and facility level.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'code',
        description: 'The facility code (facilityId)',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The facility with related entities',
        type: facility_entity_1.FacilityEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Get)('states'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all states',
        description: 'Retrieve all state reference data.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of states' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "listStates", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({
        summary: 'Facilities nearest to a coordinate',
        description: 'Haversine nearest-search ordered by distance. Handles the registry\u2019s ' +
            'transposed-coordinate band transparently (flags corrected rows). Radius in km.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'lat', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lng', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'radius', required: false, type: Number, description: 'Radius in km (default 50)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Max rows (default 20, max 100)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of nearby facilities with distanceKm' }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "nearby", null);
__decorate([
    (0, common_1.Get)('centroids'),
    (0, swagger_1.ApiOperation)({
        summary: 'Average facility coordinates by state or LGA',
        description: 'Data-derived map centroids: average lat/lng of geo-tagged facilities grouped ' +
            'by state (`?by=state`, default) or LGA (`?by=lga`). Useful for area-level pins ' +
            'on maps when individual records lack coordinates.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'by',
        required: false,
        enum: ['state', 'lga'],
        description: 'Grouping level (defaults to state)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of centroids with code, name, lat/lng, facility count' }),
    __param(0, (0, common_1.Query)('by')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "listCentroids", null);
__decorate([
    (0, common_1.Get)('wards'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all wards',
        description: 'Retrieve all ward reference data.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of wards' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "listWards", null);
__decorate([
    (0, common_1.Get)('wards-lite'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ward names for filter dropdowns',
        description: 'Distinct ward names (with LGA code where known), ordered and deduplicated — ' +
            'sized for locator filter dropdowns. Optional `search` and `lga` narrowing.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'lga', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'state', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of { name, lgaCode }' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('lga')),
    __param(2, (0, common_1.Query)('state')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "listWardOptions", null);
__decorate([
    (0, common_1.Get)('lgas'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all LGAs',
        description: 'Retrieve all LGA reference data.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of LGAs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "listLgas", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all facility types',
        description: 'Retrieve all facility type reference data.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of facility types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "listFacilityTypes", null);
__decorate([
    (0, common_1.Get)('levels'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all facility levels',
        description: 'Retrieve all facility level reference data.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of facility levels' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "listFacilityLevels", null);
__decorate([
    (0, common_1.Get)(':facilityId/nearby'),
    (0, swagger_1.ApiOperation)({
        summary: 'Facilities near a facility',
        description: 'Haversine nearest-search around a facility\u2019s own coordinates (transposed-coordinate ' +
            'band handled). Optional `nameLike` constrains the subset, e.g. `hospital` for the ' +
            'hospitals registry. Returns [] when the anchor facility has no coordinates.',
    }),
    (0, swagger_1.ApiParam)({ name: 'facilityId', type: String }),
    (0, swagger_1.ApiQuery)({ name: 'radius', required: false, type: Number, description: 'Radius in km (default 25)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Max rows (default 50, max 100)' }),
    (0, swagger_1.ApiQuery)({ name: 'nameLike', required: false, type: String, description: 'Name substring filter, e.g. hospital' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of nearby facilities with distanceKm' }),
    __param(0, (0, common_1.Param)('facilityId')),
    __param(1, (0, common_1.Query)('radius')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('nameLike')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "nearbyFacility", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get facility by ID',
        description: 'Retrieve a single facility by its UUID. Includes related state, LGA, ward, facility type, and facility level.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'The facility UUID',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The facility with related entities',
        type: facility_entity_1.FacilityEntity,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "getById", null);
exports.FacilitiesController = FacilitiesController = __decorate([
    (0, swagger_1.ApiTags)('Facilities'),
    (0, common_1.Controller)('v1/facilities'),
    (0, swagger_1.ApiExtraModels)(facility_entity_1.FacilityEntity),
    __metadata("design:paramtypes", [facilities_service_1.FacilitiesService])
], FacilitiesController);
//# sourceMappingURL=facilities.controller.js.map