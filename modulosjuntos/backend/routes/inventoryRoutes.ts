import { Router } from 'express';
import { registerInventoryExit, getInventoryEntriesByCategory, getInventoryExitsByCategory } from '../controllers/inventoryController';
import prisma from '../prisma'
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';
import CacheService from '../services/cacheService';

// Instancia global del servicio de caché
const cacheService = new CacheService(prisma);

const router = Router();

// Cambiar la ruta para que coincida con el frontend
router.post('/inventory/use', registerInventoryExit);
// router.post('/use', registerInventoryExit); // Dejar comentado para evitar duplicidad

// GET /products - obtener todos los productos (disponibles globalmente)
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

// GET /stock - obtener stock por sede del usuario autenticado
router.get('/stock', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    // Buscar el usuario del inventario por email para obtener su sedeId
    const inventoryUser = await prisma.user.findUnique({
      where: { email: usuario.email },
      select: { sedeId: true }
    });
    
    if (!inventoryUser) {
      return res.status(401).json({ error: 'Usuario de inventario no encontrado' });
    }
    
    const stock = await prisma.stockBySede.findMany({
      where: { sedeId: inventoryUser.sedeId },
      include: { Product: true }
    });
    
    res.json(stock);
  } catch (error) {
    console.error('Error al obtener stock:', error);
    res.status(500).json({ error: 'Error al obtener stock' });
  }
});

// POST /inventory-entry/batch - registrar entradas de inventario en lote
router.post('/inventory-entry/batch', async (req, res) => {
  try {
    const { entries, entryDate } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'No hay entradas para registrar' });
    }
    
    // CACHÉ: Invalidar caché del dashboard antes de procesar
    cacheService.clear();
    
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



