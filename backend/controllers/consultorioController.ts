import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';

const prisma = new PrismaClient();

export const getAllConsultorios = asyncHandler(async (req: Request, res: Response) => {
  const consultorios = await prisma.consultorio.findMany();
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
  const consultorio = await prisma.consultorio.create({
    data: { nombre, direccion },
  });
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