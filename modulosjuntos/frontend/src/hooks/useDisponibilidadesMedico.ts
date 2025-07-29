import { useState, useCallback, useEffect } from 'react'
import {
  getDisponibilidades,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad
} from '../services/disponibilidadService'

export interface DisponibilidadMedico {
  id: string
  usuario_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

export function useDisponibilidadesMedico(usuario_id?: string) {
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadMedico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDisponibilidades = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('usuario_id recibido en hook:', usuario_id)
      const data = await getDisponibilidades(usuario_id)
      setDisponibilidades(data)
    } catch (err: any) {
      setError(err?.message || 'Error al cargar disponibilidades')
      console.error('Error en fetchDisponibilidades:', err)
    } finally {
      setIsLoading(false)
    }
  }, [usuario_id])

  const create = useCallback(async (input: Omit<DisponibilidadMedico, 'id'>) => {
    setIsLoading(true)
    setError(null)
    try {
      await crearDisponibilidad(input)
      await fetchDisponibilidades()
    } catch (err: any) {
      setError(err?.message || 'Error al crear disponibilidad')
    } finally {
      setIsLoading(false)
    }
  }, [fetchDisponibilidades])

  const update = useCallback(async (id: string, input: { dia_semana: number; hora_inicio: string; hora_fin: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      await actualizarDisponibilidad(id, input)
      await fetchDisponibilidades()
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar disponibilidad')
    } finally {
      setIsLoading(false)
    }
  }, [fetchDisponibilidades])

  const remove = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await eliminarDisponibilidad(id)
      await fetchDisponibilidades()
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar disponibilidad')
    } finally {
      setIsLoading(false)
    }
  }, [fetchDisponibilidades])

  useEffect(() => {
    if (usuario_id) fetchDisponibilidades()
  }, [usuario_id, fetchDisponibilidades])

  return {
    disponibilidades,
    isLoading,
    error,
    fetchDisponibilidades,
    create,
    update,
    remove
  }
} 