import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DiagnosticCentersService } from '../services/diagnostic-centers.service';

@ApiTags('Diagnostic Centers')
@Controller('v1/diagnostic-centers')
export class DiagnosticCentersController {
  constructor(private readonly centersService: DiagnosticCentersService) {}

  @Get()
  @ApiOperation({
    summary: 'List/search diagnostic centers',
    description:
      'Generic search + pagination over the babymigo diagnostic center directory. Free-text ' +
      '`search` matches name, address, description and raw LGA label. Any other query parameter ' +
      'is treated as a filter using the shared filter DSL (`field=TYPE|value|valueTo`), e.g. ' +
      '`state.code=EQUALS|124|`. Returns `{ data, meta: { page, limit, total } }`.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async list(@Query() query: Record<string, any>) {
    const { page, limit, search, ...filters } = query;
    const result = await this.centersService.list({
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

  @Get(':id/nearby')
  @ApiOperation({
    summary: 'Diagnostic centers near a center',
    description:
      'The directory has no coordinates, so proximity is tiered by admin area: ' +
      'same LGA first, then the same state, ordered by name. Each row carries `nearbyTier`.',
  })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'limit', required: false })
  async nearby(@Param('id') id: string, @Query('limit') limit?: string) {
    return { data: await this.centersService.nearby(id, Number(limit || 50)) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a diagnostic center by id' })
  @ApiParam({ name: 'id' })
  async get(@Param('id') id: string) {
    return { data: await this.centersService.get(id) };
  }
}
