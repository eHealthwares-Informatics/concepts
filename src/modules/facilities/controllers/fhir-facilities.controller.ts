import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FacilitiesService } from '../services/facilities.service';
import { FhirLocationQueryDto } from '../dto/facilities.dto';

@ApiTags('FHIR - Location')
@Controller('v1/fhir')
export class FhirFacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get('Location')
  @ApiOperation({
    summary: 'FHIR Location search',
    description:
      'Search for FHIR Location resources representing healthcare facilities. ' +
      'Supports filtering by identifier, name, type, physical-type (facility level), ward, and LGA. ' +
      'Returns a FHIR Bundle of type searchset.',
  })
  @ApiQuery({
    name: 'identifier',
    required: false,
    description: 'Search by facility identifier (facilityId)',
    type: String,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Search by facility name (partial match, case-insensitive)',
    type: String,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by facility type code',
    type: String,
  })
  @ApiQuery({
    name: 'physical-type',
    required: false,
    description: 'Filter by facility level code (maps to FHIR physicalType)',
    type: String,
  })
  @ApiQuery({
    name: 'ward',
    required: false,
    description: 'Filter by ward code',
    type: String,
  })
  @ApiQuery({
    name: 'lga',
    required: false,
    description: 'Filter by LGA code',
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
  })
  async searchLocations(@Query() query: FhirLocationQueryDto) {
    return this.facilitiesService.listFhirLocations(query);
  }

  @Get('Location/:id')
  @ApiOperation({
    summary: 'FHIR Location read',
    description: 'Retrieve a single FHIR Location resource by its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The Location UUID (facility ID)',
    type: String,
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async getLocation(@Param('id') id: string) {
    return this.facilitiesService.getFhirLocation(id);
  }
}
