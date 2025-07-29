import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async isDatabaseConnected(): Promise<boolean> {
    try {
      // Simple query para verificar conexión
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      return false;
    }
  }
} 