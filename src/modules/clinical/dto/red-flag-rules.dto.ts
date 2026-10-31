import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { TriageOutcome } from '../types/clinical-triage.types';

export class ListRedFlagRulesDto {
  @ApiPropertyOptional({ description: 'Filter by protocol version (exact match)' })
  @IsOptional()
  @IsString()
  protocolVersion?: string;

  @ApiPropertyOptional({ description: 'Filter by severity (CRITICAL | MAJOR | MINOR)' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ description: 'Only enabled rules (defaults to all)' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isEnabled?: boolean;
}

export class CreateRedFlagRuleDto {
  @ApiProperty({ description: 'e.g. ACNE_RF_SEVERE_PAIN' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({
    description:
      'Predicate: { complaintCodes?, presentSymptoms?, absentSymptoms?, contraindications?, requiredFields? }',
  })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiProperty({ enum: ['CRITICAL', 'MAJOR', 'MINOR'] })
  @IsString()
  severity!: string;

  @ApiProperty({ enum: TriageOutcome })
  @IsEnum(TriageOutcome)
  triageOutcome!: TriageOutcome;

  @ApiProperty()
  @IsString()
  requiredAction!: string;

  @ApiProperty()
  @IsString()
  message!: string;

  @ApiProperty({ description: 'Guideline version, e.g. NSTG-2022-v1' })
  @IsString()
  protocolVersion!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  evidence?: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateRedFlagRuleDto extends PartialType(CreateRedFlagRuleDto) {}

export class ListContraindicationsDto {
  @ApiPropertyOptional({ description: 'Filter by significance (ABSOLUTE | RELATIVE)' })
  @IsOptional()
  @IsString()
  significance?: string;
}

export class CreateContraindicationDto {
  @ApiProperty({ description: 'e.g. PREGNANCY' })
  @IsString()
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  applicability?: Record<string, any>;

  @ApiProperty({ enum: ['ABSOLUTE', 'RELATIVE'] })
  @IsString()
  significance!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicineExclusions?: string[];
}

export class UpdateContraindicationDto extends PartialType(CreateContraindicationDto) {}
