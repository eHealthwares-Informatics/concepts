import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGenericProductDto, ListGenericProductsDto, UpdateGenericProductDto } from '../dto/generic-products.dto';
import { GenericProductsService } from '../services/generic-products.service';

@ApiTags('generic-products')
@Controller('v1/generic-products')
export class GenericProductsController {
  constructor(private readonly genericProductsService: GenericProductsService) {}

  @Get()
  async list(@Query() query: ListGenericProductsDto) {
    const result = await this.genericProductsService.list(query);
    return {
      data: result.data,
      meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total, totalPages: Math.ceil(result.total / (query.limit ?? 20)) },
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search generic products returning lightweight results' })
  async search(@Query() query: ListGenericProductsDto) {
    const result = await this.genericProductsService.list(query);
    return {
      data: result.data.map((item) => ({ id: item.id, code: item.code, name: item.name })),
      meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: result.total },
    };
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get generic product by code' })
  async getByCode(@Param('code') code: string) {
    return { data: await this.genericProductsService.getByCode(code) };
  }

  @Get(':genericProductId')
  async get(@Param('genericProductId') genericProductId: string) {
    return { data: await this.genericProductsService.get(genericProductId) };
  }

  @Post()
  async create(@Body() payload: CreateGenericProductDto) {
    return { data: await this.genericProductsService.create(payload) };
  }

  @Put(':genericProductId')
  async replace(@Param('genericProductId') genericProductId: string, @Body() payload: UpdateGenericProductDto) {
    return { data: await this.genericProductsService.update(genericProductId, payload) };
  }

  @Patch(':genericProductId')
  async patch(@Param('genericProductId') genericProductId: string, @Body() payload: UpdateGenericProductDto) {
    return { data: await this.genericProductsService.update(genericProductId, payload) };
  }

  @Delete(':genericProductId')
  async remove(@Param('genericProductId') genericProductId: string): Promise<void> {
    await this.genericProductsService.remove(genericProductId);
  }
}
