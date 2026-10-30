import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminApiKeyGuard } from '../../../common/guards/admin-api-key.guard';
import {
  CreateComplaintDto,
  CreateComplaintSymptomDto,
  CreateClinicalQuestionDto,
  CreateSymptomDto,
  ListComplaintsDto,
  ListSymptomsDto,
  UpdateComplaintDto,
} from '../dto/complaints.dto';
import {
  CreateContraindicationDto,
  CreateRedFlagRuleDto,
  ListContraindicationsDto,
  ListRedFlagRulesDto,
  UpdateContraindicationDto,
  UpdateRedFlagRuleDto,
} from '../dto/red-flag-rules.dto';
import {
  CreateGenericMedicineDto,
  CreateMedicineMappingDto,
  CreateTreatmentPackDto,
  ListGenericMedicinesDto,
  ListTreatmentPacksDto,
  UpdateGenericMedicineDto,
  UpdateTreatmentPackDto,
} from '../dto/treatment-packs.dto';
import { ClinicalEvidenceService } from '../services/clinical-evidence.service';
import { ClinicalMedicationService } from '../services/clinical-medication.service';
import { ClinicalQuestionService } from '../services/clinical-question.service';
import { ComplaintService } from '../services/complaint.service';
import { ContraindicationService } from '../services/contraindication.service';
import { RedFlagRuleService } from '../services/red-flag-rule.service';
import { SymptomService } from '../services/symptom.service';
import { TreatmentPackService } from '../services/treatment-pack.service';

/**
 * Clinical knowledge-base admin CRUD (§4.2/§9.2) for complaints, symptoms,
 * associations, clinical questions, red-flag rules, contraindications, generic
 * medicine attributes and treatment packs.
 *
 * Auth: x-api-key (service-to-service, matches the seed service convention).
 * Clinical content is authored by the seed service or admins — never by end
 * users — and red-flag/pack approval state is admin-controlled so it cannot be
 * bypassed from client actions.
 */
@ApiTags('clinical-admin')
@UseGuards(AdminApiKeyGuard)
@Controller('clinical')
export class ClinicalAdminController {
  constructor(
    private readonly complaints: ComplaintService,
    private readonly symptoms: SymptomService,
    private readonly questions: ClinicalQuestionService,
    private readonly redFlags: RedFlagRuleService,
    private readonly contraindications: ContraindicationService,
    private readonly medications: ClinicalMedicationService,
    private readonly packs: TreatmentPackService,
    private readonly evidence: ClinicalEvidenceService,
  ) {}

  // ── Complaints ─────────────────────────────────────────────────────────
  @Post('complaints')
  @ApiOperation({ summary: 'Create a complaint' })
  async createComplaint(@Body() payload: CreateComplaintDto) {
    return { data: await this.complaints.create(payload) };
  }

  @Get('complaints')
  @ApiOperation({ summary: 'List complaints' })
  async listComplaints(@Query() query: ListComplaintsDto) {
    const result = await this.complaints.list(query);
    return { data: result.data, meta: { total: result.total } };
  }

  @Get('complaints/:id')
  @ApiOperation({ summary: 'Get a complaint by id' })
  async getComplaint(@Param('id') id: string) {
    return { data: await this.complaints.get(id) };
  }

  @Patch('complaints/:id')
  @ApiOperation({ summary: 'Update a complaint' })
  async patchComplaint(@Param('id') id: string, @Body() payload: UpdateComplaintDto) {
    return { data: await this.complaints.update(id, payload) };
  }

  @Delete('complaints/:id')
  @ApiOperation({ summary: 'Delete a complaint' })
  async removeComplaint(@Param('id') id: string) {
    await this.complaints.remove(id);
    return { data: { id, deleted: true } };
  }

  // ── Symptoms ───────────────────────────────────────────────────────────
  @Post('symptoms')
  @ApiOperation({ summary: 'Create a symptom' })
  async createSymptom(@Body() payload: CreateSymptomDto) {
    return { data: await this.symptoms.create(payload) };
  }

  @Get('symptoms')
  @ApiOperation({ summary: 'List symptoms' })
  async listSymptoms(@Query() query: ListSymptomsDto) {
    const result = await this.symptoms.list(query);
    return { data: result.data, meta: { total: result.total } };
  }

  @Post('complaint-symptoms')
  @ApiOperation({ summary: 'Associate a symptom with a complaint' })
  async createAssociation(@Body() payload: CreateComplaintSymptomDto) {
    return { data: await this.symptoms.createAssociation(payload) };
  }

  @Get('complaint-symptoms')
  @ApiOperation({ summary: 'List symptom associations for a complaint' })
  async complaintSymptoms(@Query('complaintCode') complaintCode: string) {
    const data = await this.symptoms.findAssociations(complaintCode);
    return { data, meta: { total: data.length } };
  }

  @Get('complaint-symptoms/by-complaints')
  @ApiOperation({ summary: 'Symptoms applicable to one or more complaints' })
  async symptomsForComplaints(@Query('complaintCodes') complaintCodes: string) {
    const codes = (complaintCodes ?? '')
      .split(',')
      .map((code) => code.trim())
      .filter(Boolean);
    return { data: await this.symptoms.complaintsSymptoms(codes) };
  }

  // ── Clinical question mappings ─────────────────────────────────────────
  @Post('clinical-questions')
  @ApiOperation({ summary: 'Map a questionnaire question to a clinical attribute' })
  async createClinicalQuestion(@Body() payload: CreateClinicalQuestionDto) {
    return { data: await this.questions.create(payload) };
  }

