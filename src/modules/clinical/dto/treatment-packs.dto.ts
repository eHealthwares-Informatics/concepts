import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TreatmentPackStatus } from '../types/clinical-triage.types';

export class ListTreatmentPacksDto {
  @ApiPropertyOptional({ description: 'Case-insensitive match on code/name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TreatmentPackStatus })
  @IsOptional()
  @IsEnum(TreatmentPackStatus)
  status?: TreatmentPackStatus;

  @ApiPropertyOptional({ description: 'Only packs covering this complaint code' })
  @IsOptional()
  @IsString()
  complaintCode?: string;

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

export class TreatmentPackItemDto {
  @ApiPropertyOptional({ enum: ['GENERIC_MEDICINE', 'SUPPORTIVE_CARE', 'COUNSELLING'] })
  @IsOptional()
  @IsString()
  itemType?: 'GENERIC_MEDICINE' | 'SUPPORTIVE_CARE' | 'COUNSELLING';

  @ApiPropertyOptional({ description: '`generic_drugs` id (uuid)' })
  @IsOptional()
  @IsString()
  genericDrugId?: string;

  @ApiPropertyOptional({ description: '`generic_drugs` code (GN-xxxxx)' })
  @IsOptional()
  @IsString()
  genericDrugCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supportiveCareRef?: string;

  @ApiPropertyOptional({ description: "e.g. 'NSTG-2022:acne:first-line'" })
  @IsOptional()
  @IsString()
  protocolRegimenCode?: string;

  @ApiPropertyOptional({ description: 'Dosing / usage instructions' })
  @IsOptional()
  @IsObject()
  instructions?: Record<string, any>;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sequence?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class CreateTreatmentPackDto {
  @ApiProperty({ description: 'e.g. ACNE_SELF_CARE_001' })
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], description: 'Complaint codes this pack covers' })
  @IsArray()
  @IsString({ each: true })
  complaintCodes!: string[];

  @ApiPropertyOptional({ description: 'Patient-context eligibility rules' })
  @IsOptional()
  @IsObject()
  eligibilityRules?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Exclusion rules (contraindication codes, age bounds)' })
  @IsOptional()
  @IsObject()
  exclusionRules?: Record<string, any>;

  @ApiPropertyOptional({ type: [TreatmentPackItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentPackItemDto)
  items?: TreatmentPackItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  evidence?: Record<string, any>;

  @ApiPropertyOptional({ enum: TreatmentPackStatus, default: TreatmentPackStatus.DRAFT })
  @IsOptional()
  @IsEnum(TreatmentPackStatus)
  status?: TreatmentPackStatus;
}

export class UpdateTreatmentPackDto extends PartialType(CreateTreatmentPackDto) {}

export class ListGenericMedicinesDto {
  @ApiPropertyOptional({ description: 'Case-insensitive match on code/name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Only over-the-counter generics' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isOtc?: boolean;

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

export class CreateGenericMedicineDto {
  @ApiProperty({ description: 'GN-xxxxx business key from generic_drugs' })
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isOtc?: boolean;

  @ApiPropertyOptional({ description: "[{ ingredient, strength }]" })
  @IsOptional()
  @IsObject()
  ingredients?: Record<string, any>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  routes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dosageForms?: string[];

  @ApiPropertyOptional({ description: 'OTC-only / age / pregnancy restrictions' })
  @IsOptional()
  @IsObject()
  restrictions?: Record<string, any>;
}

export class UpdateGenericMedicineDto extends PartialType(CreateGenericMedicineDto) {}

export class CreateMedicineMappingDto {
  @ApiProperty({ description: '`generic_drugs` code (GN-xxxxx)' })
  @IsString()
  genericDrugCode!: string;

  @ApiProperty({ description: '`generic_products` code (GP-xxxxx)' })
  @IsString()
  genericProductCode!: string;

  @ApiPropertyOptional({ description: 'rxsoft commercial item code' })
  @IsOptional()
  @IsString()
  itemCode?: string;

  @ApiPropertyOptional({ description: "Form/strength constraints, e.g. { form: 'gel' }" })
  @IsOptional()
  @IsObject()
  requiredAttributes?: Record<string, any>;

  @ApiPropertyOptional({
    enum: ['unmapped', 'matched_by_code', 'matched_by_name'],
    default: 'matched_by_code',
  })
  @IsOptional()
  @IsString()
  mappingStatus?: string;
}
