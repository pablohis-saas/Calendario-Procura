import { Request, Response } from 'express';
import prisma from '../prisma';
import { asyncHandler } from '../utils/asyncHandler';

export const getAllConsultorios = asyncHandler(async (req: Request, res: Response) => {
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
  
  // Filtrar consultorios por organización
  const consultorios = await prisma.$queryRaw`
    SELECT c.*, o.nombre as organizacion_nombre
    FROM consultorios c
    JOIN organizaciones o ON c.organizacion_id = o.id
    WHERE c.organizacion_id = ${currentUser.organizacion_id}::uuid
    ORDER BY c.nombre
  `;
  
  res.json(consultorios);
});

export const getConsultorioById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const consultorio = await prisma.consultorio.findUnique({ where: { id } });
  if (!consultorio) return res.status(404).json({ error: 'Consultorio no encontrado' });
  res.json(consultorio);
});

export const createConsultorio = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, direccion } = req.body;
  
  // Obtener organizacion_id del usuario autenticado o usar la organización por defecto
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  
  let consultorio;
  if (organizacionId) {
    // Usar SQL directo para evitar problemas de tipos
    const result = await prisma.$queryRaw`
      INSERT INTO consultorios (nombre, direccion, organizacion_id)
      VALUES (${nombre}, ${direccion}, ${organizacionId}::uuid)
      RETURNING *
    `;
    consultorio = (result as any[])[0];
  } else {
    // Comportamiento original sin organización - usar SQL directo
    const result = await prisma.$queryRaw`
      INSERT INTO consultorios (nombre, direccion)
      VALUES (${nombre}, ${direccion})
      RETURNING *
    `;
    consultorio = (result as any[])[0];
  }
  
  res.json(consultorio);
});

export const updateConsultorio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, direccion } = req.body;
  const consultorio = await prisma.consultorio.update({
    where: { id },
    data: { nombre, direccion },
  });
  res.json(consultorio);
});

export const deleteConsultorio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.consultorio.delete({ where: { id } });
  res.json({ message: 'Consultorio eliminado' });
}); 