import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // Forzamos el tipo del evento para evitar el error de tipo en algunas versiones de Prisma
    (this.$on as any)('beforeExit', async () => {
      await app.close();
    });
  }
} 