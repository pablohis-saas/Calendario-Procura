import { Controller, Post, Body, Get } from '@nestjs/common';
import { InventoryUsageService } from './inventory-usage.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';
// import { UserRole } from '@prisma/client'; // Comentado temporalmente
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcessUsageDto } from './dto/process-usage.dto';

@ApiTags('Inventory Usage')
@Controller('inventory/usage')
// @UseGuards(JwtAuthGuard, RolesGuard) // Comentado temporalmente para testing
export class InventoryUsageController {
  constructor(private readonly inventoryUsageService: InventoryUsageService) {}

  @Get('test')
  async test() {
    return { message: 'Test endpoint working without authentication' };
  }

  @Post()
  // @Roles(UserRole.NURSE) // Comentado temporalmente para testing
  @ApiOperation({ summary: 'Process inventory usage report' })
  @ApiResponse({
    status: 200,
    description: 'Successfully processed inventory usage',
    type: [Object]
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role'
  })
  async processUsageReport(@Body() dto: ProcessUsageDto) {
    console.log('🎯 CONTROLLER: Received request with items:', dto.items?.length || 0);
    console.log('🎯 CONTROLLER: DTO data:', JSON.stringify(dto, null, 2));
    return this.inventoryUsageService.processUsageReport(dto);
  }
} 