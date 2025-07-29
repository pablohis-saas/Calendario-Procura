import { Request, Response } from 'express'
import prisma from '../prisma'

export async function getBloqueosMedico(req: Request, res: Response) {
  try {
    const { usuario_id } = req.query
    const where = usuario_id ? { usuario_id: String(usuario_id) } : {}
    const bloqueos = await prisma.bloqueoMedico.findMany({ where })
    res.json(bloqueos)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener bloqueos', details: err })
  }
}

export async function createBloqueoMedico(req: Request, res: Response) {
  try {
    const { usuario_id, fecha_inicio, fecha_fin, motivo } = req.body
    if (!usuario_id || !fecha_inicio || !fecha_fin)
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    if (fecha_inicio >= fecha_fin)
      return res.status(400).json({ error: 'La fecha/hora de inicio debe ser menor que la de fin' })
    const now = roundToMinute(new Date())
    const inicio = roundToMinute(new Date(fecha_inicio))
    console.log('DEBUG bloqueo:', {
      fecha_inicio,
      now: now.toISOString(),
      inicio: inicio.toISOString(),
      diffMs: inicio.getTime() - now.getTime(),
      nowLocal: new Date().toString(),
      inicioLocal: new Date(fecha_inicio).toString()
    })
    if (inicio <= now) {
      return res.status(400).json({ error: 'La fecha de inicio debe ser posterior a la actual' })
    }
    // Parsear fechas a Date para evitar errores de Prisma
    const ini = new Date(fecha_inicio)
    const fin = new Date(fecha_fin)
    // Validar solapamiento
    const overlapping = await prisma.bloqueoMedico.findFirst({
      where: {
        usuario_id,
        OR: [
          {
            fecha_inicio: { lte: fin },
            fecha_fin: { gte: ini }
          }
        ]
      }
    })
    if (overlapping)
      return res.status(400).json({ error: 'Ya existe un bloqueo que se solapa con este periodo' })
    const bloqueo = await prisma.bloqueoMedico.create({
      data: { usuario_id, fecha_inicio: ini, fecha_fin: fin, motivo }
    })
    res.status(201).json(bloqueo)
  } catch (err) {
    console.error('Error en createBloqueoMedico:', err)
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'Error al crear bloqueo', details: err })
    }
  }
}

export async function updateBloqueoMedico(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { fecha_inicio, fecha_fin, motivo } = req.body
    if (fecha_inicio >= fecha_fin)
      return res.status(400).json({ error: 'La fecha/hora de inicio debe ser menor que la de fin' })
    if (new Date(fecha_inicio) < new Date())
      return res.status(400).json({ error: 'No puedes poner bloqueos en el pasado' })
    // Validar solapamiento (excluyendo el propio)
    const existing = await prisma.bloqueoMedico.findFirst({
      where: {
        id: { not: id },
        OR: [
          {
            fecha_inicio: { lte: fecha_fin },
            fecha_fin: { gte: fecha_inicio }
          }
        ]
      }
    })
    if (existing)
      return res.status(400).json({ error: 'Ya existe un bloqueo que se solapa con este periodo' })
    const bloqueo = await prisma.bloqueoMedico.update({
      where: { id },
      data: { fecha_inicio, fecha_fin, motivo }
    })
    res.json(bloqueo)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar bloqueo', details: err })
  }
}

export async function deleteBloqueoMedico(req: Request, res: Response) {
  try {
    const { id } = req.params
    await prisma.bloqueoMedico.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar bloqueo', details: err })
  }
}

function roundToMinute(date: Date): Date {
  date.setSeconds(0, 0)
  return date
} 