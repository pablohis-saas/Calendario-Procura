import { Request, Response } from 'express';
import prisma from '../prisma';
import crypto from 'crypto';
import googleCalendarService from '../services/googleCalendarService';

export async function getAllCitas(req: Request, res: Response) {
  try {
    // Obtener organizacion_id del usuario autenticado si está disponible
    const organizacionId = (req as any).tenantFilter?.organizacion_id;
    
    let citas;
    if (organizacionId) {
      // Filtrar por organización usando SQL directo
      citas = await prisma.$queryRaw`
        SELECT c.*, 
               p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.telefono as paciente_telefono, p.email as paciente_email,
               u.nombre as usuario_nombre, u.apellido as usuario_apellido, u.email as usuario_email,
               co.nombre as consultorio_nombre, co.direccion as consultorio_direccion
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN consultorios co ON c.consultorio_id = co.id
        WHERE p.organizacion_id = ${organizacionId}::uuid
        ORDER BY c.fecha_inicio ASC
      ` as any[];
      
      // Agregar las relaciones como objetos anidados para compatibilidad
      for (const cita of citas) {
        cita.pacientes = {
          id: cita.paciente_id,
          nombre: cita.paciente_nombre,
          apellido: cita.paciente_apellido,
          telefono: cita.paciente_telefono,
          email: cita.paciente_email,
          organizacion_id: organizacionId
        };
        cita.usuarios = {
          id: cita.usuario_id,
          nombre: cita.usuario_nombre,
          apellido: cita.usuario_apellido,
          email: cita.usuario_email,
          organizacion_id: organizacionId
        };
        cita.consultorios = {
          id: cita.consultorio_id,
          nombre: cita.consultorio_nombre,
          direccion: cita.consultorio_direccion,
          organizacion_id: organizacionId
        };
      }
    } else {
      // Sin filtro de organización (comportamiento original)
      citas = await prisma.citas.findMany({
        include: {
          pacientes: true,
          usuarios: true,
          consultorios: true,
        },
        orderBy: { fecha_inicio: 'asc' },
      });
    }
    
    res.json(citas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createCita(req: Request, res: Response) {
  try {
    const { fecha_inicio, fecha_fin, descripcion, estado, color, es_recurrente, regla_recurrencia, id_serie, paciente_id, usuario_id, consultorio_id } = req.body;
    let inicio = fecha_inicio ? new Date(fecha_inicio) : undefined
    let fin = fecha_fin ? new Date(fecha_fin) : undefined
    // Validar disponibilidad y bloqueos solo si hay fecha_inicio, fecha_fin y usuario_id
    if (inicio && fin && usuario_id) {
      const diaSemana = inicio.getDay()
      const disponibilidad = await prisma.disponibilidadMedico.findMany({
        where: {
          usuario_id: String(usuario_id),
          dia_semana: diaSemana
        }
      })
      console.log('usuario_id recibido:', usuario_id)
      console.log('Disponibilidades encontradas:', disponibilidad)
      console.log('Validando disponibilidad:')
      console.log('Cita inicio:', inicio, 'fin:', fin)
      disponibilidad.forEach((d: { hora_inicio: string; hora_fin: string }) => {
        const [hIni, mIni] = d.hora_inicio.split(':').map(Number)
        const [hFin, mFin] = d.hora_fin.split(':').map(Number)
        const slotIni = new Date(inicio)
        slotIni.setHours(hIni, mIni, 0, 0)
        const slotFin = new Date(inicio)
        slotFin.setHours(hFin, mFin, 0, 0)
        const dentro = inicio >= slotIni && fin <= slotFin
        console.log(`Bloque: ${d.hora_inicio}-${d.hora_fin} | slotIni:`, slotIni, '| slotFin:', slotFin, '| dentro:', dentro)
      })
      const estaEnDisponibilidad = disponibilidad.some((d: { hora_inicio: string; hora_fin: string }) => {
        const [hIni, mIni] = d.hora_inicio.split(':').map(Number)
        const [hFin, mFin] = d.hora_fin.split(':').map(Number)
        const slotIni = new Date(inicio)
        slotIni.setHours(hIni, mIni, 0, 0)
        const slotFin = new Date(inicio)
        slotFin.setHours(hFin, mFin, 0, 0)
        return inicio >= slotIni && fin <= slotFin
      })
      if (!estaEnDisponibilidad)
        return res.status(400).json({ error: 'La cita está fuera del horario de disponibilidad del médico para ese día.' })
      // Validar bloqueos
      const bloqueo = await prisma.bloqueoMedico.findFirst({
        where: {
          usuario_id: String(usuario_id),
          OR: [
            {
              fecha_inicio: { lte: fin },
              fecha_fin: { gte: inicio }
            }
          ]
        }
      })
      if (bloqueo)
        return res.status(400).json({ error: 'La cita se cruza con un bloqueo del médico.' })
    }
    const estadoValido = estado || 'PROGRAMADA'
    const citaData: any = {
      id: crypto.randomUUID(),
      paciente_id: String(paciente_id),
      usuario_id: String(usuario_id),
      consultorio_id: String(consultorio_id),
      fecha_inicio: inicio,
      fecha_fin: fin,
      descripcion: descripcion || null,
      estado: estadoValido as any,
      color: color || "#3B82F6",
      updated_at: new Date(),
    };
    if (typeof es_recurrente !== 'undefined') citaData.es_recurrente = es_recurrente;
    if (typeof regla_recurrencia !== 'undefined') citaData.regla_recurrencia = regla_recurrencia;
    if (typeof id_serie !== 'undefined') citaData.id_serie = id_serie;
    
    // Crear la cita localmente PRIMERO
    const cita = await prisma.citas.create({
      data: citaData,
    });

    // SOLO DESPUÉS de crear la cita exitosamente, intentar sincronizar con Google Calendar
    try {
      // Verificar si el usuario tiene Google Calendar configurado
      const isConnected = await googleCalendarService.isUserConnected(String(usuario_id))
      
      if (isConnected) {
        // Obtener datos del paciente y usuario para el evento de Google
        const paciente = await prisma.paciente.findUnique({
          where: { id: String(paciente_id) }
        })
        
        const usuario = await prisma.usuario.findUnique({
          where: { id: String(usuario_id) }
        })

        if (paciente && usuario) {
          // Convertir cita a formato de Google Calendar
          const googleEvent = googleCalendarService.convertCitaToGoogleEvent(cita, paciente, usuario)
          
          // Crear evento en Google Calendar
          const googleEventId = await googleCalendarService.createEvent(String(usuario_id), googleEvent)
          
          if (googleEventId) {
            console.log(`Cita sincronizada con Google Calendar: ${googleEventId}`)
            // Opcional: Guardar el ID del evento de Google en la cita local
            // await prisma.citas.update({
            //   where: { id: cita.id },
            //   data: { googleEventId: googleEventId }
            // })
          } else {
            console.log('No se pudo sincronizar la cita con Google Calendar, pero la cita local se creó correctamente')
          }
        }
      } else {
        console.log('Usuario no tiene Google Calendar configurado, cita creada solo localmente')
      }
    } catch (syncError) {
      // Si hay error en la sincronización, NO afectar la respuesta de la cita local
      console.error('Error sincronizando con Google Calendar:', syncError)
      console.log('La cita se creó localmente pero no se pudo sincronizar con Google Calendar')
    }

    res.json(cita);
  } catch (error: any) {
    console.error('Error en createCita:', error);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteCita(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Obtener información de la cita antes de eliminarla
    const cita = await prisma.citas.findUnique({
      where: { id },
      include: {
        usuarios: true,
        pacientes: true
      }
    })

    // Eliminar la cita localmente PRIMERO
    await prisma.citas.delete({ where: { id } });

    // SOLO DESPUÉS de eliminar exitosamente, intentar sincronizar con Google Calendar
    if (cita) {
      try {
        const isConnected = await googleCalendarService.isUserConnected(cita.usuario_id)
        
        if (isConnected && cita.googleEventId) {
          // Eliminar evento de Google Calendar
          const success = await googleCalendarService.deleteEvent(cita.usuario_id, cita.googleEventId)
          
          if (success) {
            console.log(`Evento eliminado de Google Calendar: ${cita.googleEventId}`)
          } else {
            console.log('No se pudo eliminar el evento de Google Calendar, pero la cita local se eliminó correctamente')
          }
        }
      } catch (syncError) {
        console.error('Error eliminando de Google Calendar:', syncError)
        console.log('La cita se eliminó localmente pero no se pudo eliminar de Google Calendar')
      }
    }

    res.json({ message: 'Cita eliminada' });
  } catch (error: any) {
    res.status(404).json({ error: 'Cita no encontrada' });
  }
}

export async function updateCita(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, descripcion, estado, color, es_recurrente, regla_recurrencia, id_serie, usuario_id } = req.body;
    const updateData: any = {};
    let inicio = fecha_inicio ? new Date(fecha_inicio) : undefined
    let fin = fecha_fin ? new Date(fecha_fin) : undefined
    // Validar disponibilidad y bloqueos solo si hay fecha_inicio, fecha_fin y usuario_id
    if (inicio && fin && usuario_id) {
      const diaSemana = inicio.getDay()
      const disponibilidad = await prisma.disponibilidadMedico.findMany({
        where: {
          usuario_id: String(usuario_id),
          dia_semana: diaSemana
        }
      })
      console.log('usuario_id recibido (update):', usuario_id)
      console.log('Disponibilidades encontradas (update):', disponibilidad)
      console.log('Validando disponibilidad (update):')
      console.log('Cita inicio:', inicio, 'fin:', fin)
      disponibilidad.forEach((d: { hora_inicio: string; hora_fin: string }) => {
        const [hIni, mIni] = d.hora_inicio.split(':').map(Number)
        const [hFin, mFin] = d.hora_fin.split(':').map(Number)
        const slotIni = new Date(inicio)
        slotIni.setHours(hIni, mIni, 0, 0)
        const slotFin = new Date(inicio)
        slotFin.setHours(hFin, mFin, 0, 0)
        const dentro = inicio >= slotIni && fin <= slotFin
        console.log(`Bloque: ${d.hora_inicio}-${d.hora_fin} | slotIni:`, slotIni, '| slotFin:', slotFin, '| dentro:', dentro)
      })
      const estaEnDisponibilidad = disponibilidad.some((d: { hora_inicio: string; hora_fin: string }) => {
        const [hIni, mIni] = d.hora_inicio.split(':').map(Number)
        const [hFin, mFin] = d.hora_fin.split(':').map(Number)
        const slotIni = new Date(inicio)
        slotIni.setHours(hIni, mIni, 0, 0)
        const slotFin = new Date(inicio)
        slotFin.setHours(hFin, mFin, 0, 0)
        return inicio >= slotIni && fin <= slotFin
      })
      if (!estaEnDisponibilidad)
        return res.status(400).json({ error: 'La cita está fuera del horario de disponibilidad del médico para ese día.' })
      // Validar bloqueos (excluyendo la cita actual)
      const bloqueo = await prisma.bloqueoMedico.findFirst({
        where: {
          usuario_id: String(usuario_id),
          OR: [
            {
              fecha_inicio: { lte: fin },
              fecha_fin: { gte: inicio }
            }
          ]
        }
      })
      if (bloqueo)
        return res.status(400).json({ error: 'La cita se cruza con un bloqueo del médico.' })
    }
    if (fecha_inicio) updateData.fecha_inicio = inicio;
    if (fecha_fin) updateData.fecha_fin = fin;
    if (descripcion) updateData.descripcion = descripcion;
    if (estado) updateData.estado = estado;
    if (color) updateData.color = color;
    if (typeof es_recurrente !== 'undefined') updateData.es_recurrente = es_recurrente;
    if (typeof regla_recurrencia !== 'undefined') updateData.regla_recurrencia = regla_recurrencia;
    if (typeof id_serie !== 'undefined') updateData.id_serie = id_serie;
    
    // Actualizar la cita localmente PRIMERO
    const cita = await prisma.citas.update({
      where: { id },
      data: updateData,
      include: {
        usuarios: true,
        pacientes: true
      }
    });

    // SOLO DESPUÉS de actualizar exitosamente, intentar sincronizar con Google Calendar
    try {
      const isConnected = await googleCalendarService.isUserConnected(cita.usuario_id)
      
      if (isConnected && cita.googleEventId) {
        // Convertir cita actualizada a formato de Google Calendar
        const googleEvent = googleCalendarService.convertCitaToGoogleEvent(cita, cita.pacientes, cita.usuarios)
        
        // Actualizar evento en Google Calendar
        const success = await googleCalendarService.updateEvent(cita.usuario_id, cita.googleEventId, googleEvent)
        
        if (success) {
          console.log(`Evento actualizado en Google Calendar: ${cita.googleEventId}`)
        } else {
          console.log('No se pudo actualizar el evento en Google Calendar, pero la cita local se actualizó correctamente')
        }
      }
    } catch (syncError) {
      console.error('Error actualizando en Google Calendar:', syncError)
      console.log('La cita se actualizó localmente pero no se pudo actualizar en Google Calendar')
    }

    res.json(cita);
  } catch (error: any) {
    res.status(404).json({ error: 'Cita no encontrada' });
  }
} 