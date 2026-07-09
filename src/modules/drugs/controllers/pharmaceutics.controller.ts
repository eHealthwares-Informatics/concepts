import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePharmaceuticsDto, ListPharmaceuticsDto, UpdatePharmaceuticsDto } from '../dto/pharmaceutics.dto';
import { PharmaceuticsService } from '../services/pharmaceutics.service';

@ApiTags('pharmaceutics')
@Controller('v1/pharmaceutics')
export class PharmaceuticsController {
  constructor(private readonly pharmaceuticsService: PharmaceuticsService) {}

  @Get()
  async list(@Query() query: ListPharmaceuticsDto) {
    const result = await this.pharmaceuticsService.list(query);
    return {
      data: result.data,
      meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
    };
  }

  @Get(':pharmaceuticsId')
  async get(@Param('pharmaceuticsId') pharmaceuticsId: string) {
    return { data: await this.pharmaceuticsService.get(pharmaceuticsId) };
  }

  @Post()
  async create(@Body() payload: CreatePharmaceuticsDto) {
    return { data: await this.pharmaceuticsService.create(payload) };
  }

  @Put(':pharmaceuticsId')
  async replace(@Param('pharmaceuticsId') pharmaceuticsId: string, @Body() payload: UpdatePharmaceuticsDto) {
    return { data: await this.pharmaceuticsService.update(pharmaceuticsId, payload) };
  }

  @Patch(':pharmaceuticsId')
  async patch(@Param('pharmaceuticsId') pharmaceuticsId: string, @Body() payload: UpdatePharmaceuticsDto) {
    return { data: await this.pharmaceuticsService.update(pharmaceuticsId, payload) };
  }

  @Delete(':pharmaceuticsId')
  async remove(@Param('pharmaceuticsId') pharmaceuticsId: string): Promise<void> {
    await this.pharmaceuticsService.remove(pharmaceuticsId);
  }
}
