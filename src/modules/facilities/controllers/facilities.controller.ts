import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { FacilitiesService } from '../services/facilities.service';
import { FacilityListQueryDto } from '../dto/facilities.dto';
import { FacilityEntity } from '../entities/facility.entity';

@ApiTags('Facilities')
@Controller('v1/facilities')
@ApiExtraModels(FacilityEntity)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  @ApiOperation({
    summary: 'List/search facilities',
    description:
      'Query facilities by code, ward, LGA, facility type, and facility level. ' +
      'All filters are optional, combinable, and use the entity codes for matching. ' +
      'Returns paginated results.',
  })
  @ApiQuery({
    name: 'code',
    required: false,
    description: 'Filter by facility code (exact match on facilityId)',
    type: String,
  })
  @ApiQuery({
    name: 'ward',
    required: false,
    description: 'Filter by ward code (exact match on WardEntity.code)',
    type: String,
  })
  @ApiQuery({
    name: 'lga',
    required: false,
    description: 'Filter by LGA code (exact match on LgaEntity.code)',
    type: String,
  })
  @ApiQuery({
    name: 'facility_type',
    required: false,
    description:
      'Filter by facility type code (exact match on FacilityTypeEntity.code)',
    type: String,
  })
  @ApiQuery({
    name: 'facility_level',
    required: false,
    description:
      'Filter by facility level code (exact match on FacilityLevelEntity.code)',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts at 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of facilities',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(FacilityEntity) },
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
  })
  async list(@Query() query: FacilityListQueryDto) {
    return this.facilitiesService.list(query);
  }

  @Get('code/:code')
  @ApiOperation({
    summary: 'Get facility by code',
    description:
      'Retrieve a single facility by its unique facility code (facilityId). Includes related state, LGA, ward, facility type, and facility level.',
  })
  @ApiParam({
    name: 'code',
    description: 'The facility code (facilityId)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The facility with related entities',
    type: FacilityEntity,
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async getByCode(@Param('code') code: string) {
    return { data: await this.facilitiesService.getByCode(code) };
  }

  @Get('states')
  @ApiOperation({
    summary: 'List all states',
    description: 'Retrieve all state reference data.',
  })
  @ApiResponse({ status: 200, description: 'Array of states' })
  async listStates() {
    return { data: await this.facilitiesService.getStates() };
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Facilities nearest to a coordinate',
    description:
      'Haversine nearest-search ordered by distance. Handles the registry\u2019s ' +
      'transposed-coordinate band transparently (flags corrected rows). Radius in km.',
  })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radius in km (default 50)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max rows (default 20, max 100)' })
  @ApiResponse({ status: 200, description: 'Array of nearby facilities with distanceKm' })
  async nearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    return {
      data: await this.facilitiesService.findNearby(
        Number(lat),
        Number(lng),
        Number(radius || 50),
        Math.min(Math.max(Number(limit || 20), 1), 100),
      ),
    };
  }

  @Get('centroids')
  @ApiOperation({
    summary: 'Average facility coordinates by state or LGA',
    description:
      'Data-derived map centroids: average lat/lng of geo-tagged facilities grouped ' +
      'by state (`?by=state`, default) or LGA (`?by=lga`). Useful for area-level pins ' +
      'on maps when individual records lack coordinates.',
  })
  @ApiQuery({
    name: 'by',
    required: false,
    enum: ['state', 'lga'],
    description: 'Grouping level (defaults to state)',
  })
  @ApiResponse({ status: 200, description: 'Array of centroids with code, name, lat/lng, facility count' })
  async listCentroids(@Query('by') by?: 'state' | 'lga') {
    return { data: await this.facilitiesService.getCentroids(by === 'lga' ? 'lga' : 'state') };
  }

  @Get('wards')
  @ApiOperation({
    summary: 'List all wards',
    description: 'Retrieve all ward reference data.',
  })
  @ApiResponse({ status: 200, description: 'Array of wards' })
  async listWards() {
    return { data: await this.facilitiesService.getWards() };
  }

  @Get('wards-lite')
  @ApiOperation({
    summary: 'Ward names for filter dropdowns',
    description:
      'Distinct ward names (with LGA code where known), ordered and deduplicated — ' +
      'sized for locator filter dropdowns. Optional `search` and `lga` narrowing.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'lga', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Array of { name, lgaCode }' })
  async listWardOptions(
    @Query('search') search?: string,
    @Query('lga') lga?: string,
    @Query('state') state?: string,
    @Query('limit') limit?: string,
  ) {
    return { data: await this.facilitiesService.getWardOptions(search, lga, state, Number(limit || 50)) };
  }

  @Get('lgas')
  @ApiOperation({
    summary: 'List all LGAs',
    description: 'Retrieve all LGA reference data.',
  })
  @ApiResponse({ status: 200, description: 'Array of LGAs' })
  async listLgas() {
    return { data: await this.facilitiesService.getLgas() };
  }

  @Get('types')
  @ApiOperation({
    summary: 'List all facility types',
    description: 'Retrieve all facility type reference data.',
  })
  @ApiResponse({ status: 200, description: 'Array of facility types' })
  async listFacilityTypes() {
    return { data: await this.facilitiesService.getFacilityTypes() };
  }

  @Get('levels')
  @ApiOperation({
    summary: 'List all facility levels',
    description: 'Retrieve all facility level reference data.',
  })
  @ApiResponse({ status: 200, description: 'Array of facility levels' })
  async listFacilityLevels() {
    return { data: await this.facilitiesService.getFacilityLevels() };
  }

  @Get(':facilityId/nearby')
  @ApiOperation({
    summary: 'Facilities near a facility',
    description:
      'Haversine nearest-search around a facility\u2019s own coordinates (transposed-coordinate ' +
      'band handled). Optional `nameLike` constrains the subset, e.g. `hospital` for the ' +
      'hospitals registry. Returns [] when the anchor facility has no coordinates.',
  })
  @ApiParam({ name: 'facilityId', type: String })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radius in km (default 25)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max rows (default 50, max 100)' })
  @ApiQuery({ name: 'nameLike', required: false, type: String, description: 'Name substring filter, e.g. hospital' })
  @ApiResponse({ status: 200, description: 'Array of nearby facilities with distanceKm' })
  async nearbyFacility(
    @Param('facilityId') facilityId: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
    @Query('nameLike') nameLike?: string,
  ) {
    return {
      data: await this.facilitiesService.findNearbyFacility(facilityId, {
        radiusKm: Number(radius || 25),
        limit: Math.min(Math.max(Number(limit || 50), 1), 100),
        nameLike: nameLike || undefined,
      }),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get facility by ID',
    description:
      'Retrieve a single facility by its UUID. Includes related state, LGA, ward, facility type, and facility level.',
  })
  @ApiParam({
    name: 'id',
    description: 'The facility UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The facility with related entities',
    type: FacilityEntity,
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async getById(@Param('id') id: string) {
    return { data: await this.facilitiesService.getById(id) };
  }
}
