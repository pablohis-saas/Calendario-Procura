import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const prisma = new PrismaClient();

// Obtener todos los servicios
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const servicios = await prisma.servicio.findMany({
    orderBy: { nombre: 'asc' }
  });
  res.json(servicios);
}));

// Obtener un servicio por ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const servicio = await prisma.servicio.findUnique({
    where: { id }
  });
  if (!servicio) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }
  res.json(servicio);
}));

// Crear un nuevo servicio
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { nombre, descripcion, precio_base } = req.body;
  if (!nombre || !precio_base) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }
  const servicio = await prisma.servicio.create({
    data: {
      nombre,
      descripcion: descripcion || null,
      precio_base: parseFloat(precio_base)
    }
  });
  res.status(200).json(servicio);
}));

// Actualizar un servicio
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, descripcion, precio_base } = req.body;
  if (!nombre || !precio_base) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }
  const servicio = await prisma.servicio.update({
    where: { id },
    data: {
      nombre,
      descripcion: descripcion || null,
      precio_base: parseFloat(precio_base)
    }
  });
  res.json(servicio);
}));

// Eliminar un servicio
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Verificar si el servicio está siendo usado en algún cobro
  const conceptosUsandoServicio = await prisma.cobroConcepto.findFirst({
    where: { servicio_id: id }
  });
  if (conceptosUsandoServicio) {
    return res.status(400).json({ 
      error: 'No se puede eliminar el servicio porque está siendo usado en cobros existentes' 
    });
  }
  await prisma.servicio.delete({
    where: { id }
  });
  res.json({ message: 'Servicio eliminado' });
}));

// Obtener los usos de un servicio (conceptos de cobro y cobros relacionados)
router.get('/:id/usos', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const conceptos = await prisma.cobroConcepto.findMany({
    where: { servicio_id: id },
    include: {
      cobro: {
        include: {
          paciente: true,
          usuario: true,
        }
      },
      consultorio: true,
    }
  });
  res.json(conceptos);
}));

export default router; 