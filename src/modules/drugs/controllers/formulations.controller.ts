import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateFormulationDto, ListFormulationsDto, UpdateFormulationDto } from '../dto/formulations.dto';
import { FormulationsService } from '../services/formulations.service';

@ApiTags('formulations')
@Controller('v1/formulations')
export class FormulationsController {
  constructor(private readonly formulationsService: FormulationsService) {}

  @Get()
  async list(@Query() query: ListFormulationsDto) {
    const result = await this.formulationsService.list(query);
    return {
      data: result.data,
      meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
    };
  }

  @Get(':formulationId')
  async get(@Param('formulationId') formulationId: string) {
    return { data: await this.formulationsService.get(formulationId) };
  }

  @Post()
  async create(@Body() payload: CreateFormulationDto) {
    return { data: await this.formulationsService.create(payload) };
  }

  @Put(':formulationId')
  async replace(@Param('formulationId') formulationId: string, @Body() payload: UpdateFormulationDto) {
    return { data: await this.formulationsService.update(formulationId, payload) };
  }

  @Patch(':formulationId')
  async patch(@Param('formulationId') formulationId: string, @Body() payload: UpdateFormulationDto) {
    return { data: await this.formulationsService.update(formulationId, payload) };
  }

  @Delete(':formulationId')
  async remove(@Param('formulationId') formulationId: string): Promise<void> {
    await this.formulationsService.remove(formulationId);
  }
}
