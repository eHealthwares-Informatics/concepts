import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDosageFormDto, ListDosageFormsDto, UpdateDosageFormDto } from '../dto/dosage-forms.dto';
import { DosageFormsService } from '../services/dosage-forms.service';

@ApiTags('dosage-forms')
@Controller('v1/dosage-forms')
export class DosageFormsController {
  constructor(private readonly dosageFormsService: DosageFormsService) {}

  @Get()
  async list(@Query() query: ListDosageFormsDto) {
    const result = await this.dosageFormsService.list(query);
    return {
      data: result.data,
      meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
    };
  }

  @Get(':dosageFormId')
  async get(@Param('dosageFormId') dosageFormId: string) {
    return { data: await this.dosageFormsService.get(dosageFormId) };
  }

  @Post()
  async create(@Body() payload: CreateDosageFormDto) {
    return { data: await this.dosageFormsService.create(payload) };
  }

  @Put(':dosageFormId')
  async replace(@Param('dosageFormId') dosageFormId: string, @Body() payload: UpdateDosageFormDto) {
    return { data: await this.dosageFormsService.update(dosageFormId, payload) };
  }

  @Patch(':dosageFormId')
  async patch(@Param('dosageFormId') dosageFormId: string, @Body() payload: UpdateDosageFormDto) {
    return { data: await this.dosageFormsService.update(dosageFormId, payload) };
  }

  @Delete(':dosageFormId')
  async remove(@Param('dosageFormId') dosageFormId: string): Promise<void> {
    await this.dosageFormsService.remove(dosageFormId);
  }
}
