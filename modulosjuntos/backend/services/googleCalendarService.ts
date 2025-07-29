import axios from 'axios'
import prisma from '../prisma'

interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
}

interface RefreshTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

class GoogleCalendarService {
  private async refreshTokenIfNeeded(userId: string): Promise<string | null> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          googleAccessToken: true,
          googleRefreshToken: true,
          googleTokenExpiry: true
        }
      })

      if (!usuario?.googleAccessToken) {
        console.log(`Usuario ${userId} no tiene tokens de Google`)
        return null
      }

      // Verificar si el token ha expirado
      const isExpired = usuario.googleTokenExpiry && 
                       new Date() > usuario.googleTokenExpiry

      if (isExpired && usuario.googleRefreshToken) {
        console.log(`Refrescando token para usuario ${userId}`)
        
        const response = await axios.post<RefreshTokenResponse>(
          'https://oauth2.googleapis.com/token',
          null,
          {
            params: {
              client_id: process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              refresh_token: usuario.googleRefreshToken,
              grant_type: 'refresh_token'
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )

        const { access_token, expires_in } = response.data

        // Actualizar el token en la base de datos
        await prisma.usuario.update({
          where: { id: userId },
          data: {
            googleAccessToken: access_token,
            googleTokenExpiry: new Date(Date.now() + (expires_in * 1000))
          }
        })

        console.log(`Token refrescado para usuario ${userId}`)
        return access_token
      }

      return usuario.googleAccessToken
    } catch (error) {
      console.error(`Error refrescando token para usuario ${userId}:`, error)
      return null
    }
  }

  async createEvent(userId: string, eventData: GoogleCalendarEvent): Promise<string | null> {
    try {
      const accessToken = await this.refreshTokenIfNeeded(userId)
      if (!accessToken) {
        console.log(`No se pudo obtener token válido para usuario ${userId}`)
        return null
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { googleCalendarId: true }
      })

      const calendarId = usuario?.googleCalendarId || 'primary'

      const response = await axios.post(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        eventData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log(`Evento creado en Google Calendar para usuario ${userId}: ${response.data.id}`)
      return response.data.id
    } catch (error) {
      console.error(`Error creando evento en Google Calendar para usuario ${userId}:`, error)
      if (axios.isAxiosError(error)) {
        console.error('Error de Google API:', error.response?.data)
      }
      return null
    }
  }

  async updateEvent(userId: string, googleEventId: string, eventData: GoogleCalendarEvent): Promise<boolean> {
    try {
      const accessToken = await this.refreshTokenIfNeeded(userId)
      if (!accessToken) {
        console.log(`No se pudo obtener token válido para usuario ${userId}`)
        return false
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { googleCalendarId: true }
      })

      const calendarId = usuario?.googleCalendarId || 'primary'

      await axios.put(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${googleEventId}`,
        eventData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log(`Evento actualizado en Google Calendar para usuario ${userId}: ${googleEventId}`)
      return true
    } catch (error) {
      console.error(`Error actualizando evento en Google Calendar para usuario ${userId}:`, error)
      if (axios.isAxiosError(error)) {
        console.error('Error de Google API:', error.response?.data)
      }
      return false
    }
  }

  async deleteEvent(userId: string, googleEventId: string): Promise<boolean> {
    try {
      const accessToken = await this.refreshTokenIfNeeded(userId)
      if (!accessToken) {
        console.log(`No se pudo obtener token válido para usuario ${userId}`)
        return false
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { googleCalendarId: true }
      })

      const calendarId = usuario?.googleCalendarId || 'primary'

      await axios.delete(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${googleEventId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      console.log(`Evento eliminado de Google Calendar para usuario ${userId}: ${googleEventId}`)
      return true
    } catch (error) {
      console.error(`Error eliminando evento de Google Calendar para usuario ${userId}:`, error)
      if (axios.isAxiosError(error)) {
        console.error('Error de Google API:', error.response?.data)
      }
      return false
    }
  }

  // Convertir cita local a formato de Google Calendar
  convertCitaToGoogleEvent(cita: any, paciente: any, usuario: any): GoogleCalendarEvent {
    const startTime = new Date(cita.fecha_inicio)
    const endTime = new Date(cita.fecha_fin)
    
    return {
      summary: `Cita: ${paciente.nombre} ${paciente.apellido}`,
      description: cita.descripcion || `Cita con ${usuario.nombre} ${usuario.apellido}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Mexico_City' // Ajustar según tu zona horaria
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Mexico_City'
      },
      attendees: [
        {
          email: paciente.email,
          displayName: `${paciente.nombre} ${paciente.apellido}`
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'popup',
            minutes: 15
          },
          {
            method: 'email',
            minutes: 60
          }
        ]
      }
    }
  }

  // Verificar si un usuario tiene Google Calendar configurado
  async isUserConnected(userId: string): Promise<boolean> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          googleAccessToken: true,
          googleTokenExpiry: true
        }
      })

      if (!usuario?.googleAccessToken) {
        return false
      }

      // Verificar si el token ha expirado
      const isExpired = usuario.googleTokenExpiry && 
                       new Date() > usuario.googleTokenExpiry

      return !isExpired
    } catch (error) {
      console.error(`Error verificando conexión de usuario ${userId}:`, error)
      return false
    }
  }
}

export default new GoogleCalendarService() 