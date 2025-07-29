import { useState, useCallback } from 'react'
import {
  getBloqueos,
  crearBloqueo,
  actualizarBloqueo,
  eliminarBloqueo
} from '../services/bloqueoService'

export interface BloqueoMedico {
  id: string
  usuario_id: string
  fecha_inicio: string
  fecha_fin: string
  motivo?: string
}

export function useBloqueosMedico(usuario_id?: string) {
  const [bloqueos, setBloqueos] = useState<BloqueoMedico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBloqueos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getBloqueos(usuario_id)
      setBloqueos(data)
    } catch (err: any) {
      setError(err?.message || 'Error al cargar bloqueos')
    } finally {
      setIsLoading(false)
    }
  }, [usuario_id])

  const create = useCallback(async (input: Omit<BloqueoMedico, 'id'>) => {
    setIsLoading(true)
    setError(null)
    try {
      // Asegura que usuario_id siempre esté presente
      const payload = { ...input, usuario_id: (input.usuario_id || usuario_id) as string }
      await crearBloqueo(payload)
      await fetchBloqueos()
    } catch (err: any) {
      setError(err?.message || 'Error al crear bloqueo')
    } finally {
      setIsLoading(false)
    }
  }, [fetchBloqueos, usuario_id])

  const update = useCallback(async (id: string, input: { fecha_inicio: string; fecha_fin: string; motivo?: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      await actualizarBloqueo(id, input)
      await fetchBloqueos()
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar bloqueo')
    } finally {
      setIsLoading(false)
    }
  }, [fetchBloqueos])

  const remove = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await eliminarBloqueo(id)
      await fetchBloqueos()
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar bloqueo')
    } finally {
      setIsLoading(false)
    }
  }, [fetchBloqueos])

  return {
    bloqueos,
    isLoading,
    error,
    fetchBloqueos,
    create,
    update,
    remove
  }
} 