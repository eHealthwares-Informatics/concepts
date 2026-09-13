import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PharmaciesService } from '../services/pharmacies.service';

@ApiTags('Pharmacies')
@Controller('v1/pharmacies')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Get()
  @ApiOperation({
    summary: 'List/search pharmacies',
    description:
      'Generic search + pagination. Free-text `search` matches premises name, pharmacist, ' +
      'certificate number and address. Any other query parameter is treated as a filter using ' +
      'the shared filter DSL (`field=TYPE|value|valueTo`), e.g. `category=EQUALS|Wholesale|`, ' +
      '`state.code=EQUALS|LA|`. Returns `{ data, meta: { page, limit, total } }`.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async list(@Query() query: Record<string, any>) {
    const { page, limit, search, ...filters } = query;
    const result = await this.pharmaciesService.list({
      page: Number(page || 1),
      limit: Number(limit || 20),
      search,
      filters,
    });
    return {
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total },
    };
  }

  @Get(':pharmacyId/nearby')
  @ApiOperation({
    summary: 'Pharmacies near a pharmacy',
    description:
      'Returns pharmacies in the same area and in neighbouring areas, ordered by proximity ' +
      '(same area, ward, LGA, then coordinate distance). Each row carries `nearbyTier` and ' +
      '`nearbyDistanceKm`.',
  })
  @ApiParam({ name: 'pharmacyId' })
  @ApiQuery({ name: 'limit', required: false })
  async nearby(@Param('pharmacyId') pharmacyId: string, @Query('limit') limit?: string) {
    return { data: await this.pharmaciesService.nearby(pharmacyId, Number(limit || 50)) };
  }

  @Get(':pharmacyId')
  @ApiOperation({ summary: 'Get a pharmacy by id' })
  @ApiParam({ name: 'pharmacyId' })
  async get(@Param('pharmacyId') pharmacyId: string) {
    return { data: await this.pharmaciesService.get(pharmacyId) };
  }
}
