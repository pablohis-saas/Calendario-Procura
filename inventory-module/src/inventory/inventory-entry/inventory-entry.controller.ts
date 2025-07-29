import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';
import { InventoryEntryService } from './inventory-entry.service';
import { InventoryEntryDto } from './dto/inventory-entry.dto';
import { InventoryEntryBatchDto } from './dto/inventory-entry-batch.dto';

@ApiTags('inventory-entry')
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory-entry')
export class InventoryEntryController {
  constructor(private readonly inventoryEntryService: InventoryEntryService) {}

  @Post()
  // @Roles('DOCTOR', 'SECRETARY')
  async createEntry(@Body() entryDto: InventoryEntryDto) {
    return this.inventoryEntryService.processEntry(entryDto);
  }

  @Post('batch')
  // @Roles('DOCTOR', 'SECRETARY')
  async createBatchEntry(@Body() batchDto: InventoryEntryBatchDto) {
    return this.inventoryEntryService.processBatchEntry(batchDto);
  }

  @Get('movements')
  async getMovements(
    @Query('type') type?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // Validar límites seguros
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const safeOffset = Math.max(0, Number(offset) || 0);
    return this.inventoryEntryService.getMovements(type, safeLimit, safeOffset);
  }

  @Get('inventory')
  async getInventory() {
    return this.inventoryEntryService.getInventory();
  }

  @Get('movements/recent')
  async getRecentMovements() {
    return this.inventoryEntryService.getRecentMovements();
  }

  @Get('by-category')
  async getEntriesByCategory(
    @Query('sedeId') sedeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    return this.inventoryEntryService.getEntriesByCategory(
      sedeId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    )
  }
}