import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListDrugClassificationsDto {
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

  @ApiPropertyOptional({
    enum: ['therapeutic', 'pharmaceutical', 'ndf_therapeutic', 'ndf_pharmaceutical'],
  })
  @IsOptional()
  @IsIn(['therapeutic', 'pharmaceutical', 'ndf_therapeutic', 'ndf_pharmaceutical'])
  type?: 'therapeutic' | 'pharmaceutical' | 'ndf_therapeutic' | 'ndf_pharmaceutical';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  get offset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}