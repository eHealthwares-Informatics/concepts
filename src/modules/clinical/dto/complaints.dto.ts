import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ClinicalStatus } from '../types/clinical-triage.types';

export class ListComplaintsDto {
  @ApiPropertyOptional({ description: 'Case-insensitive match on code/name/slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category (exact match)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ClinicalStatus })
  @IsOptional()
  @IsEnum(ClinicalStatus)
  status?: ClinicalStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 20;

  get offset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}

export class CreateComplaintDto {
  @ApiProperty({ description: 'Uppercase mnemonic, e.g. ACNE' })
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Lowercase slug, e.g. acne' })
  @IsString()
  slug!: string;

  @ApiProperty({ description: 'e.g. Skin, Pain & Fever' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  localExpressions?: string[];

  @ApiPropertyOptional({ enum: ClinicalStatus })
  @IsOptional()
  @IsEnum(ClinicalStatus)
  status?: ClinicalStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sourceRefs?: string[];

  @ApiPropertyOptional({ description: 'Free-form metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {}

export class ListSymptomsDto {
  @ApiPropertyOptional({ description: 'Case-insensitive match on code/name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category (exact match)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 20;

  get offset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}

export class CreateSymptomDto {
  @ApiProperty({ description: 'Uppercase code, e.g. PAPULES' })
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiPropertyOptional({ description: 'Interpretation metadata for the rules engine' })
  @IsOptional()
  @IsObject()
  interpretation?: Record<string, any>;
}

export class CreateComplaintSymptomDto {
  @ApiProperty()
  @IsString()
  complaintCode!: string;

  @ApiProperty()
  @IsString()
  symptomCode!: string;

  @ApiPropertyOptional({ enum: ['PRIMARY', 'SECONDARY', 'CONDITIONAL'], default: 'PRIMARY' })
  @IsOptional()
  @IsString()
  applicability?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  questionRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  conditionalRules?: Record<string, any>;
}

export class CreateClinicalQuestionDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  questionId!: string;

  @ApiProperty({ description: "e.g. 'symptom.PAPULES'" })
  @IsString()
  clinicalAttribute!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  responseInterpretation?: Record<string, any>;

  @ApiPropertyOptional({ enum: ['RED_FLAG', 'SYMPTOM', 'CONTRAINDICATION', 'CONTEXT'] })
  @IsOptional()
  @IsString()
  purpose?: string;
}
