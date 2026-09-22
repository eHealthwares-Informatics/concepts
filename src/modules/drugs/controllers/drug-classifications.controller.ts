import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListDrugClassificationsDto } from '../dto/drug-classifications.dto';
import { DrugClassificationsService } from '../services/drug-classifications.service';
import type { DrugClassificationType } from '../types/drugs.types';

@ApiTags('drugs')
@Controller('v1/drug-classifications')
export class DrugClassificationsController {
  constructor(private readonly service: DrugClassificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List drug classifications (filter by type)' })
  @ApiOkResponse({ description: 'Paged drug classifications' })
  async list(@Query() query: ListDrugClassificationsDto) {
    const { data, total } = await this.service.list(query);
    return { data, meta: { total } };
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a drug classification by TC/PC code' })
  async getByCode(@Param('code') code: string): Promise<{ data: DrugClassificationType }> {
    const data = await this.service.getByCode(code);
    return { data };
  }

  @Get(':id/relations')
  @ApiOperation({ summary: 'Get generic drugs and products linked to a classification' })
  async relations(@Param('id') id: string) {
    return { data: await this.service.getRelations(id) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a drug classification by id' })
  async get(@Param('id') id: string): Promise<{ data: DrugClassificationType }> {
    const data = await this.service.get(id);
    return { data };
  }
}