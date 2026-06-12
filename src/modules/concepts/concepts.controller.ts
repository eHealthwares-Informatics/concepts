import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { ConceptsService } from './concepts.service';
import { LoincSeederService } from './seeders/loinc.seeder';

@ApiTags('Concepts')
@Controller('v1/concepts')
export class ConceptsController {
  constructor(
    private readonly conceptsService: ConceptsService,
    private readonly loincSeeder: LoincSeederService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a concept' })
  @ApiBody({
    schema: {
      example: {
        code: { concept: 'LOINC', code: '1234-5' },
        conceptValues: [],
        externalMappings: [],
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Concept created' })
  async addConcept(@Body() payload: any) {
    return {
      data: await this.conceptsService.addConcept(payload),
    };
  }

  @Post('codes')
  @ApiOperation({ summary: 'Create a code' })
  async createCode(@Body() payload: Record<string, any>) {
    return {
      data: await this.conceptsService.createCode(payload),
    };
  }

  @Post('upload/codes')
  @ApiOperation({ summary: 'Bulk upload codes' })
  async uploadCodes(@Body() payload: Record<string, any>[]) {
    return {
      data: await this.conceptsService.uploadCodes(payload),
    };
  }

  @Post('values')
  @ApiOperation({ summary: 'Create concept value' })
  async createConceptValue(@Body() payload: Record<string, any>) {
    return {
      data: await this.conceptsService.createConceptValue(payload),
    };
  }

  @Post('upload/values')
  @ApiOperation({ summary: 'Bulk upload concept values' })
  async uploadConceptValues(@Body() payload: Record<string, any>[]) {
    return {
      data: await this.conceptsService.uploadConceptValues(payload),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List concepts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async listConcepts(
    @Query() query: Record<string, any>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {

    const {page: _, limit: __, ...filters} = query; 
    return this.conceptsService.listConcepts({
      page: Number(page || 1),
      limit: Number(limit || 20),
      filters,
    });
  }

  @Get('search/:concept/:conceptCode')
  @ApiOperation({ summary: 'Search concept by concept and code' })
  @ApiParam({ name: 'concept' })
  @ApiParam({ name: 'conceptCode' })
  @ApiQuery({ name: 'metadata', required: false })
  async searchConcept(
    @Param('concept') concept: string,
    @Param('conceptCode') conceptCode: string,
    @Query('metadata') metadata?: string,
  ) {
    return {
      data: await this.conceptsService.searchConcept(
        concept,
        conceptCode,
        metadata === 'true',
      ),
    };
  }

  @Get('match/:concept/:conceptCode')
  @ApiOperation({ summary: 'Match concepts across concepts' })
  async matchConcepts(
    @Param('concept') concept: string,
    @Param('conceptCode') conceptCode: string,
    @Query('metadata') metadata?: string,
  ) {
    return {
      data: await this.conceptsService.matchConcepts(
        concept,
        conceptCode,
        metadata === 'true',
      ),
    };
  }

  @Get('values')
  @ApiOperation({ summary: 'List concept values' })
  async listValues(
    @Query() query:  Record<string, string>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { page: _, limit: __, ...filters } = query;
    return this.conceptsService.listConceptValues({
      page: Number(page || 1),
      limit: Number(limit || 20),
      filters
    });
  }

  @Get('attributes/:concept')
  @ApiOperation({ summary: 'List concept values' })
  async listConceptAttributes(
    @Query() query:  Record<string, string>,
    @Query('page') page?: string,
    @Query('concept') concept?: string,
    @Query('limit') limit?: string,
  ) {
    const { page: _, limit: __, ...filters } = query;
    return this.conceptsService.listConceptAttributes({
      page: Number(page || 1),
      limit: Number(limit || 20),
      filters
    });
  }

  @Put('values/:id')
  @ApiOperation({ summary: 'Update concept value' })
  async updateValue(
    @Param('id') id: string,
    @Body() payload: Record<string, any>,
  ) {
    return {
      data: await this.conceptsService.updateConceptValue(id, payload),
    };
  }

  @Delete('values/:id')
  @ApiOperation({ summary: 'Delete concept value' })
  async deleteValue(@Param('id') id: string) {
    return this.conceptsService.deleteConceptValue(id);
  }

  @Post('mappings')
  @ApiOperation({ summary: 'Create external mapping' })
  async createMapping(@Body() payload: Record<string, any>) {
    return {
      data: await this.conceptsService.createExternalMapping(payload),
    };
  }

  @Get('mappings')
  @ApiOperation({ summary: 'List external mappings' })
  async listMappings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('externalConcept') externalConcept?: string,
    @Query('externalCode') externalCode?: string,
    @Query('internalConcept') internalConcept?: string,
  ) {
    return this.conceptsService.listExternalMappings({
      page: Number(page || 1),
      limit: Number(limit || 20),
      externalConcept,
      externalCode,
      internalConcept,
    });
  }

  @Put('mappings/:id')
  @ApiOperation({ summary: 'Update external mapping' })
  async updateMapping(
    @Param('id') id: string,
    @Body() payload: Record<string, any>,
  ) {
    return {
      data: await this.conceptsService.updateExternalMapping(id, payload),
    };
  }

  @Delete('mappings/:id')
  @ApiOperation({ summary: 'Delete external mapping' })
  async deleteMapping(@Param('id') id: string) {
    return this.conceptsService.deleteExternalMapping(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get concept by ID' })
  async getConcept(@Param('id') id: string) {
    return {
      data: await this.conceptsService.getConcept(id),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update concept' })
  async updateConcept(
    @Param('id') id: string,
    @Body() payload: Record<string, any>,
  ) {
    return {
      data: await this.conceptsService.updateConcept(id, payload),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete concept' })
  async deleteConcept(@Param('id') id: string) {
    return this.conceptsService.deleteConcept(id);
  }

  // Seeding
  @Post('seed/loinc')
  @ApiOperation({ summary: 'Trigger LOINC seed' })
  async seedLoinc(@Query('triggeredBy') triggeredBy?: string) {
    return this.loincSeeder.seedLoincData(triggeredBy || 'manual');
  }

  @Get('seed/loinc/history')
  @ApiOperation({ summary: 'Get LOINC import history' })
  async getLoincImportHistory(@Query('limit') limit?: string) {
    return {
      data: await this.loincSeeder.getImportHistory(
        Math.min(Math.max(Number(limit || 10), 1), 100),
      ),
    };
  }

  @Get('seed/loinc/status')
  @ApiOperation({ summary: 'Get LOINC import status' })
  async getLoincImportStatus() {
    return {
      data: await this.loincSeeder.getLatestImportStatus(),
    };
  }
}