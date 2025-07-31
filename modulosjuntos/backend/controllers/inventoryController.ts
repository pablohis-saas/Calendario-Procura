import { Request, Response } from 'express';
import { processInventoryUsage } from '../services/inventoryService';
import { PrismaClient, MovementType } from '@prisma/client';
import prisma from '../prisma';

// Función para adaptar los datos del frontend al formato del backend
async function adaptFrontendData(frontendData: any, req: Request) {
  // Validar que los datos requeridos estén presentes
  if (!frontendData.nombrePaciente) {
    throw new Error('nombrePaciente es requerido');
  }
  if (!frontendData.tipoTratamiento) {
    throw new Error('tipoTratamiento es requerido');
  }
  if (!frontendData.items || !Array.isArray(frontendData.items)) {
    throw new Error('items debe ser un array válido');
  }

  // Obtener el usuario autenticado
  const userId = (req as any).user?.id;
  const userEmail = (req as any).user?.email;
  
  // Buscar el usuario de inventario por email
  const inventoryUser = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, sedeId: true }
  });
  
  if (!inventoryUser) {
    throw new Error('Usuario de inventario no encontrado');
  }
  
  return {
    sedeId: inventoryUser.sedeId,
    userId: inventoryUser.id,
    pacienteId: frontendData.pacienteId,
    nombrePaciente: frontendData.nombrePaciente,
    tipoTratamiento: frontendData.tipoTratamiento,
    observaciones: frontendData.observaciones,
    tuvoReaccion: frontendData.tuvoReaccion || false,
    descripcionReaccion: frontendData.descripcionReaccion,
    items: frontendData.items.map((item: any) => {
      // Adaptar para glicerinado por unidad y frasco
      let units = undefined;
      let frascoType = undefined;
      let frascoLevel = undefined;
      let frascoLevels = undefined;
      if (item.subtipo === 'GLICERINADO_UNIDAD') {
        units = item.cantidad || 1;
        frascoType = item.frasco || 'madre';
      }
      if (item.subtipo === 'GLICERINADO_FRASCO') {
        if (Array.isArray(item.frascoLevels)) {
          frascoLevels = item.frascoLevels;
        } else if (item.frascoLevel !== undefined) {
          frascoLevel = item.frascoLevel;
        } else if (item.frasco !== undefined) {
          // Si viene como string, intentar parsear a número
          const num = Number(item.frasco);
          if (!isNaN(num)) frascoLevel = num;
        }
      }
      return {
        productId: item.nombreProducto,
        allergenIds: item.alergenos || [],
        quantity: item.cantidad || 1,
        doses: item.doses || 1,
        units,
        frascoType,
        frascoLevel,
        frascoLevels,
      };
    })
  };
}

export const registerInventoryExit = async (req: Request, res: Response) => {
  try {
    console.log('📥 Received data from frontend:', req.body);
    // Adaptar los datos del frontend al formato del backend
    const adaptedData = await adaptFrontendData(req.body, req);
    console.log('🔄 Adapted data for backend:', adaptedData);
    const result = await processInventoryUsage(adaptedData);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error en registerInventoryExit:', error);
    return res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unexpected error' });
  }
};

// Endpoint para obtener entradas de inventario agrupadas por categoría
export async function getInventoryEntriesByCategory(req: Request, res: Response) {
  try {
    // Asegura que sedeId sea string
    const sedeId = typeof req.query.sedeId === 'string' ? req.query.sedeId : undefined;
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    const where = {
      type: MovementType.ENTRY,
      ...(sedeId ? { sedeId } : {}),
      ...(from && to ? { createdAt: { gte: new Date(from), lte: new Date(to) } } : {}),
    };
    // Trae todos los movimientos tipo ENTRY con producto
    const entries = await prisma.movement.findMany({
      where,
      include: {
        Product: true
      },
      orderBy: { createdAt: 'desc' }
    }) as any[];
    // Agrupa por categoría
    const grouped: { [key: string]: any } = {};
    for (const entry of entries) {
      const category = entry.Product?.category || 'Sin categoría';
      if (!grouped[category]) {
        grouped[category] = {
          category,
          totalQuantity: 0,
          totalValue: 0,
          entries: []
        };
      }
      grouped[category].totalQuantity += Number(entry.quantity);
      grouped[category].totalValue += Number(entry.totalCost);
      grouped[category].entries.push({
        name: entry.Product?.name || 'Desconocido',
        quantity: Number(entry.quantity),
        totalValue: Number(entry.totalCost),
        createdAt: entry.createdAt
      });
    }
    // Si no hay datos, devuelve array vacío
    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error en getInventoryEntriesByCategory:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
  }
}

// Endpoint para obtener salidas de inventario agrupadas por categoría
export async function getInventoryExitsByCategory(req: Request, res: Response) {
  try {
    // Asegura que sedeId sea string
    const sedeId = typeof req.query.sedeId === 'string' ? req.query.sedeId : undefined;
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    const where = {
      type: MovementType.EXIT,
      ...(sedeId ? { sedeId } : {}),
      ...(from && to ? { createdAt: { gte: new Date(from), lte: new Date(to) } } : {}),
    };
    // Trae todos los movimientos tipo EXIT con producto
    const exits = await prisma.movement.findMany({
      where,
      include: {
        Product: true
      },
      orderBy: { createdAt: 'desc' }
    }) as any[];
    // Agrupa por categoría
    const grouped: { [key: string]: any } = {};
    for (const exit of exits) {
      const category = exit.Product?.category || 'Sin categoría';
      if (!grouped[category]) {
        grouped[category] = {
          category,
          totalQuantity: 0,
          totalValue: 0,
          products: []
        };
      }
      grouped[category].totalQuantity += Number(exit.quantity);
      grouped[category].totalValue += Number(exit.totalCost);
      grouped[category].products.push({
        name: exit.Product?.name || 'Desconocido',
        quantity: Number(exit.quantity),
        totalValue: Number(exit.totalCost)
      });
    }
    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error en getInventoryExitsByCategory:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
  }
} 