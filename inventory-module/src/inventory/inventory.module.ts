import { Module } from '@nestjs/common';
import { InventoryExitController } from './inventory-exit.controller';
import { InventoryExitService } from './inventory-exit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InventoryEntryModule } from './inventory-entry/inventory-entry.module';
import { InventoryUsageModule } from './inventory-usage/inventory-usage.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [PrismaModule, InventoryEntryModule, InventoryUsageModule],
  controllers: [InventoryExitController, ProductController],
  providers: [InventoryExitService, ProductService],
  exports: [InventoryExitService, ProductService],
})
export class InventoryModule {} 