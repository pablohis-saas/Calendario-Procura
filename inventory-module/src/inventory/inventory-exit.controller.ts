import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InventoryExitService } from './inventory-exit.service';
import { InventoryExitDto } from './dto/inventory-exit.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryExitController {
  constructor(private readonly inventoryExitService: InventoryExitService) {}

  @Post('exit')
  @Roles(UserRole.NURSE, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Process inventory exit after medical consultation' })
  @ApiResponse({
    status: 201,
    description: 'Inventory exit processed successfully',
  })
  async processInventoryExit(@Body() dto: InventoryExitDto) {
    return this.inventoryExitService.processInventoryExit(dto);
  }

  @Get('exit/by-category')
  @ApiOperation({ summary: 'Obtener salidas agrupadas por categoría' })
  @ApiResponse({ status: 200, description: 'Salidas agrupadas por categoría' })
  async getExitsByCategory(
    @Query('sedeId') sedeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    return this.inventoryExitService.getExitsByCategory(
      sedeId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    )
  }
} 