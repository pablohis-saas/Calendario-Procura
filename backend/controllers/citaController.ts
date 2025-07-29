import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function getAllCitas(req: Request, res: Response) {
  try {
    const citas = await prisma.citas.findMany({
      include: {
        pacientes: true,
        usuarios: true,
        consultorios: true,
      },
      orderBy: { fecha_inicio: 'asc' },
    });
    res.json(citas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createCita(req: Request, res: Response) {
  try {
    const { paciente_id, usuario_id, consultorio_id, fecha_inicio, fecha_fin, descripcion, estado, color } = req.body;
    if (!paciente_id || !usuario_id || !consultorio_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Validar y mapear el estado
    const validEstados = ["PROGRAMADA", "EN_CURSO", "COMPLETADA", "CANCELADA", "NO_ASISTIO"] as const;
    const estadoValido = validEstados.includes(estado as any) ? estado : "PROGRAMADA";
    
    const citaData = {
      id: crypto.randomUUID(),
      paciente_id: String(paciente_id),
      usuario_id: String(usuario_id),
      consultorio_id: String(consultorio_id),
      fecha_inicio: new Date(fecha_inicio),
      fecha_fin: new Date(fecha_fin),
      descripcion: descripcion || null,
      estado: estadoValido as any,
      color: color || "#3B82F6",
    } as any;
    
    const cita = await prisma.citas.create({
      data: citaData,
    });
    res.json(cita);
  } catch (error: any) {
    console.error('Error en createCita:', error);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteCita(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.citas.delete({ where: { id } });
    res.json({ message: 'Cita eliminada' });
  } catch (error: any) {
    res.status(404).json({ error: 'Cita no encontrada' });
  }
}

export async function updateCita(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, descripcion, estado, color } = req.body;
    const cita = await prisma.citas.update({
      where: { id },
      data: {
        ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
        ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
        ...(descripcion && { descripcion }),
        ...(estado && { estado }),
        ...(color && { color }),
      },
    });
    res.json(cita);
  } catch (error: any) {
    res.status(404).json({ error: 'Cita no encontrada' });
  }
} 