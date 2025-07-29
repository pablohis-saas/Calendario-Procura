import { IsDateString, IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiProperty({ description: 'ID of the sede to get metrics for', required: false })
  @IsOptional()
  @IsString()
  sedeId: string = '';

  @ApiProperty({ description: 'Start date for metrics (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({ description: 'End date for metrics (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  to?: string;
} 