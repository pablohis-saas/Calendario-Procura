import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ProductType, ProductUnit } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string = '';

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType = ProductType.SIMPLE;

  @ApiProperty({ enum: ProductUnit })
  @IsEnum(ProductUnit)
  unit: ProductUnit = ProductUnit.PIECE;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  costPerUnit: number = 0;

  @ApiProperty()
  @IsNumber()
  minStockLevel: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;
} 