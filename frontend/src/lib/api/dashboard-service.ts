import type { DashboardResponseDto } from '@/types/dashboard'

interface DashboardQueryParams {
  sedeId?: string
  from?: string
  to?: string
}

export async function getDashboardMetrics(params: DashboardQueryParams = {}): Promise<DashboardResponseDto> {
  console.log('getDashboardMetrics called with params:', params)
  
  const searchParams = new URLSearchParams()
  
  if (params.sedeId) searchParams.append('sedeId', params.sedeId)
  if (params.from) searchParams.append('from', params.from)
  if (params.to) searchParams.append('to', params.to)

  const url = `http://localhost:3000/api/dashboard/public?${searchParams.toString()}`
  console.log('Fetching from URL:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error fetching dashboard metrics: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Dashboard data received:', data)
    return data
  } catch (error) {
    console.error('Error in getDashboardMetrics:', error)
    throw error
  }
} 