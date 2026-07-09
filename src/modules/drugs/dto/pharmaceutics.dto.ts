import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commonBrandName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commonGenericName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clinicalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drugClass?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chemicalConstituents?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pharmaceutics?: string;

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
  mechanism?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missedDose?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drugInteractions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  drugComponentIds?: string[];
}

export class UpdatePharmaceuticsDto extends CreatePharmaceuticsDto {}
