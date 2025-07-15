import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-service/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { 
  DashboardResponseDto, 
  ProductInventoryDto, 
  ExpirationAlertDto,
  CategoryInventoryDto,
  MovementDto,
  MostUsedProductDto,
  ImmobilizedInventoryDto
} from './dto/dashboard-response.dto';
import { MovementType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(query: DashboardQueryDto): Promise<DashboardResponseDto> {
    const { sedeId, from, to } = query;
    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date();

    // Get all products with their stock in the sede
    const products = await this.prisma.product.findMany({
      where: {
        stocks: {
          some: {
            sedeId: query.sedeId,
          },
        },
      },
      include: {
        stocks: {
          where: {
            sedeId: query.sedeId,
          },
        },
        expirations: true,
      },
    });

    // Calculate inventory metrics
    const inventory: ProductInventoryDto[] = products.map(product => {
      const stock = product.stocks[0];
      const quantity = stock ? Number(stock.quantity) : 0;
      const unitCost = Number(product.costPerUnit);
      const totalValue = quantity * unitCost;

      return {
        name: product.name,
        quantity,
        unitCost,
        totalValue,
        category: product.category || 'Sin categoría',
      };
    });

    // Calculate inventory by category
    const inventoryByCategory = this.calculateInventoryByCategory(inventory);

    // Calculate total inventory value
    const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);

    // Get total exits (movements)
    const totalExits = await this.prisma.movement.count({
      where: {
        sedeId,
        type: MovementType.EXIT,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });

    // Get total usage (inventory usage)
    const totalUsage = await this.prisma.inventoryUsage.count({
      where: {
        sedeId,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });

    // Get used inventory cost
    const usedInventory = await this.prisma.movement.aggregate({
      where: {
        sedeId,
        type: MovementType.EXIT,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      _sum: {
        totalCost: true,
      },
    });

    const totalUsedInventoryCost = usedInventory._sum.totalCost ? Number(usedInventory._sum.totalCost) : 0;

    // Get entered inventory cost (Inventario Ingresado)
    const enteredInventory = await this.prisma.movement.aggregate({
      where: {
        sedeId,
        type: MovementType.ENTRY,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      _sum: {
        totalCost: true,
      },
    });

    const totalEnteredInventoryCost = enteredInventory._sum.totalCost ? Number(enteredInventory._sum.totalCost) : 0;

    // Get low stock alerts (threshold: 10 units)
    const lowStockAlerts = inventory.filter(item => item.quantity < 10);

    // Get expiration alerts
    const expirationAlerts: ExpirationAlertDto[] = products.flatMap(product => {
      return product.expirations
        .filter(exp => {
          const expiryDate = exp.expiryDate instanceof Date ? exp.expiryDate : new Date(exp.expiryDate);
          const now = new Date();
          const diff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 30 && diff >= 0;
        })
        .map(exp => ({
          productName: product.name,
          batchNumber: exp.batchNumber,
          expiryDate: exp.expiryDate,
          quantity: Number(exp.quantity),
        }));
    });

    // Get most used products
    const mostUsedProducts = await this.getMostUsedProducts(sedeId, fromDate, toDate);

    // Get recent movements
    const recentMovements = await this.getRecentMovements(sedeId, fromDate, toDate);

    // Get immobilized inventory (no movement in 30+ days)
    const immobilizedInventory = await this.getImmobilizedInventory(sedeId);

    return {
      inventory,
      inventoryByCategory,
      totalInventoryValue,
      totalExits,
      totalUsage,
      totalUsedInventoryCost,
      totalEnteredInventoryCost,
      lowStockAlerts,
      expirationAlerts,
      mostUsedProducts,
      recentMovements,
      immobilizedInventory,
    };
  }

  private calculateInventoryByCategory(inventory: ProductInventoryDto[]): CategoryInventoryDto[] {
    const categoryMap = new Map<string, { totalProducts: number; totalValue: number }>();

    inventory.forEach(item => {
      const category = item.category || 'Sin categoría';
      const existing = categoryMap.get(category) || { totalProducts: 0, totalValue: 0 };
      
      categoryMap.set(category, {
        totalProducts: existing.totalProducts + 1,
        totalValue: existing.totalValue + item.totalValue,
      });
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalProducts: data.totalProducts,
      totalValue: data.totalValue,
    }));
  }

  private async getMostUsedProducts(sedeId: string, fromDate: Date, toDate: Date): Promise<MostUsedProductDto[]> {
    // Get products with most exits
    const exitStats = await this.prisma.movement.groupBy({
      by: ['productId'],
      where: {
        sedeId,
        type: MovementType.EXIT,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Get products with most usage through InventoryUsageDetail
    const usageStats = await this.prisma.inventoryUsageDetail.groupBy({
      by: ['productId'],
      where: {
        InventoryUsage: {
          sedeId,
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Combine and get product names
    const productIds = new Set([
      ...exitStats.map(stat => stat.productId),
      ...usageStats.map(stat => stat.productId),
    ]);

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: Array.from(productIds) },
      },
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map(p => [p.id, p.name]));

    return Array.from(productIds).map(productId => {
      const exitStat = exitStats.find(stat => stat.productId === productId);
      const usageStat = usageStats.find(stat => stat.productId === productId);

      return {
        productName: productMap.get(productId) || 'Producto desconocido',
        totalExits: exitStat ? Number(exitStat._sum.quantity) : 0,
        totalUsage: usageStat ? Number(usageStat._sum.quantity) : 0,
      };
    }).slice(0, 10);
  }

  private async getRecentMovements(sedeId: string, fromDate: Date, toDate: Date): Promise<MovementDto[]> {
    const movements = await this.prisma.movement.findMany({
      where: {
        sedeId,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        product: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return movements.map(movement => ({
      id: movement.id,
      productName: movement.product.name,
      type: movement.type,
      quantity: Number(movement.quantity),
      createdAt: movement.createdAt,
    }));
  }

  private async getImmobilizedInventory(sedeId: string): Promise<ImmobilizedInventoryDto[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get products with stock but no recent movements
    const productsWithStock = await this.prisma.product.findMany({
      where: {
        stocks: {
          some: {
            sedeId,
            quantity: { gt: 0 },
          },
        },
      },
      include: {
        stocks: {
          where: { sedeId },
        },
        movements: {
          where: {
            sedeId,
            createdAt: { gte: thirtyDaysAgo },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();
    return productsWithStock
      .filter(product => product.movements.length === 0) // No movements in last 30 days
      .map(product => {
        const stock = product.stocks[0];
        const quantity = stock ? Number(stock.quantity) : 0;
        const unitCost = Number(product.costPerUnit);
        const value = quantity * unitCost;

        // Get last movement date
        const lastMovement = product.movements[0]?.createdAt || new Date(0);
        const daysWithoutMovement = Math.floor((now.getTime() - lastMovement.getTime()) / (1000 * 60 * 60 * 24));

        return {
          productName: product.name,
          quantity,
          value,
          lastMovement,
          daysWithoutMovement,
        };
      })
      .sort((a, b) => b.daysWithoutMovement - a.daysWithoutMovement)
      .slice(0, 10);
  }
} 