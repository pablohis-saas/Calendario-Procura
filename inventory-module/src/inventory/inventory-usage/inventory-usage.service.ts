import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma-service/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { ProductType, MovementType, Prisma, Product } from '@prisma/client';
import { ProcessUsageDto, UsageFormItemDto } from './dto/process-usage.dto';

@Injectable()
export class InventoryUsageService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly FRASCO_FACTORS = [0.002, 0.005, 0.02, 0.05, 0.2, 0.5] as const;
  private readonly FRASCO_VITS_FACTORS = [0.004, 0.02, 0.1, 0.5] as const;

  async processUsageReport(dto: ProcessUsageDto) {
    console.log('🚀 Starting processUsageReport with items:', dto.items.length);
    
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el registro principal de InventoryUsage
      const inventoryUsage = await tx.inventoryUsage.create({
        data: {
          nombrePaciente: dto.nombrePaciente,
          tipoTratamiento: dto.tipoTratamiento,
          observaciones: dto.observaciones,
          tuvoReaccion: dto.tuvoReaccion,
          descripcionReaccion: dto.descripcionReaccion,
          sedeId: dto.sedeId,
          userId: dto.userId,
        },
      });

      console.log('✅ Created InventoryUsage with ID:', inventoryUsage.id);

      // 2. Procesar cada item para crear movimientos y detalles
      for (const item of dto.items) {
        console.log('🔄 Processing item:', item);
        
        if (item.allergenIds?.length) {
          await this.processComplexTreatment(tx, dto, item, inventoryUsage.id);
        } else {
          await this.processSimpleProduct(tx, dto, item, inventoryUsage.id);
        }
      }

      return inventoryUsage;
    });
  }

  private async processComplexTreatment(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    item: UsageFormItemDto,
    inventoryUsageId: string
  ) {
    console.log('🔄 Procesando tratamiento complejo con alérgenos:', item.allergenIds?.length);

    // Determinar el tipo de tratamiento basado en el producto
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new BadRequestException(`Product ${item.productId} not found`);

    if (product.name.toLowerCase().includes('glicerinado')) {
      await this.processGlicerinadoTreatment(tx, dto, item, inventoryUsageId, product);
    } else if (product.name.toLowerCase().includes('alxoid')) {
      await this.processAlxoidTreatment(tx, dto, item, inventoryUsageId, product);
    } else if (product.name.toLowerCase().includes('sublingual')) {
      await this.processSublingualTreatment(tx, dto, item, inventoryUsageId, product);
    } else {
      throw new BadRequestException(`Unsupported complex product: ${product.name}`);
    }
  }

  private async processGlicerinadoTreatment(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    item: UsageFormItemDto,
    inventoryUsageId: string,
    product: any
  ) {
    console.log('🔄 Procesando tratamiento Glicerinado');

    if (item.units) {
      // Glicerinado por Unidad
      await this.processGlicerinadoPorUnidad(tx, dto, item, inventoryUsageId);
    } else if (item.frascoLevel !== undefined || (item as any).frascoLevels) {
      // Glicerinado por Frasco
      await this.processGlicerinadoPorFrasco(tx, dto, item, inventoryUsageId);
    } else {
      throw new BadRequestException('Invalid glicerinado parameters');
    }
  }

  private async processGlicerinadoPorUnidad(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    item: UsageFormItemDto,
    inventoryUsageId: string
  ) {
    console.log('🔄 Procesando Glicerinado por Unidad');
    const doses = item.doses || 1;
    const units = item.units || 0;
    const frascoType = (item as any).frascoType || 'madre'; // fallback a madre si no viene

    // 1. Calcular ml por alérgeno
    const mlPorAlergeno = (units / 10000) * doses;
    console.log(`📊 mlPorAlergeno calculado: ${mlPorAlergeno} (units: ${units}, doses: ${doses})`);

    for (const allergenId of item.allergenIds || []) {
      await this.processAllergenMovement(tx, dto, allergenId, mlPorAlergeno, inventoryUsageId);
    }

    // 2. Calcular bacteriana
    const bacterianaMl = doses * 0.1;
    console.log(`📊 Bacteriana calculada: ${bacterianaMl} ml (doses: ${doses})`);
    await this.processDiluentMovement(tx, dto, 'Bacteriana', bacterianaMl, inventoryUsageId);

    // 3. Calcular Evans según tipo de frasco
    let evansMl = 0;
    if (frascoType === 'amarillo') {
      evansMl = (9 * units / 10000) * doses;
    } else if (frascoType === 'verde') {
      evansMl = (99 * units / 10000) * doses;
    } else {
      evansMl = 0;
    }
    console.log(`📊 Evans calculado: ${evansMl} ml (frascoType: ${frascoType}, units: ${units}, doses: ${doses})`);
    if (evansMl > 0) {
      await this.processDiluentMovement(tx, dto, 'Evans', evansMl, inventoryUsageId);
    }
  }

  private async processGlicerinadoPorFrasco(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    item: UsageFormItemDto,
    inventoryUsageId: string
  ) {
    console.log('🔄 Procesando Glicerinado por Frasco');
    const doses = item.doses || 1;
    const frascoLevels: number[] = Array.isArray(item.frascoLevels)
      ? item.frascoLevels
      : item.frascoLevel !== undefined
        ? [item.frascoLevel]
        : [];
    const allergenIds: string[] = item.allergenIds || [];
    if (!frascoLevels.length || !allergenIds.length) {
      throw new BadRequestException('Faltan frascos o alérgenos para Glicerinado en Frasco');
    }
    // Factores de conversión por frasco (indexados desde 0)
    const FACTORES_FRASCOS = [0.002, 0.005, 0.02, 0.05, 0.2, 0.5];
    let totalEvans = 0;
    let totalBacteriana = frascoLevels.length * 2 * doses;
    // Procesar movimientos de alérgenos
    for (const frascoLevel of frascoLevels) {
      const factor = FACTORES_FRASCOS[frascoLevel] || 0;
      for (const allergenId of allergenIds) {
        const mlConsumido = Number((factor * doses).toFixed(4));
        console.log(`🔄 Procesando movimiento para alérgeno ${allergenId}, frasco ${frascoLevel + 1}, cantidad: ${mlConsumido}`);
        await this.processAllergenMovement(tx, dto, allergenId, mlConsumido, inventoryUsageId);
      }
      // Evans por frasco
      const evansMl = Number((3 - (factor * allergenIds.length)) * doses).toFixed(4);
      totalEvans += Number(evansMl);
    }
    // Registrar movimiento de Evans (si corresponde)
    if (totalEvans > 0) {
      console.log(`🔄 Procesando movimiento para diluyente Evans, cantidad: ${totalEvans}`);
      await this.processDiluentMovement(tx, dto, 'Evans', Number(totalEvans.toFixed(4)), inventoryUsageId);
    }
    // Registrar movimiento de Bacteriana
    if (totalBacteriana > 0) {
      console.log(`🔄 Procesando movimiento para diluyente Bacteriana, cantidad: ${totalBacteriana}`);
      await this.processDiluentMovement(tx, dto, 'Bacteriana', Number(totalBacteriana.toFixed(4)), inventoryUsageId);
    }
  }

  private async processAlxoidTreatment(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    item: UsageFormItemDto,
    inventoryUsageId: string,
    product: any
  ) {
    console.log('🔄 Procesando tratamiento Alxoid');
    
    const doses = item.doses || 1;
    let mlPorAlergeno: number;
    let alxoidType: 'A' | 'B' | null = null;

    // Determinar el tipo de Alxoid y ml por alérgeno
    if (product.name.includes('Tipo A')) {
      mlPorAlergeno = 0.5 * doses;
      alxoidType = 'A';
    } else if (product.name.includes('Tipo B.2')) {
      mlPorAlergeno = 0.2 * doses;
      alxoidType = 'B';
    } else if (product.name.includes('Tipo B')) { // Tipo B normal
      mlPorAlergeno = 0.5 * doses;
      alxoidType = 'B';
    } else {
      throw new BadRequestException(`Invalid Alxoid product type: ${product.name}`);
    }

    console.log(`📊 mlPorAlergeno para ${product.name}: ${mlPorAlergeno}, Tipo: ${alxoidType}`);

    // Filtrar alérgenos por tipo y exclusividad de Alxoid
    const validAllergenIds: string[] = [];
    
    for (const allergenId of item.allergenIds!) {
      const allergen = await tx.allergen.findUnique({ 
        where: { id: allergenId },
        select: { id: true, name: true, alxoidType: true, isAlxoidExclusive: true }
      });
      
      if (!allergen) {
        console.warn(`⚠️ Alérgeno no encontrado: ${allergenId}`);
        continue;
      }

      // Verificar que el alérgeno sea exclusivo de Alxoid y del tipo correcto
      if (allergen.isAlxoidExclusive && allergen.alxoidType === alxoidType) {
        validAllergenIds.push(allergenId);
        console.log(`✅ Alérgeno válido para ${product.name}: ${allergen.name} (Tipo ${allergen.alxoidType})`);
      } else {
        console.warn(`⚠️ Alérgeno no válido para ${product.name}: ${allergen.name} (Exclusivo: ${allergen.isAlxoidExclusive}, Tipo: ${allergen.alxoidType})`);
      }
    }

    if (validAllergenIds.length === 0) {
      throw new BadRequestException(`No valid allergens found for ${product.name}. Allergens must be Alxoid exclusive and type ${alxoidType}`);
    }

    // Procesar solo los alérgenos válidos
    for (const allergenId of validAllergenIds) {
      await this.processAllergenMovement(tx, dto, allergenId, mlPorAlergeno, inventoryUsageId);
    }
  }

  private async processSublingualTreatment(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    item: UsageFormItemDto,
    inventoryUsageId: string,
    product: any
  ) {
    console.log('🔄 Procesando tratamiento Sublingual');
    
    if (!item.frascoFactor) {
      throw new BadRequestException('Missing frasco factor for sublingual');
    }

    const frascoIndex = item.frascoFactor - 1; // Convertir a índice 0-based
    const factor = this.FRASCO_FACTORS[frascoIndex];
    const vitsFactor = this.FRASCO_VITS_FACTORS[frascoIndex];
    
    const mlPorAlergeno = factor * item.allergenIds!.length;
    const vitsMl = 5 - (vitsFactor * item.allergenIds!.length);

    console.log(`📊 Factor: ${factor}, mlPorAlergeno: ${mlPorAlergeno}, VITS: ${vitsMl}`);

    // Procesar cada alérgeno
    for (const allergenId of item.allergenIds!) {
      await this.processAllergenMovement(tx, dto, allergenId, mlPorAlergeno, inventoryUsageId);
    }

    // Procesar VITS
    if (vitsMl > 0) {
      await this.processDiluentMovement(tx, dto, 'VITS', vitsMl, inventoryUsageId);
    }
  }

  private async processAllergenMovement(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    allergenId: string,
    quantity: number,
    inventoryUsageId: string
  ) {
    console.log(`🔄 Procesando movimiento para alérgeno ${allergenId}, cantidad: ${quantity}`);

    // Buscar el alérgeno
    const allergen = await tx.allergen.findUnique({ where: { id: allergenId } });
    if (!allergen) {
      throw new BadRequestException(`Allergen ${allergenId} not found`);
    }

    // Buscar el producto del alérgeno (asumiendo que cada alérgeno tiene su propio producto)
    const product = await tx.product.findFirst({ 
      where: { name: allergen.name },
      include: { allergens: { include: { allergen: true } } }
    });

    if (!product) {
      throw new BadRequestException(`Product for allergen ${allergen.name} not found`);
    }

    await this.processMovement(tx, dto, product, quantity, inventoryUsageId);
  }

  private async processDiluentMovement(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    diluentName: string,
    quantity: number,
    inventoryUsageId: string
  ) {
    console.log(`🔄 Procesando movimiento para diluyente ${diluentName}, cantidad: ${quantity}`);

    // Buscar el producto diluyente
    const product = await tx.product.findFirst({ 
      where: { name: diluentName },
      include: { allergens: { include: { allergen: true } } }
    });

    if (!product) {
      throw new BadRequestException(`Diluent product ${diluentName} not found`);
    }

    await this.processMovement(tx, dto, product, quantity, inventoryUsageId);
  }

  private async processSimpleProduct(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    item: UsageFormItemDto,
    inventoryUsageId: string
  ) {
    console.log('🔄 Procesando producto simple');
    
    const product = await tx.product.findUnique({ 
      where: { id: item.productId },
      include: { allergens: { include: { allergen: true } } }
    });
    
    if (!product) {
      throw new BadRequestException(`Product ${item.productId} not found`);
    }

    const quantity = new Decimal(item.quantity || 1); // Usar item.quantity en lugar de siempre 1
    await this.processMovement(tx, dto, product, quantity, inventoryUsageId);
  }

  private async processMovement(
    tx: Prisma.TransactionClient,
    dto: ProcessUsageDto,
    product: any,
    quantity: number | Decimal,
    inventoryUsageId: string
  ) {
    console.log(`🔄 Processing movement for product: ${product.name}, quantity: ${quantity}`);
    
    const quantityDecimal = typeof quantity === 'number' ? new Decimal(quantity) : quantity;
    
    await this.validateStock(dto.sedeId, product.id, quantityDecimal);
    const stock = await this.getStockWithExpiry(dto.sedeId, product.id);
    const unitCost = product.costPerUnit;
    const totalCost = unitCost.mul(quantityDecimal);

    // Crear Movement
    const movement = await tx.movement.create({
      data: {
        userId: dto.userId,
        sedeId: dto.sedeId,
        productId: product.id,
        type: 'EXIT',
        quantity: quantityDecimal.toNumber(),
        unitCost: unitCost.toNumber(),
        totalCost: totalCost.toNumber(),
        batchNumber: stock?.batchNumber,
        expiryDate: stock?.expiryDate,
      },
    });

    console.log('✅ Created Movement with ID:', movement.id);

    // Crear InventoryUsageDetail
    const detail = await tx.inventoryUsageDetail.create({
      data: {
        inventoryUsageId: inventoryUsageId,
        movementId: movement.id,
        productId: product.id,
        quantity: quantityDecimal.toNumber(),
        unitCost: unitCost.toNumber(),
        totalCost: totalCost.toNumber(),
      },
    });

    console.log('✅ Created InventoryUsageDetail with ID:', detail.id);

    // Actualizar StockBySede
    await tx.stockBySede.update({
      where: { productId_sedeId: { productId: product.id, sedeId: dto.sedeId } },
      data: { quantity: { decrement: quantityDecimal.toNumber() } },
    });

    // Actualizar ProductExpiration
    if (stock) {
      await tx.productExpiration.update({
        where: { id: stock.id },
        data: { quantity: { decrement: quantityDecimal.toNumber() } },
      });
    }
  }

  private async validateStock(sedeId: string, productId: string, quantity: Decimal): Promise<void> {
    const stock = await this.prisma.stockBySede.findUnique({
      where: {
        productId_sedeId: {
          productId,
          sedeId,
        },
      },
    });

    if (!stock || stock.quantity.lessThan(quantity)) {
      throw new BadRequestException(`Insufficient stock for product ${productId}`);
    }
  }

  private async getStockWithExpiry(
    sedeId: string, 
    productId: string
  ): Promise<Prisma.ProductExpirationGetPayload<{}> | null> {
    return this.prisma.productExpiration.findFirst({
      where: {
        productId,
        sedeId,
        quantity: { gt: 0 },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }
} 