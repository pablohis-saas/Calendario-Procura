import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';

const prisma = new PrismaClient();

export const getAllUsuarios = asyncHandler(async (req: Request, res: Response) => {
  const usuarios = await prisma.usuario.findMany({
    include: { consultorio: true }
  });
  res.json(usuarios);
});

export const getUsuarioById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuario = await prisma.usuario.findUnique({ 
    where: { id },
    include: { consultorio: true }
  });
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(usuario);
});

export const createUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, apellido, rol, email, telefono, consultorio_id } = req.body;
  
  if (!nombre || !apellido || !rol || !email || !telefono || !consultorio_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  const rolesValidos = ['DOCTOR', 'SECRETARIA', 'ADMINISTRADOR'];
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  // Validar que el consultorio exista
  const consultorio = await prisma.consultorio.findUnique({ where: { id: consultorio_id } });
  if (!consultorio) {
    return res.status(400).json({ error: 'Consultorio no encontrado' });
  }
  
  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      apellido,
      rol,
      email,
      telefono,
      consultorio_id,
    },
    include: { consultorio: true }
  });
  res.json(usuario);
});

export const updateUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, apellido, rol, email, telefono, consultorio_id } = req.body;
  
  const updateData: any = {};
  if (nombre) updateData.nombre = nombre;
  if (apellido) updateData.apellido = apellido;
  if (rol) {
    const rolesValidos = ['DOCTOR', 'SECRETARIA', 'ADMINISTRADOR'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    updateData.rol = rol;
  }
  if (email) updateData.email = email;
  if (telefono) updateData.telefono = telefono;
  if (consultorio_id) {
    // Validar que el consultorio exista
    const consultorio = await prisma.consultorio.findUnique({ where: { id: consultorio_id } });
    if (!consultorio) {
      return res.status(400).json({ error: 'Consultorio no encontrado' });
    }
    updateData.consultorio_id = consultorio_id;
  }
  
  const usuario = await prisma.usuario.update({
    where: { id },
    data: updateData,
    include: { consultorio: true }
  });
  res.json(usuario);
});

export const deleteUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.usuario.delete({ where: { id } });
  res.json({ message: 'Usuario eliminado' });
}); 