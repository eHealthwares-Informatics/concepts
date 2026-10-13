import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListGenericProductsDto {
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
  @Max(100000)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by generic drug GN code' })
  @IsOptional()
  @IsString()
  genericDrugCode?: string;

  @ApiPropertyOptional({ default: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';

  get offset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}

export class CreateGenericProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pharmaceuticsId!: string;

  @ApiPropertyOptional({ type: [String], description: 'Drug classification codes to associate with this GP.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  classificationCodes?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Drug classification entity IDs to associate with this GP.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  classificationIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosageForm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiPropertyOptional({ description: 'Base UOM business code inherited by commercial items created from this GP.' })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emdexCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formulationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosageFormId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturerId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrescriptionRequired?: boolean;

}

export class UpdateGenericProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pharmaceuticsId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Replace the GP classification links by classification code.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  classificationCodes?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Replace GP classifications by entity ID.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  classificationIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosageForm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiPropertyOptional({ description: 'Base UOM business code inherited by commercial items created from this GP.' })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emdexCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formulationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosageFormId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrescriptionRequired?: boolean;

}
