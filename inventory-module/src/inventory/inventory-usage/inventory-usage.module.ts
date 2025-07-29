import { Module } from '@nestjs/common';
import { InventoryUsageService } from './inventory-usage.service';
import { InventoryUsageController } from './inventory-usage.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryUsageController],
  providers: [InventoryUsageService],
  exports: [InventoryUsageService],
})
export class InventoryUsageModule {} 