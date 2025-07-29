import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@prisma-service/prisma.service';
import { PrismaClient, UserRole, MovementType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { InventoryEntryDto, InventoryEntryResponse, MovementDto } from './dto/inventory-entry.dto';
import { InventoryEntryBatchDto } from './dto/inventory-entry-batch.dto';

@Injectable()
export class InventoryEntryService {
  constructor(private prisma: PrismaService) {}

  async processEntry(dto: InventoryEntryDto): Promise<InventoryEntryResponse> {
    // LOG: Mostrar DTO recibido
    console.log('DTO recibido en processEntry:', JSON.stringify(dto, null, 2))
    try {
      // Validate user role
      // const user = await this.prisma.user.findUnique({
      //   where: { id: dto.userId },
      // });
      // if (!user || !(user.role === 'DOCTOR' || user.role === 'SECRETARY')) {
      //   throw new ForbiddenException('Only doctors and secretaries can register inventory entries');
      // }

      // Validate product exists
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new BadRequestException(`Product ${dto.productId} not found`);
      }

      // Validate sede exists
      const sede = await this.prisma.sede.findUnique({
        where: { id: dto.sedeId },
      });
      if (!sede) {
        throw new BadRequestException(`Sede ${dto.sedeId} not found`);
      }

      // Convert to Decimal for precise calculations
      const quantity = new Decimal(dto.quantity);
      const unitCost = new Decimal(dto.unitCost);
      const totalCost = quantity.mul(unitCost);

      // Process entry in a transaction
      return this.prisma.$transaction(async (tx: any) => {
        // Handle supplier record
        let supplierId: string | undefined;
        if (dto.invoiceNumber) {
          let supplier = await tx.supplier.findFirst({ where: { invoiceNumber: dto.invoiceNumber } });
          if (supplier) {
            supplier = await tx.supplier.update({
              where: { id: supplier.id },
              data: {
                amountSupplied: {
                  increment: totalCost.toNumber(),
                },
              },
            });
          } else {
            supplier = await tx.supplier.create({
              data: {
                name: dto.supplierName,
                invoiceNumber: dto.invoiceNumber,
                amountSupplied: totalCost.toNumber(),
              },
            });
          }
          if (!supplier) {
            throw new BadRequestException('Supplier upsert failed');
          }
          supplierId = supplier.id;
        }

        // Create movement record
        const movement = await tx.movement.create({
          data: {
            userId: dto.userId,
            sedeId: dto.sedeId,
            productId: dto.productId,
            type: MovementType.ENTRY,
            quantity: quantity.toNumber(),
            unitCost: unitCost.toNumber(),
            totalCost: totalCost.toNumber(),
            batchNumber: dto.batchNumber ?? undefined,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
          },
        });
        if (!movement) {
          throw new BadRequestException('Movement creation failed');
        }

        // Update or create stock record
        const existingStock = await tx.stockBySede.findUnique({
          where: {
            productId_sedeId: {
              productId: dto.productId,
              sedeId: dto.sedeId,
            },
          },
        });

        let updatedStock;
        if (existingStock) {
          updatedStock = await tx.stockBySede.update({
            where: {
              productId_sedeId: {
                productId: dto.productId,
                sedeId: dto.sedeId,
              },
            },
            data: {
              quantity: {
                increment: quantity,
              },
            },
          });
        } else {
          updatedStock = await tx.stockBySede.create({
            data: {
              productId: dto.productId,
              sedeId: dto.sedeId,
              quantity: quantity,
            },
          });
        }
        if (!updatedStock) {
          throw new BadRequestException('Stock update/creation failed');
        }

        // Create expiration record if expiry date is provided
        if (dto.expiryDate) {
          await tx.productExpiration.create({
            data: {
              productId: dto.productId,
              sedeId: dto.sedeId,
              batchNumber: dto.batchNumber || 'N/A',
              expiryDate: new Date(dto.expiryDate),
              quantity: quantity.toNumber(),
            },
          });
        }

        // Calculate updated inventory value
        const updatedQuantity = updatedStock.quantity instanceof Decimal ? updatedStock.quantity.toNumber() : Number(updatedStock.quantity);
        const inventoryValue = updatedQuantity * unitCost.toNumber();

        // Map movement to MovementDto
        const movementDto: MovementDto = {
          id: movement.id,
          userId: movement.userId,
          sedeId: movement.sedeId,
          productId: movement.productId,
          type: movement.type,
          quantity: typeof movement.quantity === 'number' ? movement.quantity : Number(movement.quantity),
          unitCost: movement.unitCost instanceof Decimal ? movement.unitCost.toNumber() : Number(movement.unitCost),
          totalCost: movement.totalCost instanceof Decimal ? movement.totalCost.toNumber() : Number(movement.totalCost),
          batchNumber: movement.batchNumber ?? undefined,
          expiryDate: movement.expiryDate ?? undefined,
          createdAt: movement.createdAt,
        };

        return {
          movement: movementDto,
          supplierId,
          updatedQuantity,
          inventoryValue,
        };
      });
    } catch (err) {
      // LOG: Mostrar error detallado
      console.error('Error en processEntry:', err)
      throw err
    }
  }

  async processBatchEntry(dto: InventoryEntryBatchDto) {
    const results = [];
    for (const entry of dto.entries) {
      // Puedes sobreescribir la fecha si quieres usar dto.entryDate
      // entry.entryDate = dto.entryDate;
      const result = await this.processEntry(entry);
      results.push(result);
    }
    return { success: true, results };
  }

  async getMovements(type?: string, limit: number = 50, offset: number = 0) {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    return this.prisma.movement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async getInventory() {
    return this.prisma.stockBySede.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        sede: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { sedeId: 'asc' },
        { productId: 'asc' },
      ],
    });
  }

  async getRecentMovements() {
    return this.prisma.movement.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  async getEntriesByCategory(sedeId: string, from?: Date, to?: Date) {
    const fromDate = from || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const toDate = to || new Date()
    // Obtener todos los movimientos de entrada (ENTRY) en el rango de fechas
    const entries = await this.prisma.movement.findMany({
      where: {
        sedeId,
        type: MovementType.ENTRY,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    // Agrupar por categoría
    const categoryMap = new Map<string, { totalQuantity: number; totalValue: number; entries: { name: string; quantity: number; totalValue: number; createdAt: Date }[] }>()
    entries.forEach(entry => {
      const category = entry.product.category || 'Sin categoría'
      const existing = categoryMap.get(category) || { totalQuantity: 0, totalValue: 0, entries: [] }
      const quantity = Number(entry.quantity)
      const value = entry.totalCost instanceof Decimal ? entry.totalCost.toNumber() : Number(entry.totalCost)
      existing.entries.push({ name: entry.product.name, quantity, totalValue: value, createdAt: entry.createdAt })
      existing.totalQuantity += quantity
      existing.totalValue += value
      categoryMap.set(category, existing)
    })
    // Formatear resultado
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalQuantity: data.totalQuantity,
      totalValue: data.totalValue,
      entries: data.entries,
    }))
  }
} 