  @Get('clinical-questions')
  @ApiOperation({ summary: 'List clinical question mappings' })
  async listClinicalQuestions(@Query('purpose') purpose?: string) {
    const data = await this.questions.list(purpose);
    return { data, meta: { total: data.length } };
  }

  // ── Red-flag rules ─────────────────────────────────────────────────────
  @Post('red-flag-rules')
  @ApiOperation({ summary: 'Create a red-flag rule' })
  async createRedFlag(@Body() payload: CreateRedFlagRuleDto) {
    return { data: await this.redFlags.create(payload) };
  }

  @Get('red-flag-rules')
  @ApiOperation({ summary: 'List red-flag rules' })
  async listRedFlags(@Query() query: ListRedFlagRulesDto) {
    const data = await this.redFlags.list(query);
    return { data, meta: { total: data.length } };
  }

  @Patch('red-flag-rules/:id')
  @ApiOperation({ summary: 'Update a red-flag rule' })
  async patchRedFlag(@Param('id') id: string, @Body() payload: UpdateRedFlagRuleDto) {
    return { data: await this.redFlags.update(id, payload) };
  }

  @Delete('red-flag-rules/:id')
  @ApiOperation({ summary: 'Delete a red-flag rule' })
  async removeRedFlag(@Param('id') id: string) {
    await this.redFlags.remove(id);
    return { data: { id, deleted: true } };
  }

  // ── Contraindications ──────────────────────────────────────────────────
  @Post('contraindications')
  @ApiOperation({ summary: 'Create a contraindication' })
  async createContraindication(@Body() payload: CreateContraindicationDto) {
    return { data: await this.contraindications.create(payload) };
  }

  @Get('contraindications')
  @ApiOperation({ summary: 'List contraindications' })
  async listContraindications(@Query() query: ListContraindicationsDto) {
    const data = await this.contraindications.list(query);
    return { data, meta: { total: data.length } };
  }

  @Patch('contraindications/:id')
  @ApiOperation({ summary: 'Update a contraindication' })
  async patchContraindication(
    @Param('id') id: string,
    @Body() payload: UpdateContraindicationDto,
  ) {
    return { data: await this.contraindications.update(id, payload) };
  }

  @Delete('contraindications/:id')
  @ApiOperation({ summary: 'Delete a contraindication' })
  async removeContraindication(@Param('id') id: string) {
    await this.contraindications.remove(id);
    return { data: { id, deleted: true } };
  }

  // ── Generic medicines (backed by generic_drugs) ────────────────────────
  @Post('generic-medicines')
  @ApiOperation({ summary: 'Create a clinical generic medicine regimen' })
  async createMedicine(@Body() payload: CreateGenericMedicineDto) {
    return { data: await this.medications.create(payload) };
  }

  @Get('generic-medicines')
  @ApiOperation({ summary: 'List generic medicines with clinical attributes' })
  async listMedicines(@Query() query: ListGenericMedicinesDto) {
    const result = await this.medications.list(query);
    return { data: result.data, meta: { total: result.total } };
  }

  @Patch('generic-medicines/:id')
  @ApiOperation({ summary: 'Update clinical attributes of a generic medicine' })
  async patchMedicine(@Param('id') id: string, @Body() payload: UpdateGenericMedicineDto) {
    return { data: await this.medications.update(id, payload) };
  }

  @Post('medicine-product-mappings')
  @ApiOperation({
    summary: 'Reconcile a generic medicine to a catalogue product (availability)',
  })
  async createMapping(@Body() payload: CreateMedicineMappingDto) {
    return { data: await this.medications.applyMapping(payload) };
  }

  // ── Treatment packs ────────────────────────────────────────────────────
  @Post('treatment-packs')
  @ApiOperation({ summary: 'Create a treatment pack' })
  async createPack(@Body() payload: CreateTreatmentPackDto) {
    return { data: await this.packs.create(payload) };
  }

  @Get('treatment-packs')
  @ApiOperation({ summary: 'List treatment packs' })
  async listPacks(@Query() query: ListTreatmentPacksDto) {
    const result = await this.packs.list(query);
    return { data: result.data, meta: { total: result.total } };
  }

  @Get('treatment-packs/:id')
  @ApiOperation({ summary: 'Get a treatment pack by id' })
  async getPack(@Param('id') id: string) {
    return { data: await this.packs.get(id) };
  }

  @Patch('treatment-packs/:id')
  @ApiOperation({ summary: 'Update a treatment pack (bumps version)' })
  async patchPack(@Param('id') id: string, @Body() payload: UpdateTreatmentPackDto) {
    return { data: await this.packs.update(id, payload) };
  }

  @Delete('treatment-packs/:id')
  @ApiOperation({ summary: 'Delete a treatment pack' })
  async removePack(@Param('id') id: string) {
    await this.packs.remove(id);
    return { data: { id, deleted: true } };
  }

  // ── Clinical evidence ──────────────────────────────────────────────────
  @Post('clinical-evidence')
  @ApiOperation({ summary: 'Record a citation for a pack or rule' })
  async createEvidence(@Body() payload: Record<string, any>) {
    return { data: await this.evidence.create(payload) };
  }

  @Get('clinical-evidence')
  @ApiOperation({ summary: 'Citations for a referenced entity' })
  async listEvidence(@Query('referencedEntity') referencedEntity: string) {
    const data = await this.evidence.forEntity(referencedEntity);
    return { data, meta: { total: data.length } };
  }
}
