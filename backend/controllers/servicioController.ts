import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllServicios = async (req: Request, res: Response): Promise<void> => {
  try {
    const servicios = await prisma.servicio.findMany();
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
    const servicio = await prisma.servicio.create({ data: { nombre, precio_base: parseFloat(precio_base) } });
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