import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FacilityListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by facility code (facilityId)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description:
      'Filter by ward code. Joins through WardEntity and matches on code.',
  })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({
    description:
      'Filter by LGA code. Joins through LgaEntity and matches on code.',
  })
  @IsOptional()
  @IsString()
  lga?: string;

  @ApiPropertyOptional({
    description:
      'Filter by facility type code. Joins through FacilityTypeEntity and matches on code.',
  })
  @IsOptional()
  @IsString()
  facility_type?: string;

  @ApiPropertyOptional({
    description:
      'Filter by facility level code. Joins through FacilityLevelEntity and matches on code.',
  })
  @IsOptional()
  @IsString()
  facility_level?: string;

  @ApiPropertyOptional({
    description:
      'Filter by facility level code. Joins through FacilityLevelEntity and matches on code.',
  })
  @IsOptional()
  @IsString()
  ownership_code?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page (max 100)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class FhirLocationQueryDto {
  @ApiPropertyOptional({ description: 'Search by identifier value' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiPropertyOptional({ description: 'Search by facility name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description:
      'Filter by facility type code. Joins through FacilityTypeEntity.',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description:
      'Filter by facility level code (maps to FHIR physicalType). Joins through FacilityLevelEntity.',
  })
  @IsOptional()
  @IsString()
  'physical-type'?: string;

  @ApiPropertyOptional({
    description:
      'Filter by ward code. Joins through WardEntity and matches on code.',
  })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({
    description:
      'Filter by LGA code. Joins through LgaEntity and matches on code.',
  })
  @IsOptional()
  @IsString()
  lga?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page (max 100)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
