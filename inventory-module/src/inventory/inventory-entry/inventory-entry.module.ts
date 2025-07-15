import { Module } from '@nestjs/common';
import { InventoryEntryService } from './inventory-entry.service';
import { InventoryEntryController } from './inventory-entry.controller';
import { PrismaModule } from '@prisma-service/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryEntryController],
  providers: [InventoryEntryService],
  exports: [InventoryEntryService],
})
export class InventoryEntryModule {} 