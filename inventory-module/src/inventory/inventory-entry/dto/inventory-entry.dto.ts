import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, IsString, IsPositive, Min, IsDateString, IsNotEmpty } from 'class-validator';

export class InventoryEntryDto {
  @ApiProperty()
  @IsUUID(undefined, { message: 'productId must be a valid UUID' })
  productId: string = '';

  @ApiProperty()
  @IsUUID(undefined, { message: 'sedeId must be a valid UUID' })
  sedeId: string = '';

  @ApiProperty()
  @IsUUID(undefined, { message: 'userId must be a valid UUID' })
  userId: string = '';

  @ApiProperty()
  @IsNumber({}, { message: 'quantity must be a number' })
  @IsPositive({ message: 'quantity must be positive' })
  quantity: number = 0;

  @ApiProperty()
  @IsNumber({}, { message: 'unitCost must be a number' })
  @Min(0, { message: 'unitCost must be zero or positive' })
  unitCost: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'batchNumber must be a string' })
  batchNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'expiryDate must be a valid ISO date string' })
  expiryDate?: string;

  @ApiProperty()
  @IsString({ message: 'supplierName must be a string' })
  @IsNotEmpty({ message: 'supplierName is required' })
  supplierName: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'invoiceNumber must be a string' })
  invoiceNumber?: string;
}

export class MovementDto {
  @ApiProperty()
  @IsUUID(undefined, { message: 'id must be a valid UUID' })
  id: string = '';

  @ApiProperty()
  @IsUUID(undefined, { message: 'userId must be a valid UUID' })
  userId: string = '';

  @ApiProperty()
  @IsUUID(undefined, { message: 'sedeId must be a valid UUID' })
  sedeId: string = '';

  @ApiProperty()
  @IsUUID(undefined, { message: 'productId must be a valid UUID' })
  productId: string = '';

  @ApiProperty()
  @IsString({ message: 'type must be a string' })
  type: string = '';

  @ApiProperty()
  @IsNumber({}, { message: 'quantity must be a number' })
  @Min(0, { message: 'quantity must be zero or positive' })
  quantity: number = 0;

  @ApiProperty()
  @IsNumber({}, { message: 'unitCost must be a number' })
  @Min(0, { message: 'unitCost must be zero or positive' })
  unitCost: number = 0;

  @ApiProperty()
  @IsNumber({}, { message: 'totalCost must be a number' })
  @Min(0, { message: 'totalCost must be zero or positive' })
  totalCost: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'batchNumber must be a string' })
  batchNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'expiryDate must be a valid ISO date string' })
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'supplierId must be a string' })
  supplierId?: string;

  @ApiProperty()
  @IsDateString({}, { message: 'createdAt must be a valid ISO date string' })
  createdAt: Date = new Date();
}

export class InventoryEntryResponse {
  @ApiProperty({ type: MovementDto })
  movement: MovementDto = new MovementDto();

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty()
  updatedQuantity: number = 0;

  @ApiProperty()
  inventoryValue: number = 0;
} 