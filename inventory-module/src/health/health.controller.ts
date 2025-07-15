import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkHealth() {
    const isDbOk = await this.healthService.isDatabaseConnected();
    if (!isDbOk) {
      throw new HttpException('Database connection failed', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return { status: 'ok' };
  }
} 