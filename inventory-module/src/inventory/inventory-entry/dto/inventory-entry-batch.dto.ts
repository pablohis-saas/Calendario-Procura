import { ApiProperty } from '@nestjs/swagger';
import { InventoryEntryDto } from './inventory-entry.dto';
import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryEntryBatchDto {
  @ApiProperty({ type: [InventoryEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryEntryDto)
  entries: InventoryEntryDto[] = [];

  @ApiProperty()
  @IsString()
  entryDate: string = '';
} 