import { ApiProperty } from '@nestjs/swagger';

export class ProductInventoryDto {
  @ApiProperty()
  name: string = '';

  @ApiProperty()
  quantity: number = 0;

  @ApiProperty()
  unitCost: number = 0;

  @ApiProperty()
  totalValue: number = 0;

  @ApiProperty()
  category?: string = '';
}

export class CategoryInventoryDto {
  @ApiProperty()
  category: string = '';

  @ApiProperty()
  totalProducts: number = 0;

  @ApiProperty()
  totalValue: number = 0;
}

export class ExpirationAlertDto {
  @ApiProperty()
  productName: string = '';

  @ApiProperty()
  batchNumber: string = '';

  @ApiProperty()
  expiryDate: Date = new Date();

  @ApiProperty()
  quantity: number = 0;
}

export class MovementDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  productName: string = '';

  @ApiProperty()
  type: string = '';

  @ApiProperty()
  quantity: number = 0;

  @ApiProperty()
  createdAt: Date = new Date();
}

export class MostUsedProductDto {
  @ApiProperty()
  productName: string = '';

  @ApiProperty()
  totalExits: number = 0;

  @ApiProperty()
  totalUsage: number = 0;
}

export class ImmobilizedInventoryDto {
  @ApiProperty()
  productName: string = '';

  @ApiProperty()
  quantity: number = 0;

  @ApiProperty()
  value: number = 0;

  @ApiProperty()
  lastMovement: Date = new Date();

  @ApiProperty()
  daysWithoutMovement: number = 0;
}

export class DashboardResponseDto {
  @ApiProperty({ type: [ProductInventoryDto] })
  inventory: ProductInventoryDto[] = [];

  @ApiProperty({ type: [CategoryInventoryDto] })
  inventoryByCategory: CategoryInventoryDto[] = [];

  @ApiProperty()
  totalInventoryValue: number = 0;

  @ApiProperty()
  totalExits: number = 0;

  @ApiProperty()
  totalUsage: number = 0;

  @ApiProperty()
  totalUsedInventoryCost: number = 0;

  @ApiProperty()
  totalEnteredInventoryCost: number = 0;

  @ApiProperty({ type: [ProductInventoryDto] })
  lowStockAlerts: ProductInventoryDto[] = [];

  @ApiProperty({ type: [ExpirationAlertDto] })
  expirationAlerts: ExpirationAlertDto[] = [];

  @ApiProperty({ type: [MostUsedProductDto] })
  mostUsedProducts: MostUsedProductDto[] = [];

  @ApiProperty({ type: [MovementDto] })
  recentMovements: MovementDto[] = [];

  @ApiProperty({ type: [ImmobilizedInventoryDto] })
  immobilizedInventory: ImmobilizedInventoryDto[] = [];
} 