import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LocalitiesService } from '../services/localities.service';

@ApiTags('Localities')
@Controller('v1/localities')
export class LocalitiesController {
  constructor(private readonly localitiesService: LocalitiesService) {}

  @Get()
  @ApiOperation({
    summary: 'List/search localities',
    description:
      'Resolved pharmacy localities (area | neighbourhood | settlement). Free-text `search` ' +
      'matches the name; `type` restricts to one locality type. Any other query parameter is a ' +
      'filter using the shared DSL. Returns `{ data, meta: { page, limit, total } }`.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['area', 'neighbourhood', 'settlement'] })
  async list(@Query() query: Record<string, any>) {
    const { page, limit, search, type, ...filters } = query;
    const result = await this.localitiesService.list({
      page: Number(page || 1),
      limit: Number(limit || 20),
      search,
      type,
      filters,
    });
    return {
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total },
    };
  }

  @Get(':localityId/nearby')
  @ApiOperation({ summary: 'Neighbouring localities (ward, LGA, then coordinate proximity)' })
  @ApiParam({ name: 'localityId' })
  @ApiQuery({ name: 'limit', required: false })
  async nearby(@Param('localityId') localityId: string, @Query('limit') limit?: string) {
    return { data: await this.localitiesService.nearby(localityId, Number(limit || 50)) };
  }

  @Get(':localityId')
  @ApiOperation({ summary: 'Get a locality by id' })
  @ApiParam({ name: 'localityId' })
  async get(@Param('localityId') localityId: string) {
    return { data: await this.localitiesService.get(localityId) };
  }
}
