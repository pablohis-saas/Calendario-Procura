import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Tipos adaptados para Express
interface UsageFormItemDto {
  productId: string;
  allergenId?: string;
  allergenIds?: string[];
  quantity?: number;
  units?: number;
  frascoLevel?: number;
  frascoFactor?: number;
  doses?: number;
  frascoLevels?: number[];
  frascoType?: string;
}

interface ProcessUsageDto {
  sedeId: string;
  userId: string;
  pacienteId?: string;
  nombrePaciente: string;
  tipoTratamiento: string;
  observaciones?: string;
  tuvoReaccion: boolean;
  descripcionReaccion?: string;
  items: UsageFormItemDto[];
}

export async function processInventoryUsage(dto: ProcessUsageDto) {
  console.log('🚀 Starting processInventoryUsage with items:', dto.items.length);
  
  return prisma.$transaction(async (tx) => {
    // 1. Crear el registro principal de InventoryUsage
    const inventoryUsage = await tx.inventoryUsage.create({
      data: {
        id: generateId(),
        nombrePaciente: dto.nombrePaciente,
        pacienteId: dto.pacienteId,
        tipoTratamiento: dto.tipoTratamiento as any,
        observaciones: dto.observaciones,
        tuvoReaccion: dto.tuvoReaccion,
        descripcionReaccion: dto.descripcionReaccion,
        sedeId: dto.sedeId,
        userId: dto.userId,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Created InventoryUsage with ID:', inventoryUsage.id);

    // 2. Procesar cada item para crear movimientos y detalles
    for (const item of dto.items) {
      console.log('🔄 Processing item:', item);
      
      if (item.allergenIds?.length) {
        await processComplexTreatment(tx, dto, item, inventoryUsage.id);
      } else {
        await processSimpleProduct(tx, dto, item, inventoryUsage.id);
      }
    }

    return inventoryUsage;
  }, {
    maxWait: 20000, // 20 segundos para esperar la transacción
    timeout: 20000, // 20 segundos para la transacción
  });
}

async function processComplexTreatment(
  tx: any,
  dto: ProcessUsageDto,
  item: UsageFormItemDto,
  inventoryUsageId: string
) {
  console.log('🔄 Procesando tratamiento complejo con alérgenos:', item.allergenIds?.length);

  // Buscar por ID primero, si no existe, buscar por nombre (case-insensitive, trim)
  let product = await tx.product.findUnique({ where: { id: item.productId } });
  if (!product) {
    product = await tx.product.findFirst({
      where: {
        name: { equals: item.productId.trim(), mode: 'insensitive' },
      },
    });
  }
  if (!product) throw new Error(`Product ${item.productId} not found`);

  if (product.name.toLowerCase().includes('glicerinado')) {
    await processGlicerinadoTreatment(tx, dto, item, inventoryUsageId, product);
  } else if (product.name.toLowerCase().includes('alxoid')) {
    await processAlxoidTreatment(tx, dto, item, inventoryUsageId, product);
  } else if (product.name.toLowerCase().includes('sublingual')) {
    await processSublingualTreatment(tx, dto, item, inventoryUsageId, product);
  } else {
    throw new Error(`Unsupported complex product: ${product.name}`);
  }
}

async function processGlicerinadoTreatment(
  tx: any,
  dto: ProcessUsageDto,
  item: UsageFormItemDto,
  inventoryUsageId: string,
  product: any
) {
  console.log('🔄 Procesando tratamiento Glicerinado');

  if (item.units) {
    // Glicerinado por Unidad
    await processGlicerinadoPorUnidad(tx, dto, item, inventoryUsageId);
  } else if (item.frascoLevel !== undefined || item.frascoLevels) {
    // Glicerinado por Frasco
    await processGlicerinadoPorFrasco(tx, dto, item, inventoryUsageId);
  } else {
    throw new Error('Invalid glicerinado parameters');
  }
}

async function processGlicerinadoPorUnidad(
  tx: any,
  dto: ProcessUsageDto,
  item: UsageFormItemDto,
  inventoryUsageId: string
) {
  console.log('🔄 Procesando Glicerinado por Unidad');
  const doses = item.doses || 1;
  const units = item.units || 0;
  const frascoType = item.frascoType || 'madre'; // fallback a madre si no viene

  // 1. Calcular ml por alérgeno
  const mlPorAlergeno = (units / 10000) * doses;
  console.log(`📊 mlPorAlergeno calculado: ${mlPorAlergeno} (units: ${units}, doses: ${doses})`);

  for (const allergenId of item.allergenIds || []) {
    await processAllergenMovement(tx, dto, allergenId, mlPorAlergeno, inventoryUsageId);
  }

  // 2. Calcular bacteriana
  const bacterianaMl = doses * 0.1;
  console.log(`📊 Bacteriana calculada: ${bacterianaMl} ml (doses: ${doses})`);
  await processDiluentMovement(tx, dto, 'Bacteriana', bacterianaMl, inventoryUsageId);

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
    await processDiluentMovement(tx, dto, 'Evans', Number(evansMl.toFixed(4)), inventoryUsageId);
  }
}

async function processGlicerinadoPorFrasco(
  tx: any,
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
    throw new Error('Faltan frascos o alérgenos para Glicerinado en Frasco');
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
      await processAllergenMovement(tx, dto, allergenId, mlConsumido, inventoryUsageId);
    }
    // Evans por frasco
    const evansMl = Number((3 - (factor * allergenIds.length)) * doses).toFixed(4);
    totalEvans += Number(evansMl);
  }
  // Registrar movimiento de Evans (si corresponde)
  if (totalEvans > 0) {
    console.log(`🔄 Procesando movimiento para diluyente Evans, cantidad: ${totalEvans}`);
    await processDiluentMovement(tx, dto, 'Evans', Number(totalEvans.toFixed(4)), inventoryUsageId);
  }
  // Registrar movimiento de Bacteriana
  if (totalBacteriana > 0) {
    console.log(`🔄 Procesando movimiento para diluyente Bacteriana, cantidad: ${totalBacteriana}`);
    await processDiluentMovement(tx, dto, 'Bacteriana', Number(totalBacteriana.toFixed(4)), inventoryUsageId);
  }
}

