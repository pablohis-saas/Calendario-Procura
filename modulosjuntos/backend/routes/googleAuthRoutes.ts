import express, { Request, Response } from 'express'
import axios from 'axios'
import prisma from '../prisma'
import crypto from 'crypto'

const router = express.Router()

// Middleware para requerir autenticación JWT o Multi-tenant
function requireAuth(req: Request, res: Response, next: Function) {
  if (!(req as any).user || !(req as any).user.id) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  next()
}

// Generar state seguro para CSRF protection
function generateSecureState(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Endpoint para iniciar el flujo OAuth2 (temporalmente sin auth para testing)
router.post('/google/oauth-init', async (req: Request, res: Response) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    if (!clientId || !redirectUri) {
      return res.status(500).json({ 
        error: 'Configuración de Google OAuth incompleta' 
      })
    }

    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events')
    const state = generateSecureState()
    // Temporalmente usar el primer usuario para testing
    const usuario = await prisma.usuario.findFirst()
    const userId = usuario?.id

    if (!userId) {
      return res.status(500).json({ error: 'No se encontró usuario para OAuth' })
    }

    // Guardar el state temporalmente (en producción usar Redis o similar)
    // Por ahora lo guardamos en la sesión del usuario
    ;(req as any).session = (req as any).session || {}
    ;(req as any).session.oauthState = state
    ;(req as any).session.oauthUserId = userId
    console.log('OAuth init - Session saved:', {
      oauthState: (req as any).session.oauthState,
      oauthUserId: (req as any).session.oauthUserId
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `response_type=code&` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${state}`

    // Devolver la URL de autorización en lugar de redirigir
    res.json({ authUrl })
  } catch (error) {
    console.error('Error iniciando OAuth:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Endpoint para recibir el callback y guardar tokens
router.get('/google/oauth-callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query

    // Verificar si hay error de Google
    if (error) {
      console.error('Error de Google OAuth:', error)
      return res.redirect('/sincronizacion-error?error=google_denied')
    }

    // Validar parámetros requeridos
    if (!code || !state) {
      return res.redirect('/sincronizacion-error?error=missing_params')
    }

    // Verificar state para CSRF protection
    console.log('Session data:', (req as any).session)
    console.log('Received state:', state)
    const sessionState = (req as any).session?.oauthState
    console.log('Session state:', sessionState)
    if (!sessionState || state !== sessionState) {
      console.error('State mismatch - posible CSRF attack')
      return res.redirect('/sincronizacion-error?error=invalid_state')
    }

    // Obtener tokens de Google
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded' 
      }
    })

    console.log('Google Token Response Data:', tokenResponse.data)

    const { 
      access_token, 
      refresh_token, 
      expires_in, 
      token_type 
    } = tokenResponse.data

    if (!access_token) {
      console.error('No se recibió access_token de Google')
      return res.redirect('/sincronizacion-error?error=no_token')
    }

    console.log('Using access_token:', access_token.substring(0, 50) + '...')

    // No necesitamos obtener información del usuario, solo guardar los tokens
    console.log('Tokens obtenidos exitosamente de Google')

    // Guardar tokens en la base de datos
    console.log('Session userId:', (req as any).session?.oauthUserId)
    const userId = (req as any).session?.oauthUserId
    if (!userId) {
      console.error('No se encontró userId en sesión')
      return res.redirect('/sincronizacion-error?error=no_user')
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        googleAccessToken: access_token,
        googleRefreshToken: refresh_token || null,
        googleTokenExpiry: new Date(Date.now() + (expires_in * 1000)),
        googleCalendarId: 'primary' // Por defecto usar el calendario principal
      }
    })

    // Limpiar datos temporales de sesión
    delete (req as any).session.oauthState
    delete (req as any).session.oauthUserId

    console.log(`Tokens de Google guardados para usuario ${userId}`)
    res.redirect('/sincronizacion-exitosa')

  } catch (error) {
    console.error('Error en callback OAuth:', error)
    
    if (axios.isAxiosError(error)) {
      console.error('Error de Google API:', error.response?.data)
    }
    
    res.redirect('/sincronizacion-error?error=server_error')
  }
})

  // Endpoint para verificar estado de sincronización
router.get('/google/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
        googleCalendarId: true
      }
    })

    if (!usuario?.googleAccessToken) {
      return res.json({ 
        connected: false, 
        message: 'No conectado a Google Calendar' 
      })
    }

    // Verificar si el token ha expirado
    const isExpired = usuario.googleTokenExpiry && 
                     new Date() > usuario.googleTokenExpiry

    return res.json({
      connected: true,
      hasRefreshToken: !!usuario.googleRefreshToken,
      isExpired,
      calendarId: usuario.googleCalendarId
    })

  } catch (error) {
    console.error('Error verificando estado:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Endpoint para desconectar Google Calendar
router.post('/google/disconnect', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        googleCalendarId: null
      }
    })

    res.json({ 
      success: true, 
      message: 'Desconectado de Google Calendar' 
    })

  } catch (error) {
    console.error('Error desconectando Google Calendar:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router 