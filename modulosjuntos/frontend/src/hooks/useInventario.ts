import { useState, useCallback, useEffect } from 'react'
import { getDashboardMetrics } from '../lib/api/dashboard-service'
import type { DashboardResponseDto } from '../types/inventario-dashboard'
import { notifyChange, listenForChanges } from '../lib/sync-utils'

export function useInventario(sedeId?: string) {
  const [data, setData] = useState<DashboardResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  const fetchInventario = useCallback(async () => {
    if (!sedeId) return
    
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔄 Fetching inventario for sede:', sedeId)
      const response = await getDashboardMetrics({ sedeId })
      setData(response)
      setLastUpdate(Date.now())
      console.log('✅ Inventario actualizado:', response?.inventory?.length || 0, 'productos')
    } catch (err: any) {
      setError(err?.message || 'Error al cargar inventario')
      console.error('❌ Error en fetchInventario:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sedeId])

  const refreshInventario = useCallback(async () => {
    await fetchInventario()
    // Notificar a otros componentes sobre el cambio
    notifyChange('INVENTARIO')
    console.log('✅ Inventario refrescado manualmente')
  }, [fetchInventario])

  // Cargar datos iniciales
  useEffect(() => {
    if (sedeId) {
      console.log('🔄 Hook: Inicializando inventario para sede:', sedeId)
      fetchInventario()
    }
  }, [sedeId, fetchInventario])

  // Escuchar cambios para sincronización automática
  useEffect(() => {
    if (!sedeId) return
    return listenForChanges('INVENTARIO', fetchInventario)
  }, [sedeId, fetchInventario])



  return {
    data,
    isLoading,
    error,
    fetchInventario,
    refreshInventario,
    lastUpdate
  }
} 