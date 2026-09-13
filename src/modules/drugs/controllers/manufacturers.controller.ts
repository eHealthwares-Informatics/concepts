import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateManufacturerDto, ListManufacturersDto, UpdateManufacturerDto } from '../dto/manufacturers.dto';
import { ManufacturersService } from '../services/manufacturers.service';

@ApiTags('manufacturers')
@Controller('v1/manufacturers')
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Get()
  async list(@Query() query: ListManufacturersDto) {
    const result = await this.manufacturersService.list(query);
    return {
      data: result.data,
      meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
    };
  }

  @Get(':manufacturerId')
  async get(@Param('manufacturerId') manufacturerId: string) {
    return { data: await this.manufacturersService.get(manufacturerId) };
  }

  @Post()
  async create(@Body() payload: CreateManufacturerDto) {
    return { data: await this.manufacturersService.create(payload) };
  }

  @Put(':manufacturerId')
  async replace(@Param('manufacturerId') manufacturerId: string, @Body() payload: UpdateManufacturerDto) {
    return { data: await this.manufacturersService.update(manufacturerId, payload) };
  }

  @Patch(':manufacturerId')
  async patch(@Param('manufacturerId') manufacturerId: string, @Body() payload: UpdateManufacturerDto) {
    return { data: await this.manufacturersService.update(manufacturerId, payload) };
  }

  @Delete(':manufacturerId')
  async remove(@Param('manufacturerId') manufacturerId: string): Promise<void> {
    await this.manufacturersService.remove(manufacturerId);
  }
}
