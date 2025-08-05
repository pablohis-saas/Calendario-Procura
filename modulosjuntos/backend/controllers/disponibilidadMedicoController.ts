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
    
    // Validar duplicados solo si hay solapamiento completo de horarios
    const existing = await prisma.disponibilidadMedico.findFirst({
      where: {
        usuario_id,
        dia_semana,
        // Solo considerar duplicado si hay solapamiento completo de horarios
        AND: [
          { hora_inicio: { lte: hora_inicio } },
          { hora_fin: { gte: hora_fin } }
        ]
      }
    })
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Ya existe una disponibilidad que cubre completamente este horario para este médico' 
      })
    }
    
    const disponibilidad = await prisma.disponibilidadMedico.create({
      data: { usuario_id, dia_semana, hora_inicio, hora_fin }
    })
    
    console.log(`✅ Disponibilidad creada: ${usuario_id} - Día ${dia_semana} - ${hora_inicio} a ${hora_fin}`)
    res.status(201).json(disponibilidad)
  } catch (err) {
    console.error('❌ Error al crear disponibilidad:', err)
    res.status(500).json({ error: 'Error al crear disponibilidad', details: err })
  }
}

export async function updateDisponibilidadMedico(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { dia_semana, hora_inicio, hora_fin } = req.body
    
    // Primero obtener la disponibilidad actual para obtener el usuario_id
    const disponibilidadActual = await prisma.disponibilidadMedico.findUnique({
      where: { id }
    })
    
    if (!disponibilidadActual) {
      return res.status(404).json({ error: 'Disponibilidad no encontrada' })
    }
    
    if (hora_inicio >= hora_fin)
      return res.status(400).json({ error: 'La hora de inicio debe ser menor que la de fin' })
    
    // Validar duplicados solo si hay solapamiento de horarios (más permisivo)
    const existing = await prisma.disponibilidadMedico.findFirst({
      where: {
        id: { not: id },
        usuario_id: disponibilidadActual.usuario_id,
        dia_semana,
        // Solo considerar duplicado si hay solapamiento completo de horarios
        AND: [
          { hora_inicio: { lte: hora_inicio } },
          { hora_fin: { gte: hora_fin } }
        ]
      }
    })
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Ya existe una disponibilidad que cubre completamente este horario para este médico' 
      })
    }
    
    const disponibilidad = await prisma.disponibilidadMedico.update({
      where: { id },
      data: { dia_semana, hora_inicio, hora_fin }
    })
    
    console.log(`✅ Disponibilidad actualizada: ${disponibilidadActual.usuario_id} - Día ${dia_semana} - ${hora_inicio} a ${hora_fin}`)
    res.json(disponibilidad)
  } catch (err) {
    console.error('❌ Error al actualizar disponibilidad:', err)
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