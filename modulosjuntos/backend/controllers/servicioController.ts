import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAllServicios = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener organizacion_id del usuario autenticado si está disponible
    const organizacionId = (req as any).tenantFilter?.organizacion_id;
    
    let servicios;
    if (organizacionId) {
      // Filtrar por organización usando SQL directo
      servicios = await prisma.$queryRaw`
        SELECT * FROM servicios 
        WHERE organizacion_id = ${organizacionId}::uuid
        ORDER BY nombre ASC
      `;
    } else {
      // Sin filtro de organización (comportamiento original)
      servicios = await prisma.servicio.findMany({
        orderBy: { nombre: 'asc' }
      });
    }
    
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

export const getServicioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const servicio = await prisma.servicio.findUnique({ where: { id } });
    if (!servicio) {
      res.status(404).json({ error: 'Servicio no encontrado' });
      return;
    }
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicio' });
  }
};

export const createServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, precio_base } = req.body;
    if (!nombre || !precio_base) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }
    
    // Obtener organizacion_id del usuario autenticado
    const organizacionId = (req as any).tenantFilter?.organizacion_id;
    
    if (!organizacionId) {
      res.status(400).json({ error: 'No se pudo determinar la organización del usuario' });
      return;
    }
    
    // Usar SQL directo para evitar problemas de tipos
    const result = await prisma.$queryRaw`
      INSERT INTO servicios (id, nombre, descripcion, precio_base, created_at, updated_at, organizacion_id)
      VALUES (gen_random_uuid(), ${nombre}, NULL, ${parseFloat(precio_base)}, NOW(), NOW(), ${organizacionId}::uuid)
      RETURNING *
    `;
    const servicio = (result as any[])[0];
    
    res.status(200).json(servicio);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear servicio' });
  }
};

export const updateServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, precio_base } = req.body;
    const updateData: any = {};
    if (nombre) updateData.nombre = nombre;
    if (precio_base) updateData.precio_base = parseFloat(precio_base);
    const servicio = await prisma.servicio.update({ where: { id }, data: updateData });
    res.json(servicio);
  } catch (error) {
    res.status(404).json({ error: 'Servicio no encontrado' });
  }
};

export const deleteServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.servicio.delete({ where: { id } });
    res.status(200).json({ message: 'Servicio eliminado' });
  } catch (error) {
    res.status(404).json({ error: 'Servicio no encontrado' });
  }
}; 