async function processAlxoidTreatment(
  tx: any,
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
    throw new Error(`Invalid Alxoid product type: ${product.name}`);
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
      console.log(`⚠️ Allergen ${allergenId} not found, skipping`);
      continue;
    }

    // Validar compatibilidad de tipo
    if (alxoidType === 'A' && allergen.alxoidType === 'B') {
      console.log(`⚠️ Skipping allergen ${allergen.name} (Type B) for Alxoid Type A`);
      continue;
    }
    if (alxoidType === 'B' && allergen.alxoidType === 'A') {
      console.log(`⚠️ Skipping allergen ${allergen.name} (Type A) for Alxoid Type B`);
      continue;
    }

    // Validar exclusividad
    if (allergen.isAlxoidExclusive && alxoidType !== allergen.alxoidType) {
      console.log(`⚠️ Skipping exclusive allergen ${allergen.name} (${allergen.alxoidType}) for Alxoid ${alxoidType}`);
      continue;
    }

    validAllergenIds.push(allergenId);
  }

  console.log(`✅ Valid allergens for ${product.name}: ${validAllergenIds.length}`);

  // Procesar cada alérgeno válido
  for (const allergenId of validAllergenIds) {
    await processAllergenMovement(tx, dto, allergenId, mlPorAlergeno, inventoryUsageId);
  }
}

async function processSublingualTreatment(
  tx: any,
  dto: ProcessUsageDto,
  item: UsageFormItemDto,
  inventoryUsageId: string,
  product: any
) {
  console.log('🔄 Procesando tratamiento Sublingual');
  
  if (!item.frascoFactor) {
    throw new Error('Missing frasco factor for sublingual');
  }

  const FRASCO_FACTORS = [0.002, 0.005, 0.02, 0.05, 0.2, 0.5] as const;
  const FRASCO_VITS_FACTORS = [0.004, 0.02, 0.1, 0.5] as const;

  const frascoIndex = item.frascoFactor - 1; // Convertir a índice 0-based
  const factor = FRASCO_FACTORS[frascoIndex];
  const vitsFactor = FRASCO_VITS_FACTORS[frascoIndex];
  
  const mlPorAlergeno = factor * item.allergenIds!.length;
  const vitsMl = 5 - (vitsFactor * item.allergenIds!.length);

  console.log(`📊 Factor: ${factor}, mlPorAlergeno: ${mlPorAlergeno}, VITS: ${vitsMl}`);

  // Procesar cada alérgeno
  for (const allergenId of item.allergenIds!) {
    await processAllergenMovement(tx, dto, allergenId, mlPorAlergeno, inventoryUsageId);
  }

  // Procesar VITS
  if (vitsMl > 0) {
    await processDiluentMovement(tx, dto, 'VITS', vitsMl, inventoryUsageId);
  }
}

function normalizeString(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/\s+/g, '') // Elimina espacios
    .toLowerCase();
}

