import { Router, Request, Response } from 'express';
import prisma from '../prisma'
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Obtener todos los servicios
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  // Obtener el usuario autenticado
  const authenticatedUser = (req as any).user;
  
  if (!authenticatedUser) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  
  // Obtener la organización del usuario autenticado usando SQL directo
  const currentUserResult = await prisma.$queryRaw`
    SELECT organizacion_id FROM usuarios WHERE id = ${authenticatedUser.id}
  `;
  
  if (!currentUserResult || (currentUserResult as any[]).length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  
  const currentUser = (currentUserResult as any[])[0];
  
  // Filtrar servicios por organización
  const servicios = await prisma.$queryRaw`
    SELECT s.*, o.nombre as organizacion_nombre
    FROM servicios s
    JOIN organizaciones o ON s.organizacion_id = o.id
    WHERE s.organizacion_id = ${currentUser.organizacion_id}::uuid
    ORDER BY s.nombre
  `;
  
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
  
  // Obtener organizacion_id del usuario autenticado
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  
  if (!organizacionId) {
    return res.status(400).json({ error: 'No se pudo determinar la organización del usuario' });
  }
  
  // Usar SQL directo para evitar problemas de tipos
  const result = await prisma.$queryRaw`
    INSERT INTO servicios (id, nombre, descripcion, precio_base, created_at, updated_at, organizacion_id)
    VALUES (gen_random_uuid(), ${nombre}, ${descripcion || null}, ${parseFloat(precio_base)}, NOW(), NOW(), ${organizacionId}::uuid)
    RETURNING *
  `;
  const servicio = (result as any[])[0];
  
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