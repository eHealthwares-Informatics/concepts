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

  @Get('wards')
  @ApiOperation({
    summary: 'List all wards',
    description: 'Retrieve all ward reference data.',
  })
  @ApiResponse({ status: 200, description: 'Array of wards' })
  async listWards() {
    return { data: await this.facilitiesService.getWards() };
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
