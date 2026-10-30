import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssessClinicalStateDto, RecommendClinicalStateDto } from '../dto/assessment.dto';
import { ClinicalAssessmentService } from '../services/clinical-assessment.service';
import { RecommendationService } from '../services/recommendation.service';

/**
 * Run-facing clinical endpoints (§8), served unauthenticated like the previous
 * conversation-hosted implementation.
 *
 *  POST clinical/assessment       — red-flag evaluation only; the conversation
 *      engine calls this after clinically relevant answers and escalations
 *      interrupt routine flow.
 *  POST clinical/recommendations  — server-authoritative recommendation
 *      resolution from the canonical WorkflowInstance.state (single source of
 *      truth; callers pass state read from the workflow, never local edits).
 */
@ApiTags('clinical')
@Controller('clinical')
export class RecommendationController {
  constructor(
    private readonly assessment: ClinicalAssessmentService,
    private readonly recommendations: RecommendationService,
  ) {}

  @Post('assessment')
  @ApiOperation({ summary: 'Evaluate red-flag rules against a clerking state' })
  async assess(@Body() payload: AssessClinicalStateDto) {
    return { data: await this.assessment.assess(payload.state) };
  }

  @Post('recommendations')
  @ApiOperation({ summary: 'Resolve treatment-pack recommendations for a clerking state' })
  async recommend(@Body() payload: RecommendClinicalStateDto) {
    return { data: await this.recommendations.recommend(payload.state) };
  }
}
