import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get dashboard metrics for testing (public)' })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard metrics including inventory, costs, and alerts',
    type: DashboardResponseDto,
  })
  async getDashboardMetricsPublic(
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboardMetrics(query);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get dashboard metrics for a sede' })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard metrics including inventory, costs, and alerts',
    type: DashboardResponseDto,
  })
  async getDashboardMetrics(
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboardMetrics(query);
  }
} 