import { Router } from 'express';
import { registerInventoryExit, getInventoryEntriesByCategory, getInventoryExitsByCategory } from '../controllers/inventoryController';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

// Cambiar la ruta para que coincida con el frontend
router.post('/inventory/use', registerInventoryExit);
// router.post('/use', registerInventoryExit); // Dejar comentado para evitar duplicidad

// GET /products - obtener todos los productos
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /products/category/:category - obtener productos por categoría
router.get('/products/category/:category', async (req, res) => {
  try {
    const category = req.params.category?.trim();
    if (!category) return res.status(400).json({ error: 'Categoría requerida' });
    const products = await prisma.product.findMany({
      where: {
        category: { equals: category },
      },
    });
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener productos por categoría' });
  }
});

// POST /inventory-entry/batch - registrar entradas de inventario en lote
router.post('/inventory-entry/batch', async (req, res) => {
  try {
    const { entries, entryDate } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'No hay entradas para registrar' });
    }
    const results = [];
    for (const entry of entries) {
      // Buscar el producto para obtener costPerUnit
      const product = await prisma.product.findUnique({ where: { id: String(entry.productId) } });
      if (!product) {
        return res.status(400).json({ error: `Producto no encontrado: ${entry.productId}` });
      }
      const quantityDecimal = new Decimal(entry.quantity);
      const unitCost = new Decimal(entry.unitCost ?? product.costPerUnit);
      const totalCost = unitCost.mul(quantityDecimal);
      // 1. Registrar movimiento ENTRY
      const movement = await prisma.movement.create({
        data: {
          id: generateId(),
          userId: String(entry.userId),
          sedeId: String(entry.sedeId),
          productId: String(entry.productId),
          type: 'ENTRY',
          quantity: quantityDecimal.toNumber(),
          unitCost: unitCost.toNumber(),
          totalCost: totalCost.toNumber(),
          batchNumber: entry.batchNumber || undefined,
          expiryDate: entry.expiryDate ? new Date(entry.expiryDate) : undefined,
          createdAt: entryDate ? new Date(entryDate) : new Date(),
        },
      });
      // 2. Actualizar stock en StockBySede
      await prisma.stockBySede.upsert({
        where: {
          productId_sedeId: {
            productId: String(entry.productId),
            sedeId: String(entry.sedeId),
          },
        },
        update: {
          quantity: { increment: quantityDecimal.toNumber() },
          updatedAt: new Date(),
        },
        create: {
          id: `stock-${entry.productId}-${entry.sedeId}`,
          productId: String(entry.productId),
          sedeId: String(entry.sedeId),
          quantity: quantityDecimal.toNumber(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      // 3. Registrar caducidad si aplica
      if (entry.expiryDate) {
        await prisma.productExpiration.create({
          data: {
            id: uuidv4(),
            productId: String(entry.productId),
            sedeId: String(entry.sedeId),
            batchNumber: entry.batchNumber || 'default',
            expiryDate: new Date(entry.expiryDate),
            quantity: Number(entry.quantity),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
      results.push(movement);
    }
    res.status(201).json({ success: true, data: results });
  } catch (error) {
    console.error('Error al registrar entradas de inventario:', error);
    res.status(500).json({ error: 'Error al registrar entradas de inventario' });
  }
});

// GET /inventory-entry/by-category - resumen de entradas agrupadas por categoría
router.get('/inventory-entry/by-category', getInventoryEntriesByCategory);

// GET /inventory/exit/by-category - resumen de salidas agrupadas por categoría
router.get('/inventory/exit/by-category', getInventoryExitsByCategory);

// Endpoint para dashboard de inventario
router.get('/dashboard/public', async (req, res) => {
  try {
    const { sedeId, from, to } = req.query;
    // Filtros de fechas y sede
    const whereMovements = {
      ...(sedeId ? { sedeId: String(sedeId) } : {}),
      ...(from && to ? { createdAt: { gte: new Date(String(from)), lte: new Date(String(to)) } } : {}),
    };

    // Productos en inventario
    const inventory = await prisma.product.findMany();

    // Stock por producto y sede
    const stockBySede = await prisma.stockBySede.findMany({
      where: sedeId ? { sedeId: String(sedeId) } : {},
      include: { Product: true }
    });

    // Movimientos de inventario (entradas y salidas)
    const movements = await prisma.movement.findMany({
      where: whereMovements,
      include: { Product: true },
      orderBy: { createdAt: 'desc' }
    });

    // Entradas y salidas
    const entries = movements.filter(m => m.type === 'ENTRY');
    const exits = movements.filter(m => m.type === 'EXIT');

    // Métricas principales
    const totalInventoryValue = stockBySede.reduce((sum, s) => sum + (Number(s.quantity) * Number(s.Product?.costPerUnit || 0)), 0);
    const totalEnteredInventoryCost = entries.reduce((sum, m) => sum + Number(m.totalCost), 0);
    const totalUsedInventoryCost = exits.reduce((sum, m) => sum + Number(m.totalCost), 0);

    // Agrupación por categoría
    const inventoryByCategory: any[] = [];
    const categoryMap: { [key: string]: any } = {};
    for (const s of stockBySede) {
      const cat = s.Product?.category || 'Sin categoría';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, totalQuantity: 0, totalValue: 0 };
      }
      categoryMap[cat].totalQuantity += Number(s.quantity);
      categoryMap[cat].totalValue += Number(s.quantity) * Number(s.Product?.costPerUnit || 0);
    }
    for (const cat in categoryMap) inventoryByCategory.push(categoryMap[cat]);

    // Productos más usados
    const productUsage: { [id: string]: { productName: string, totalExits: number, totalUsage: number } } = {};
    for (const m of movements) {
      const id = m.productId;
      if (!productUsage[id]) productUsage[id] = { productName: m.Product?.name || 'Desconocido', totalExits: 0, totalUsage: 0 };
      if (m.type === 'EXIT') productUsage[id].totalExits += Number(m.quantity);
      // Si tuvieras otro tipo de movimiento para 'uso', agrégalo aquí. Por ahora, solo contamos salidas.
    }
    const mostUsedProducts = Object.values(productUsage).sort((a, b) => (b.totalExits + b.totalUsage) - (a.totalExits + a.totalUsage));

    // Alertas de bajo stock (ejemplo: menos de 10)
    const lowStockAlerts = stockBySede.filter(s => Number(s.quantity) < 10).map(s => ({
      name: s.Product?.name || 'Desconocido',
      quantity: Number(s.quantity),
      unitCost: Number(s.Product?.costPerUnit || 0),
      totalValue: Number(s.quantity) * Number(s.Product?.costPerUnit || 0),
      category: s.Product?.category || 'Sin categoría'
    }));

    // Alertas de caducidad (productos con expiración próxima)
    const expirationAlerts = await prisma.productExpiration.findMany({
      where: {
        expiryDate: { lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) }, // próximos 30 días
        quantity: { gt: 0 }
      },
      include: { Product: true }
    });

    // Movimientos recientes
    const recentMovements = movements.slice(0, 10);

    // Inventario inmovilizado (ejemplo: productos con stock pero sin movimientos en 90 días)
    const ninetyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90);
    const immobilizedInventory = stockBySede.filter(s => {
      const lastMovement = movements.find(m => m.productId === s.productId && m.sedeId === s.sedeId && m.createdAt > ninetyDaysAgo);
      return !lastMovement && Number(s.quantity) > 0;
    }).map(s => ({
      name: s.Product?.name || 'Desconocido',
      quantity: Number(s.quantity),
      unitCost: Number(s.Product?.costPerUnit || 0),
      totalValue: Number(s.quantity) * Number(s.Product?.costPerUnit || 0),
      category: s.Product?.category || 'Sin categoría'
    }));

    res.json({
      inventory,
      inventoryByCategory,
      totalInventoryValue,
      totalExits: exits.length,
      totalUsage: 0, // No hay movimientos de tipo 'USAGE' en el modelo actual
      totalUsedInventoryCost,
      totalEnteredInventoryCost,
      lowStockAlerts,
      expirationAlerts,
      mostUsedProducts,
      recentMovements,
      immobilizedInventory,
      totalProductsByCategory: inventoryByCategory,
      sedeId: sedeId || null,
      from: from || null,
      to: to || null
    });
  } catch (error) {
    console.error('Error en dashboard/public:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
  }
});

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export { router as inventoryRoutes }; 