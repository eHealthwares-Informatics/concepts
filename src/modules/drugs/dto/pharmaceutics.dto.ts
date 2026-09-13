import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListPharmaceuticsDto {
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
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  get offset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}

export class CreatePharmaceuticsDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  code!: string;

  // ── Identity & classification ──────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clinicalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandNames?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drugClass?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodySystem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formulations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chemicalConstituents?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pharmacology?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commonGenericName?: string;

  // ── Clinical monograph ─────────────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  indications?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contraindications?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  precautions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warnings?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mechanismOfAction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adverseEffects?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drugInteractions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ivIncompatibilities?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  foodInteractions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  traditionalMedicineEffects?: string;

  // ── Dosing ─────────────────────────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosePerAgeRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosePerWeightRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missedDose?: string;

  // ── Patient variables ──────────────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyWeightAndAge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  physiologicalVariables?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pharmacokineticVariables?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diseaseVariables?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  environmentalVariables?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  extremesOfAge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  intercurrentIllness?: string;

  // ── Adherence & prescribing ────────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adherenceInfo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prescriptionReasons?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  generalDrugUse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientCounseling?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nursingConsiderations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendedLabel?: string;

  // ── Regulatory ─────────────────────────────────────────────────────────

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isControlledSubstance?: boolean;

  // ── Appendices ─────────────────────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pregnancyEffects?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  breastfeedingEffects?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interactiveEffects?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  renalImpairment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hepaticImpairment?: string;

  // ── Relations ──────────────────────────────────────────────────────────

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  drugComponentIds?: string[];
}

export class UpdatePharmaceuticsDto extends CreatePharmaceuticsDto {}
