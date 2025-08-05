import { useState, useCallback, useEffect } from 'react'
import { getCobros, crearCobro, editarCobro, eliminarCobro } from '../services/cobrosService'
import { notifyChange, listenForChanges } from '../lib/sync-utils'

export interface Cobro {
  id: string
  paciente_id: string
  fecha_cobro: string
  total: number
  estado: string
  created_at: string
  updated_at: string
  paciente_nombre?: string
  paciente_apellido?: string
  usuario_nombre?: string
  usuario_apellido?: string
  consultorio_nombre?: string
}

export function useCobros() {
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  const fetchCobros = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔄 Fetching cobros...')
      const data = await getCobros()
      setCobros(data)
      setLastUpdate(Date.now())
      console.log('✅ Cobros actualizados:', data.length, 'registros')
    } catch (err: any) {
      setError(err?.message || 'Error al cargar cobros')
      console.error('❌ Error en fetchCobros:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async (cobroData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔄 Creando cobro:', cobroData)
      const result = await crearCobro(cobroData)
      await fetchCobros()
      // Notificar a otros componentes sobre el cambio
      notifyChange('COBROS')
      console.log('✅ Cobro creado exitosamente')
      return result
    } catch (err: any) {
      setError(err?.message || 'Error al crear cobro')
      console.error('❌ Error al crear cobro:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchCobros])

  const update = useCallback(async (id: string, cobroData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔄 Actualizando cobro:', id, cobroData)
      await editarCobro(id, cobroData)
      await fetchCobros()
      // Notificar a otros componentes sobre el cambio
      notifyChange('COBROS')
      console.log('✅ Cobro actualizado exitosamente')
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar cobro')
      console.error('❌ Error al actualizar cobro:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchCobros])

  const remove = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔄 Eliminando cobro:', id)
      await eliminarCobro(id)
      await fetchCobros()
      // Notificar a otros componentes sobre el cambio
      notifyChange('COBROS')
      console.log('✅ Cobro eliminado exitosamente')
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar cobro')
      console.error('❌ Error al eliminar cobro:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchCobros])

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🔄 Hook: Inicializando cobros...')
    fetchCobros()
  }, [fetchCobros])

  // Escuchar cambios para sincronización automática
  useEffect(() => {
    return listenForChanges('COBROS', fetchCobros)
  }, [fetchCobros])



  return {
    cobros,
    isLoading,
    error,
    fetchCobros,
    create,
    update,
    remove,
    lastUpdate
  }
} 