async function processAllergenMovement(
  tx: any,
  dto: ProcessUsageDto,
  allergenIdOrName: string,
  quantity: number,
  inventoryUsageId: string
) {
  console.log(`🔄 Procesando movimiento para alérgeno ${allergenIdOrName}, cantidad: ${quantity}`);

  // Buscar por id (slug) primero
  let allergen = await tx.allergen.findUnique({ where: { id: allergenIdOrName } });
  if (!allergen) {
    // Buscar por name (case-insensitive, trim)
    allergen = await tx.allergen.findFirst({
      where: {
        name: { equals: allergenIdOrName.trim(), mode: 'insensitive' },
      },
    });
  }
  if (!allergen) {
    // Buscar por name ignorando tildes y espacios
    const allAllergens = await tx.allergen.findMany();
    const normalizedInput = normalizeString(allergenIdOrName);
    allergen = allAllergens.find((a: { name: string }) => normalizeString(a.name) === normalizedInput);
  }
  if (!allergen) {
    throw new Error(`Allergen ${allergenIdOrName} not found`);
  }

  // Buscar el producto del alérgeno (asumiendo que cada alérgeno tiene su propio producto)
  const product = await tx.product.findFirst({ 
    where: { name: allergen.name },
    include: { ProductAllergen: { include: { Allergen: true } } }
  });

  if (!product) {
    throw new Error(`Product for allergen ${allergen.name} not found`);
  }

  await processMovement(tx, dto, product, quantity, inventoryUsageId);
}

async function processDiluentMovement(
  tx: any,
  dto: ProcessUsageDto,
  diluentName: string,
  quantity: number,
  inventoryUsageId: string
) {
  console.log(`🔄 Procesando movimiento para diluyente ${diluentName}, cantidad: ${quantity}`);

  // Buscar el producto diluyente
  const product = await tx.product.findFirst({ 
    where: { name: diluentName },
    include: { ProductAllergen: { include: { Allergen: true } } }
  });

  if (!product) {
    throw new Error(`Diluent product ${diluentName} not found`);
  }

  await processMovement(tx, dto, product, quantity, inventoryUsageId);
}

async function processSimpleProduct(
  tx: any,
  dto: ProcessUsageDto,
  item: UsageFormItemDto,
  inventoryUsageId: string
) {
  console.log('🔄 Procesando producto simple');

  // Buscar por ID primero, si no existe, buscar por nombre (case-insensitive, trim)
  let product = await tx.product.findUnique({ where: { id: item.productId } });
  if (!product) {
    product = await tx.product.findFirst({
      where: {
        name: { equals: item.productId.trim(), mode: 'insensitive' },
      },
    });
  }
  if (!product) {
    throw new Error(`Product ${item.productId} not found`);
  }

  const quantity = new Decimal(item.quantity || 1);
  await processMovement(tx, dto, product, quantity, inventoryUsageId);
}

async function processMovement(
  tx: any,
  dto: ProcessUsageDto,
  product: any,
  quantity: number | Decimal,
  inventoryUsageId: string
) {
  console.log(`🔄 Processing movement for product: ${product.name}, quantity: ${quantity}`);
  
  const quantityDecimal = typeof quantity === 'number' ? new Decimal(quantity) : quantity;
  
  await validateStock(dto.sedeId, product.id, quantityDecimal);
  const stock = await getStockWithExpiry(dto.sedeId, product.id);
  const unitCost = product.costPerUnit;
  const totalCost = unitCost.mul(quantityDecimal);

  // Crear Movement
  const movement = await tx.movement.create({
    data: {
      id: generateId(),
      userId: dto.userId,
      sedeId: dto.sedeId,
      productId: product.id,
      type: 'EXIT',
      quantity: quantityDecimal.toNumber(),
      unitCost: unitCost.toNumber(),
      totalCost: totalCost.toNumber(),
      batchNumber: stock?.batchNumber,
      expiryDate: stock?.expiryDate,
      createdAt: new Date(),
    },
  });

  console.log('✅ Created Movement with ID:', movement.id);

  // Crear InventoryUsageDetail
  const detail = await tx.inventoryUsageDetail.create({
    data: {
      id: generateId(),
      inventoryUsageId: inventoryUsageId,
      movementId: movement.id,
      productId: product.id,
      quantity: quantityDecimal.toNumber(),
      unitCost: unitCost.toNumber(),
      totalCost: totalCost.toNumber(),
      createdAt: new Date(),
      updatedAt: new Date(),
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

async function validateStock(sedeId: string, productId: string, quantity: Decimal): Promise<void> {
  const stock = await prisma.stockBySede.findUnique({
    where: {
      productId_sedeId: {
        productId,
        sedeId,
      },
    },
  });

  if (!stock || Number(stock.quantity) < quantity.toNumber()) {
    throw new Error(`Insufficient stock for product ${productId}`);
  }
}

async function getStockWithExpiry(
  sedeId: string, 
  productId: string
): Promise<any> {
  return prisma.productExpiration.findFirst({
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

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
} 