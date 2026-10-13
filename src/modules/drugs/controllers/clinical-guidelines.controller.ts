import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListClinicalGuidelinesDto } from '../dto/clinical-guidelines.dto';
import { ClinicalGuidelinesService } from '../services/clinical-guidelines.service';
import type { GuidelineDto, GuidelineDrugLineDto } from '../services/clinical-guidelines.service';

@ApiTags('drugs')
@Controller('v1/clinical-guidelines')
export class ClinicalGuidelinesController {
  constructor(private readonly service: ClinicalGuidelinesService) {}

  @Get()
  @ApiOperation({ summary: 'List clinical guidelines (NSTG conditions)' })
  @ApiOkResponse({ description: 'Paged clinical guidelines' })
  async list(@Query() query: ListClinicalGuidelinesDto) {
    const { data, meta } = await this.service.list(query);
    return { data, meta };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a guideline by condition slug (e.g. acne-vulgaris)' })
  async getBySlug(@Param('slug') slug: string): Promise<{ data: GuidelineDto }> {
    const data = await this.service.getBySlug(slug);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a guideline by id' })
  async get(@Param('id') id: string): Promise<{ data: GuidelineDto }> {
    const data = await this.service.get(id);
    return { data };
  }

  @Get(':id/drug-lines')
  @ApiOperation({ summary: 'Resolved treatment drug lines for a guideline' })
  async drugLines(@Param('id') id: string): Promise<{ data: GuidelineDrugLineDto[] }> {
    const data = await this.service.drugLinesForGuideline(id);
    return { data };
  }

  @Get(':id/generic-drugs')
  @ApiOperation({ summary: 'Generic drugs referenced by a guideline' })
  async genericDrugs(
    @Param('id') id: string,
  ): Promise<{ data: Array<{ id: string; code: string; name: string }> }> {
    const data = await this.service.genericDrugsForGuideline(id);
    return { data };
  }
}
