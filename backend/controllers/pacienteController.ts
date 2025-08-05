import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllPacientes(req: Request, res: Response) {
  try {
    const pacientes = await prisma.paciente.findMany();
    res.json(pacientes);
  } catch (error: any) {
    console.error('Error en getAllPacientes:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getPacienteById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const paciente = await prisma.paciente.findUnique({ where: { id } });
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createPaciente(req: Request, res: Response) {
  console.log('Body recibido en createPaciente:', req.body);
  try {
    const { nombre, apellido, fecha_nacimiento, genero, telefono, email } = req.body;
    // Validar campos requeridos
    if (!nombre || !apellido || !fecha_nacimiento || !genero || !telefono || !email) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar duplicados por email o teléfono
    const existing = await prisma.paciente.findFirst({
      where: {
        OR: [
          { email: email },
          { telefono: telefono }
        ]
      }
    });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un paciente con ese email o teléfono.' });
    }

    const paciente = await prisma.paciente.create({
      data: {
        nombre,
        apellido,
        fecha_nacimiento: new Date(fecha_nacimiento),
        genero,
        telefono,
        email,
      },
    });
    res.json(paciente);
  } catch (error: any) {
    console.error('Error en createPaciente:', error);
    res.status(400).json({ error: error.message });
  }
}

export async function updatePaciente(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nombre, fecha_nacimiento, genero, direccion, telefono, email, documento_identidad } = req.body;
    
    const updateData: any = {};
    if (nombre) updateData.nombre = nombre;
    if (fecha_nacimiento) updateData.fecha_nacimiento = new Date(fecha_nacimiento);
    if (genero) updateData.genero = genero;
    if (direccion) updateData.direccion = direccion;
    if (telefono) updateData.telefono = telefono;
    if (email) updateData.email = email;
    if (documento_identidad) updateData.documento_identidad = documento_identidad;

    const paciente = await prisma.paciente.update({
      where: { id },
      data: updateData,
    });
    res.json(paciente);
  } catch (error: any) {
    res.status(404).json({ error: 'Paciente no encontrado' });
  }
}

export async function deletePaciente(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.paciente.delete({ where: { id } });
    res.json({ message: 'Paciente eliminado' });
  } catch (error: any) {
    res.status(404).json({ error: 'Paciente no encontrado' });
  }
} 

export async function searchPacientes(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length < 1) {
      return res.status(400).json({ error: 'Query demasiado corto' });
    }
    const       pacientes = await prisma.paciente.findMany({
        where: {
          OR: [
            { nombre: { startsWith: q } },
            { apellido: { startsWith: q } },
          ],
        },
        orderBy: [{ nombre: 'asc' }, { apellido: 'asc' }],
        take: 10,
      });
    res.json(pacientes);
  } catch (error: any) {
    console.error('Error en searchPacientes:', error);
    res.status(500).json({ error: error.message });
  }
} 