import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListGenericDrugsDto } from '../dto/generic-drugs.dto';
import { GenericDrugsService } from '../services/generic-drugs.service';
import type { GenericDrugType } from '../types/drugs.types';

@ApiTags('drugs')
@Controller('v1/generic-drugs')
export class GenericDrugsController {
  constructor(private readonly service: GenericDrugsService) {}

  @Get()
  @ApiOperation({ summary: 'List generic drugs' })
  @ApiOkResponse({ description: 'Paged generic drugs' })
  async list(@Query() query: ListGenericDrugsDto) {
    const { data, total } = await this.service.list(query);
    return { data, meta: { total } };
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a generic drug by GN code' })
  async getByCode(@Param('code') code: string): Promise<{ data: GenericDrugType }> {
    const data = await this.service.getByCode(code);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a generic drug by id' })
  async get(@Param('id') id: string): Promise<{ data: GenericDrugType }> {
    const data = await this.service.get(id);
    return { data };
  }
}