import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryExitDto, ProductUsageDto } from './dto/inventory-exit.dto';
import { UserRole, MovementType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InventoryExitService {
  constructor(private prisma: PrismaService) {}

  async processInventoryExit(dto: InventoryExitDto) {
    // Simulación: usuario con rol NURSE (ajusta según tu lógica real de autenticación)
    const user = { id: dto.userId, role: UserRole.NURSE };
    if (!(user.role === 'NURSE' || user.role === 'DOCTOR')) {
      throw new BadRequestException('Only nurses and doctors can process inventory exits');
    }

    const sede = await this.prisma.sede.findUnique({
      where: { id: dto.sedeId },
    });

    if (!sede) {
      throw new NotFoundException('Sede not found');
    }

    const productsUsed: ProductUsageDto[] = Array.isArray(dto.productsUsed) ? dto.productsUsed : [];

    for (const usage of productsUsed) {
      if (!usage || !usage.productId) continue;
      const product = await this.prisma.product.findUnique({
        where: { id: usage.productId },
        include: { stocks: { where: { sedeId: dto.sedeId } } },
      });

      if (!product) {
        throw new NotFoundException(`Product with id ${usage.productId} not found`);
      }

      const availableStock = product.stocks.find(stock => {
        const stockQty = stock.quantity instanceof Decimal ? stock.quantity.toNumber() : Number(stock.quantity);
        return stockQty >= usage.quantity;
      });
      
      if (!availableStock) {
        const totalAvailable = product.stocks.reduce((sum, stock) => {
          const stockQty = stock.quantity instanceof Decimal ? stock.quantity.toNumber() : Number(stock.quantity);
          return sum + stockQty;
        }, 0);
        throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${totalAvailable}, Requested: ${usage.quantity}`);
      }

      const newQuantity = (availableStock.quantity instanceof Decimal ? availableStock.quantity.toNumber() : Number(availableStock.quantity)) - usage.quantity;
      await this.prisma.stockBySede.update({
        where: { id: availableStock.id },
        data: { quantity: newQuantity },
      });
      await this.prisma.movement.create({
        data: {
          userId: user.id,
          sedeId: dto.sedeId,
          productId: usage.productId,
          quantity: usage.quantity,
          unitCost: 0, // Ajustar si tienes el costo unitario disponible
          totalCost: 0, // Ajustar si tienes el costo total disponible
          type: 'EXIT',
        },
      });
    }

    return { success: true };
  }

  async getExitsByCategory(sedeId: string, from?: Date, to?: Date) {
    const fromDate = from || new Date(0)
    const toDate = to || new Date()
    // Obtener todos los movimientos de salida (EXIT) en el rango de fechas
    const exits = await this.prisma.movement.findMany({
      where: {
        sedeId,
        type: MovementType.EXIT,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        product: true,
      },
    })
    // Agrupar por categoría
    const categoryMap = new Map<string, { totalQuantity: number; totalValue: number; products: { name: string; quantity: number; totalValue: number }[] }>()
    exits.forEach(exit => {
      const category = exit.product.category || 'Sin categoría'
      const existing = categoryMap.get(category) || { totalQuantity: 0, totalValue: 0, products: [] }
      const quantity = Number(exit.quantity)
      const value = exit.totalCost instanceof Decimal ? exit.totalCost.toNumber() : Number(exit.totalCost)
      // Buscar si el producto ya está en la lista
      const prodIndex = existing.products.findIndex(p => p.name === exit.product.name)
      if (prodIndex >= 0) {
        existing.products[prodIndex].quantity += quantity
        existing.products[prodIndex].totalValue += value
      } else {
        existing.products.push({ name: exit.product.name, quantity, totalValue: value })
      }
      existing.totalQuantity += quantity
      existing.totalValue += value
      categoryMap.set(category, existing)
    })
    // Formatear resultado
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalQuantity: data.totalQuantity,
      totalValue: data.totalValue,
      products: data.products,
    }))
  }
} 