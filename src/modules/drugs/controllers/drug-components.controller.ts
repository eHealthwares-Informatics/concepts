import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDrugComponentDto, ListDrugComponentsDto, UpdateDrugComponentDto } from '../dto/drug-components.dto';
import { DrugComponentsService } from '../services/drug-components.service';

@ApiTags('drug-components')
@Controller('v1/drug-components')
export class DrugComponentsController {
  constructor(private readonly drugComponentsService: DrugComponentsService) {}

  @Get()
  async list(@Query() query: ListDrugComponentsDto) {
    const result = await this.drugComponentsService.list(query);
    return {
      data: result.data,
      meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
    };
  }

  @Get(':drugComponentId')
  async get(@Param('drugComponentId') drugComponentId: string) {
    return { data: await this.drugComponentsService.get(drugComponentId) };
  }

  @Post()
  async create(@Body() payload: CreateDrugComponentDto) {
    return { data: await this.drugComponentsService.create(payload) };
  }

  @Put(':drugComponentId')
  async replace(@Param('drugComponentId') drugComponentId: string, @Body() payload: UpdateDrugComponentDto) {
    return { data: await this.drugComponentsService.update(drugComponentId, payload) };
  }

  @Patch(':drugComponentId')
  async patch(@Param('drugComponentId') drugComponentId: string, @Body() payload: UpdateDrugComponentDto) {
    return { data: await this.drugComponentsService.update(drugComponentId, payload) };
  }

  @Delete(':drugComponentId')
  async remove(@Param('drugComponentId') drugComponentId: string): Promise<void> {
    await this.drugComponentsService.remove(drugComponentId);
  }
}
