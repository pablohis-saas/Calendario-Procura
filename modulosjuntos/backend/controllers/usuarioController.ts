import { Request, Response } from 'express';
import prisma from '../prisma';
import { asyncHandler } from '../utils/asyncHandler';

export const getAllUsuarios = asyncHandler(async (req: Request, res: Response) => {
  // Obtener el usuario autenticado
  const authenticatedUser = (req as any).user;
  
  if (!authenticatedUser) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  
  // Obtener el consultorio_id del usuario autenticado
  const currentUser = await prisma.usuario.findUnique({
    where: { id: authenticatedUser.id },
    select: { consultorio_id: true, rol: true }
  });
  
  if (!currentUser) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  
  let usuarios;
  
  // Si es DOCTOR, ver solo usuarios de su consultorio
  if (currentUser.rol === 'DOCTOR') {
    usuarios = await prisma.$queryRaw`
      SELECT u.*, c.nombre as consultorio_nombre
      FROM usuarios u
      JOIN consultorios c ON u.consultorio_id = c.id
      WHERE u.consultorio_id = ${currentUser.consultorio_id}
      ORDER BY u.nombre, u.apellido
    `;
  } else {
    // Si es SECRETARIA o ADMINISTRADOR, ver solo usuarios de su consultorio
    usuarios = await prisma.$queryRaw`
      SELECT u.*, c.nombre as consultorio_nombre
      FROM usuarios u
      JOIN consultorios c ON u.consultorio_id = c.id
      WHERE u.consultorio_id = ${currentUser.consultorio_id}
      ORDER BY u.nombre, u.apellido
    `;
  }
  
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
  
  // Obtener organizacion_id del usuario autenticado o usar la organización por defecto
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  
  let usuario;
  if (organizacionId) {
    // Usar SQL directo para evitar problemas de tipos
    const result = await prisma.$queryRaw`
      INSERT INTO usuarios (nombre, apellido, rol, email, telefono, consultorio_id, organizacion_id)
      VALUES (${nombre}, ${apellido}, ${rol}, ${email}, ${telefono}, ${consultorio_id}::uuid, ${organizacionId}::uuid)
      RETURNING *
    `;
    usuario = (result as any[])[0];
    
    // Obtener información del consultorio
    const consultorio = await prisma.consultorio.findUnique({ where: { id: consultorio_id } });
    usuario.consultorio = consultorio;
  } else {
    // Comportamiento original sin organización - usar SQL directo
    const result = await prisma.$queryRaw`
      INSERT INTO usuarios (nombre, apellido, rol, email, telefono, consultorio_id)
      VALUES (${nombre}, ${apellido}, ${rol}, ${email}, ${telefono}, ${consultorio_id}::uuid)
      RETURNING *
    `;
    usuario = (result as any[])[0];
    
    // Obtener información del consultorio
    const consultorio = await prisma.consultorio.findUnique({ where: { id: consultorio_id } });
    usuario.consultorio = consultorio;
  }
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