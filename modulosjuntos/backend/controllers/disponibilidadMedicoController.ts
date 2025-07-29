import { Request, Response } from 'express'
import prisma from '../prisma'

export async function getDisponibilidadesMedico(req: Request, res: Response) {
  try {
    const { usuario_id } = req.query
    const where = usuario_id ? { usuario_id: String(usuario_id) } : {}
    const disponibilidades = await prisma.disponibilidadMedico.findMany({ where })
    res.json(disponibilidades)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener disponibilidades', details: err })
  }
}

export async function createDisponibilidadMedico(req: Request, res: Response) {
  try {
    const { usuario_id, dia_semana, hora_inicio, hora_fin } = req.body
    if (!usuario_id || dia_semana === undefined || !hora_inicio || !hora_fin)
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    if (hora_inicio >= hora_fin)
      return res.status(400).json({ error: 'La hora de inicio debe ser menor que la de fin' })
    // Validar duplicados
    const existing = await prisma.disponibilidadMedico.findFirst({
      where: {
        usuario_id,
        dia_semana,
        hora_inicio,
        hora_fin
      }
    })
    if (existing)
      return res.status(400).json({ error: 'Ya existe una disponibilidad con ese día y horario para este médico' })
    const disponibilidad = await prisma.disponibilidadMedico.create({
      data: { usuario_id, dia_semana, hora_inicio, hora_fin }
    })
    res.status(201).json(disponibilidad)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear disponibilidad', details: err })
  }
}

export async function updateDisponibilidadMedico(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { dia_semana, hora_inicio, hora_fin } = req.body
    if (hora_inicio >= hora_fin)
      return res.status(400).json({ error: 'La hora de inicio debe ser menor que la de fin' })
    // Validar duplicados (excluyendo el propio)
    const existing = await prisma.disponibilidadMedico.findFirst({
      where: {
        id: { not: id },
        dia_semana,
        hora_inicio,
        hora_fin
      }
    })
    if (existing)
      return res.status(400).json({ error: 'Ya existe una disponibilidad con ese día y horario para este médico' })
    const disponibilidad = await prisma.disponibilidadMedico.update({
      where: { id },
      data: { dia_semana, hora_inicio, hora_fin }
    })
    res.json(disponibilidad)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar disponibilidad', details: err })
  }
}

export async function deleteDisponibilidadMedico(req: Request, res: Response) {
  try {
    const { id } = req.params
    await prisma.disponibilidadMedico.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar disponibilidad', details: err })
  }
} 