// Endpoint para dashboard de inventario - OPTIMIZADO CON CACHÉ
router.get('/dashboard/public', async (req, res) => {
  try {
    const { sedeId, from, to } = req.query;
    
    // Obtener el usuario autenticado y mapear a la sede correspondiente
    const userId = (req as any).user.id;
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { email: true, consultorio_id: true }
    });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    // Buscar el usuario del inventario por email para obtener su sedeId
    const inventoryUser = await prisma.user.findUnique({
      where: { email: usuario.email },
      select: { sedeId: true }
    });
    
    if (!inventoryUser) {
      return res.status(401).json({ error: 'Usuario de inventario no encontrado' });
    }
    
    // Usar la sede del usuario de inventario
    const userSedeId = sedeId ? String(sedeId) : inventoryUser.sedeId;
    
    // CACHÉ: Verificar si tenemos datos en caché
    const cacheKey = `dashboard:${userSedeId}:${from || 'all'}:${to || 'all'}`;
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      console.log('📦 Sirviendo dashboard desde caché');
      return res.json(cachedData);
    }
    
    // Filtros de fechas y sede
    const whereMovements = {
      sedeId: userSedeId,
      ...(from && to ? { createdAt: { gte: new Date(String(from)), lte: new Date(String(to)) } } : {}),
    };

    // OPTIMIZACIÓN: Ejecutar todas las queries en paralelo para evitar N+1
    const [
      stockBySede,
      movements,
      expirationAlerts
    ] = await Promise.all([
      // Stock por producto y sede con Product incluido
      prisma.stockBySede.findMany({
        where: { sedeId: userSedeId },
        include: { Product: true }
      }),
      
      // Movimientos de inventario con Product incluido
      prisma.movement.findMany({
        where: whereMovements,
        include: { Product: true },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limitar a 100 movimientos recientes para performance
      }),
      
      // Alertas de caducidad
      prisma.productExpiration.findMany({
        where: {
          sedeId: userSedeId,
          expiryDate: { lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180) },
          quantity: { gt: 0 }
        },
        include: { Product: true }
      })
    ]);

    // OPTIMIZACIÓN: Procesar datos en memoria en lugar de queries adicionales
    const entries = movements.filter(m => m.type === 'ENTRY');
    const exits = movements.filter(m => m.type === 'EXIT');

    // Productos en inventario con stock y valor calculado
    const inventory = stockBySede.map(s => ({
      id: s.Product?.id,
      name: s.Product?.name,
      type: s.Product?.type,
      unit: s.Product?.unit,
      description: s.Product?.description,
      costPerUnit: s.Product?.costPerUnit,
      minStockLevel: s.Product?.minStockLevel,
      category: s.Product?.category,
      quantity: Number(s.quantity),
      totalValue: Number(s.quantity) * Number(s.Product?.costPerUnit || 0),
      createdAt: s.Product?.createdAt,
      updatedAt: s.Product?.updatedAt
    }));

    // Métricas principales - OPTIMIZADO con reduce
    const totalInventoryValue = stockBySede.reduce((sum, s) => 
      sum + (Number(s.quantity) * Number(s.Product?.costPerUnit || 0)), 0);
    const totalEnteredInventoryCost = entries.reduce((sum, m) => 
      sum + Number(m.totalCost), 0);
    const totalUsedInventoryCost = exits.reduce((sum, m) => 
      sum + Number(m.totalCost), 0);

    // Agrupación por categoría - OPTIMIZADO
    const categoryMap = new Map();
    for (const s of stockBySede) {
      const cat = s.Product?.category || 'Sin categoría';
      const current = categoryMap.get(cat) || { category: cat, totalQuantity: 0, totalValue: 0 };
      current.totalQuantity += Number(s.quantity);
      current.totalValue += Number(s.quantity) * Number(s.Product?.costPerUnit || 0);
      categoryMap.set(cat, current);
    }
    const inventoryByCategory = Array.from(categoryMap.values());

    // Productos más usados - OPTIMIZADO
    const productUsage = new Map();
    for (const m of movements) {
      const id = m.productId;
      const current = productUsage.get(id) || { 
        productName: m.Product?.name || 'Desconocido', 
        totalExits: 0, 
        totalUsage: 0 
      };
      if (m.type === 'EXIT') current.totalExits += Number(m.quantity);
      productUsage.set(id, current);
    }
    const mostUsedProducts = Array.from(productUsage.values())
      .sort((a, b) => (b.totalExits + b.totalUsage) - (a.totalExits + a.totalUsage));

    // Alertas de bajo stock - OPTIMIZADO
    const lowStockAlerts = stockBySede
      .filter(s => Number(s.quantity) < 10)
      .map(s => ({
        name: s.Product?.name || 'Desconocido',
        quantity: Number(s.quantity),
        unitCost: Number(s.Product?.costPerUnit || 0),
        totalValue: Number(s.quantity) * Number(s.Product?.costPerUnit || 0),
        category: s.Product?.category || 'Sin categoría'
      }));

    // Movimientos recientes - OPTIMIZADO
    const recentMovements = movements.slice(0, 10);

    // Inventario inmovilizado - OPTIMIZADO
    const ninetyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90);
    const immobilizedInventory = stockBySede
      .filter(s => {
        const lastMovement = movements.find(m => 
          m.productId === s.productId && 
          m.sedeId === s.sedeId && 
          m.createdAt > ninetyDaysAgo
        );
        return !lastMovement && Number(s.quantity) > 0;
      })
      .map(s => ({
        name: s.Product?.name || 'Desconocido',
        quantity: Number(s.quantity),
        unitCost: Number(s.Product?.costPerUnit || 0),
        totalValue: Number(s.quantity) * Number(s.Product?.costPerUnit || 0),
        category: s.Product?.category || 'Sin categoría'
      }));

    const dashboardData = {
      inventory,
      inventoryByCategory,
      totalInventoryValue,
      totalExits: exits.length,
      totalUsage: 0,
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
    };

    // CACHÉ: Guardar en caché por 2 minutos
    cacheService.set(cacheKey, dashboardData, 2 * 60 * 1000);
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error en dashboard/public:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
  }
});

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export { router as inventoryRoutes }; 