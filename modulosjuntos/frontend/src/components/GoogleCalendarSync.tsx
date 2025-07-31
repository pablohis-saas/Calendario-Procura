import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import axios from 'axios'

interface GoogleCalendarStatus {
  connected: boolean
  hasRefreshToken: boolean
  isExpired: boolean
  calendarId: string
  message?: string
}

function GoogleCalendarSync() {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Verificar estado de conexión
  const checkConnectionStatus = async () => {
    try {
      // Temporalmente sin autenticación para testing
      const response = await axios.get('/api/google/status')

      setStatus(response.data)
    } catch (error) {
      console.error('Error verificando estado:', error)
    }
  }

  // Iniciar flujo de autorización
  const connectGoogleCalendar = async () => {
    setIsConnecting(true)
    try {
      // Temporalmente sin autenticación para testing
      const response = await axios.post('/api/google/oauth-init')

      if (response.data.authUrl) {
        // Redirigir a Google OAuth
        window.location.href = response.data.authUrl
      } else {
        alert('Error: No se recibió URL de autorización')
      }
    } catch (error) {
      console.error('Error conectando Google Calendar:', error)
      alert('Error al conectar con Google Calendar')
    } finally {
      setIsConnecting(false)
    }
  }

  // Desconectar Google Calendar
  const disconnectGoogleCalendar = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await axios.post('/api/google/disconnect')

      setStatus({
        connected: false,
        hasRefreshToken: false,
        isExpired: false,
        calendarId: ''
      })
      alert('Desconectado de Google Calendar')
    } catch (error) {
      console.error('Error desconectando:', error)
      alert('Error al desconectar')
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar si estamos en la página de callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    
    if (error) {
      let errorMessage = 'Error desconocido'
      switch (error) {
        case 'google_denied':
          errorMessage = 'Acceso denegado por Google'
          break
        case 'missing_params':
          errorMessage = 'Parámetros faltantes'
          break
        case 'invalid_state':
          errorMessage = 'Error de seguridad'
          break
        case 'no_token':
          errorMessage = 'No se recibió token de Google'
          break
        case 'no_user':
          errorMessage = 'Usuario no encontrado'
          break
        case 'server_error':
          errorMessage = 'Error del servidor'
          break
      }
      alert(`Error de sincronización: ${errorMessage}`)
    }

    // Limpiar URL después de mostrar error
    if (error) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Verificar estado al cargar
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const getStatusIcon = () => {
    if (!status?.connected) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (status.isExpired) {
      return <RefreshCw className="h-5 w-5 text-yellow-500" />
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  const getStatusText = () => {
    if (!status?.connected) {
      return 'No conectado'
    }
    if (status.isExpired) {
      return 'Token expirado'
    }
    return 'Conectado'
  }

  const getStatusColor = () => {
    if (!status?.connected) {
      return 'bg-red-100 text-red-800'
    }
    if (status.isExpired) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-green-100 text-green-800'
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar
        </CardTitle>
        <CardDescription>
          Sincroniza tus citas con Google Calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Estado:</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Información adicional */}
        {status?.connected && (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Calendario:</span>
              <span className="font-medium">{status.calendarId}</span>
            </div>
            <div className="flex justify-between">
              <span>Refresh Token:</span>
              <span className={status.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>
                {status.hasRefreshToken ? 'Disponible' : 'No disponible'}
              </span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          {!status?.connected ? (
            <Button 
              onClick={connectGoogleCalendar}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Conectar
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={checkConnectionStatus}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button 
                onClick={disconnectGoogleCalendar}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            </>
          )}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Las citas se sincronizarán automáticamente</p>
          <p>• Los cambios se reflejarán en ambos lugares</p>
          <p>• Puedes desconectar en cualquier momento</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default GoogleCalendarSync 