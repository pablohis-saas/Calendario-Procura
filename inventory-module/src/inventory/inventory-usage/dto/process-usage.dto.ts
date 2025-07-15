import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsArray,
  IsString,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { TipoTratamiento } from '@prisma/client';

export class UsageFormItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Single allergen ID', required: false })
  @IsUUID()
  @IsOptional()
  allergenId?: string;

  @ApiProperty({ description: 'Multiple allergen IDs', required: false, type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  allergenIds?: string[];

  @ApiProperty({ description: 'Quantity', required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Units', required: false })
  @IsNumber()
  @IsOptional()
  units?: number;

  @ApiProperty({ description: 'Frasco level', required: false })
  @IsNumber()
  @IsOptional()
  frascoLevel?: number;

  @ApiProperty({ description: 'Frasco factor', required: false })
  @IsNumber()
  @IsOptional()
  frascoFactor?: number;

  @ApiProperty({ description: 'Number of doses', required: false })
  @IsNumber()
  @IsOptional()
  doses?: number;

  @ApiProperty({ description: 'Frasco levels (múltiples frascos)', required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  frascoLevels?: number[];
}

export class ProcessUsageDto {
  @ApiProperty({ description: 'Sede ID' })
  @IsUUID()
  sedeId!: string;

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Nombre del paciente' })
  @IsString()
  nombrePaciente!: string;

  @ApiProperty({ enum: TipoTratamiento, description: 'Tipo de tratamiento' })
  @IsEnum(TipoTratamiento)
  tipoTratamiento!: TipoTratamiento;

  @ApiProperty({ description: 'Observaciones', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ description: 'Indicador de reacción' })
  @IsBoolean()
  tuvoReaccion!: boolean;

  @ApiProperty({ description: 'Descripción de la reacción', required: false })
  @IsString()
  @IsOptional()
  descripcionReaccion?: string;

  @ApiProperty({ description: 'Usage items', type: [UsageFormItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsageFormItemDto)
  items!: UsageFormItemDto[];
} 