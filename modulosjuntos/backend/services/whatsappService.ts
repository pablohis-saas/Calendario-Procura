import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from 'axios'

const prisma = new PrismaClient()

// Configuración de WhatsApp Business API
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

interface AppointmentReminderData {
  citaId: string
  pacienteId: string
  usuarioId: string
  fecha: Date
  hora: string
  doctorNombre: string
  consultorioNombre: string
  pacienteTelefono: string
  pacienteNombre: string
}

interface WhatsAppResponse {
  success: boolean
  messageId?: string
  error?: string
}

export class WhatsAppService {

  /**
   * Envía recordatorio de cita con botones de confirmación/cancelación
   */
  static async sendAppointmentReminder(data: AppointmentReminderData): Promise<WhatsAppResponse> {
    try {
      const fecha = format(data.fecha, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })

      // Verificar si WhatsApp está configurado
      if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        throw new Error('WhatsApp Business API no configurado')
      }

      // Crear mensaje con botones interactivos
      const messageBody = `Hola ${data.pacienteNombre}, tienes cita el ${fecha} con Dr. ${data.doctorNombre} en ${data.consultorioNombre}.

¿Confirmas tu asistencia?

ID de cita: ${data.citaId}`

      // Enviar mensaje usando WhatsApp Business API
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: data.pacienteTelefono,
          type: 'text',
          text: {
            body: messageBody
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const messageId = response.data.messages?.[0]?.id

      // Guardar en base de datos
      await prisma.whatsAppMessage.create({
        data: {
          usuario_id: data.usuarioId,
          paciente_id: data.pacienteId,
          cita_id: data.citaId,
          message_type: 'TEMPLATE',
          content: {
            body: messageBody,
            appointmentId: data.citaId,
            buttons: ['confirmar', 'cancelar', 'reagendar']
          },
          phone_number: data.pacienteTelefono,
          status: 'SENT',
          whatsapp_message_id: messageId,
          sent_at: new Date()
        }
      })

      return {
        success: true,
        messageId: messageId
      }

    } catch (error) {
      console.error('Error enviando recordatorio WhatsApp:', error)

      // Guardar error en base de datos
      await prisma.whatsAppMessage.create({
        data: {
          usuario_id: data.usuarioId,
          paciente_id: data.pacienteId,
          cita_id: data.citaId,
          message_type: 'TEMPLATE',
          content: {
            body: 'Error al enviar mensaje',
            appointmentId: data.citaId
          },
          phone_number: data.pacienteTelefono,
          status: 'FAILED',
          error_message: error instanceof Error ? error.message : 'Error desconocido',
          sent_at: new Date()
        }
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Procesa respuesta del paciente (confirmar/cancelar)
   */
  static async processPatientResponse(
    phoneNumber: string,
    response: string,
    appointmentId: string
  ): Promise<WhatsAppResponse> {
    try {
      const cita = await prisma.citas.findUnique({
        where: { id: appointmentId },
        include: {
          pacientes: true,
          usuarios: true,
          consultorios: true
        }
      })

      if (!cita) {
        return {
          success: false,
          error: 'Cita no encontrada'
        }
      }

      const responseLower = response.toLowerCase()
      let newStatus: string
      let confirmationMessage: string

      if (responseLower.includes('confirmar') || responseLower.includes('si') || responseLower.includes('ok')) {
        newStatus = 'CONFIRMADA'
        confirmationMessage = `✅ Confirmado! Tu cita está confirmada para el ${format(cita.fecha_inicio, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}. Te esperamos!`
      } else if (responseLower.includes('cancelar') || responseLower.includes('no')) {
        newStatus = 'CANCELADA'
        confirmationMessage = `❌ Entendido, tu cita ha sido cancelada. Si necesitas reagendar, contáctanos.`
      } else {
        return {
          success: false,
          error: 'Respuesta no reconocida'
        }
      }

      // Actualizar estado de la cita
      await prisma.citas.update({
        where: { id: appointmentId },
        data: { estado: newStatus as any }
      })

      // Verificar si WhatsApp está configurado
      if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        throw new Error('WhatsApp Business API no configurado')
      }

      // Enviar confirmación al paciente
      await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: confirmationMessage
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Notificar al consultorio
      await this.notifyConsultorio(cita, newStatus)

      return {
        success: true
      }

    } catch (error) {
      console.error('Error procesando respuesta del paciente:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Notifica al consultorio sobre confirmación/cancelación
   */
  private static async notifyConsultorio(cita: any, status: string): Promise<void> {
    try {
      const statusText = status === 'CONFIRMADA' ? '✅ CONFIRMADA' : '❌ CANCELADA'
      const message = `Cita ${statusText}

Paciente: ${cita.pacientes.nombre} ${cita.pacientes.apellido}
Fecha: ${format(cita.fecha_inicio, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
Doctor: ${cita.usuarios.nombre} ${cita.usuarios.apellido}
Consultorio: ${cita.consultorios.nombre}`

      // Aquí podrías enviar notificación al consultorio
      // Por ahora solo lo guardamos en logs
      console.log('Notificación al consultorio:', message)

    } catch (error) {
      console.error('Error notificando al consultorio:', error)
    }
  }

  /**
   * Envía recordatorio para tratamientos semanales
   */
  static async sendWeeklyTreatmentReminder(
    pacienteId: string,
    treatmentType: string,
    usuarioId: string
  ): Promise<WhatsAppResponse> {
    try {
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      })

      if (!paciente?.telefono) {
        return {
          success: false,
          error: 'Paciente sin teléfono'
        }
      }

      // Verificar si WhatsApp está configurado
      if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        throw new Error('WhatsApp Business API no configurado')
      }

      const messageBody = `Hola ${paciente.nombre}, es momento de tu próxima ${treatmentType}.

Haz clic aquí para agendar tu cita: https://procura.com/agendar/${pacienteId}/${treatmentType}

O responde "AGENDAR" para que te contactemos.`

      const response = await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: paciente.telefono,
          type: 'text',
          text: {
            body: messageBody
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id
      }

    } catch (error) {
      console.error('Error enviando recordatorio de tratamiento:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
} 