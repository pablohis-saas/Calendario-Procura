import type { DashboardResponseDto } from '@/types/inventario-dashboard'
import axios from 'axios'
import '../../services/conceptosService' // Importar para aplicar interceptores

interface DashboardQueryParams {
  sedeId?: string
  from?: string
  to?: string
}

export async function getDashboardMetrics(params: DashboardQueryParams = {}): Promise<DashboardResponseDto> {
  console.log('🔍 getDashboardMetrics called with params:', params)
  
  const searchParams = new URLSearchParams()
  
  if (params.sedeId) searchParams.append('sedeId', params.sedeId)
  if (params.from) searchParams.append('from', params.from)
  if (params.to) searchParams.append('to', params.to)

  const url = `http://localhost:3002/api/dashboard/public?${searchParams.toString()}`
  console.log('🔍 Fetching from URL:', url)
  console.log('🔍 sedeId being sent:', params.sedeId)

  try {
    const response = await axios.get(url)
    console.log('Dashboard data received:', response.data)
    return response.data
  } catch (error) {
    console.error('Error in getDashboardMetrics:', error)
    throw error
  }
} 