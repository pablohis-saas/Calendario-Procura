import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsArray, ValidateNested, IsOptional, IsUUID, IsNotEmpty, IsPositive, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum UnitType {
  ML = 'ML',
  PIECE = 'PIECE',
  UNIT = 'UNIT'
}

export enum TreatmentType {
  GLICERINADO = 'GLICERINADO',
  ALXOID = 'ALXOID',
  SUBLINGUAL = 'SUBLINGUAL',
  SIMPLE = 'SIMPLE',
  ALLERGY = 'ALLERGY',
  CONSULTATION = 'CONSULTATION'
}

export enum Subtype {
  POR_UNIDAD = 'Por Unidad',
  EN_FRASCO = 'En Frasco'
}

export class ProductUsageDto {
  @ApiProperty()
  @IsUUID(undefined, { message: 'productId must be a valid UUID' })
  productId: string = '';

  @ApiProperty()
  @IsString({ message: 'productName must be a string' })
  @IsNotEmpty({ message: 'productName is required' })
  productName: string = '';

  @ApiProperty()
  @IsNumber({}, { message: 'quantity must be a number' })
  @IsPositive({ message: 'quantity must be positive' })
  quantity: number = 0;

  @ApiProperty({ enum: UnitType })
  @IsEnum(UnitType, { message: 'unitType must be a valid UnitType' })
  unitType: UnitType = UnitType.UNIT;
}

export class InventoryExitDto {
  @ApiProperty()
  @IsString({ message: 'productName must be a string' })
  @IsNotEmpty({ message: 'productName is required' })
  productName: string = '';

  @ApiProperty()
  @IsNumber({}, { message: 'quantity must be a number' })
  @IsPositive({ message: 'quantity must be positive' })
  quantity: number = 0;

  @ApiProperty({ enum: UnitType })
  @IsEnum(UnitType, { message: 'unitType must be a valid UnitType' })
  unitType: UnitType = UnitType.UNIT;

  @ApiProperty()
  @IsUUID(undefined, { message: 'userId must be a valid UUID' })
  userId: string = '';

  @ApiProperty()
  @IsUUID(undefined, { message: 'sedeId must be a valid UUID' })
  sedeId: string = '';

  @ApiProperty({ enum: TreatmentType })
  @IsEnum(TreatmentType, { message: 'treatmentType must be a valid TreatmentType' })
  treatmentType: TreatmentType = TreatmentType.CONSULTATION;

  @ApiProperty({ enum: Subtype, required: false })
  @IsOptional()
  @IsEnum(Subtype, { message: 'subtype must be a valid Subtype' })
  subtype?: Subtype;

  @ApiProperty({ type: [ProductUsageDto] })
  @IsArray({ message: 'productsUsed must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ProductUsageDto)
  productsUsed: ProductUsageDto[] = [];
} 