import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClerkingPlanService } from '../services/clerking-plan.service';
import type { RxShopClerkingState } from '../types/clinical-triage.types';

export class NextClerkingQuestionDto {
  @ApiPropertyOptional({
    description:
      'Canonical clerking state read from WorkflowInstance.state — answers already given, complaints, and asked question codes',
  })
  @IsObject()
  state!: RxShopClerkingState;

  @ApiPropertyOptional({ description: 'Question codes the patient skipped or that do not apply' })
  @IsOptional()
  @IsArray()
  skipQuestionCodes?: string[];
}

/**
 * Clerking question endpoints — the generic replacement for per-complaint
 * questionnaire seeds.
 *
 * The conversation service posts the state it has collected and receives the
 * next question to ask; question text, options and ordering all come from the
 * clinical knowledge base. No clerking question is authored in the
 * conversation service, so new symptoms/red flags/contraindications become
 * askable without a conversation deploy.
 */
@ApiTags('clinical')
@Controller('clinical/clerking')
export class ClerkingController {
  constructor(private readonly planner: ClerkingPlanService) {}

  @Get('plan')
  @ApiOperation({ summary: 'Ordered clerking question plan for one or more complaints' })
  async plan(@Query('complaintCodes') complaintCodes: string) {
    const codes = (complaintCodes ?? '')
      .split(',')
      .map((code) => code.trim())
      .filter(Boolean);
    return { data: await this.planner.plan(codes) };
  }

  @Post('next-question')
  @ApiOperation({ summary: 'Next clerking question for a partially answered state' })
  async nextQuestion(@Body() payload: NextClerkingQuestionDto) {
    return {
      data: await this.planner.nextQuestion(payload.state ?? ({} as RxShopClerkingState), payload.skipQuestionCodes ?? []),
    };
  }
}
