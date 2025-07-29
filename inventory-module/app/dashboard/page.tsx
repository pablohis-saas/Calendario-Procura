import { Suspense } from 'react'
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter'
import { InventoryMetricsWithModal } from '@/components/dashboard/InventoryMetricsWithModal'
import { InventoryTables } from '@/components/dashboard/InventoryTables'
import { ImmobilizedInventoryCard } from '@/components/dashboard/ImmobilizedInventoryCard'
import { getDashboardMetrics } from '@/lib/api/dashboard-service'
import type { DashboardPageProps } from '@/types/dashboard'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const sedeId = searchParams.sedeId
  const from = searchParams.from
  const to = searchParams.to
  
  try {
    const data = await getDashboardMetrics({
      sedeId: sedeId || 'sede-tecamachalco',
      from,
      to,
    })

    return (
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Header con título y filtros */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Inventario</h1>
          <p className="text-gray-600 mb-6">Métricas y análisis del inventario médico</p>

          {/* Filtro de fechas */}
          <DateRangeFilter 
            initialFrom={from} 
            initialTo={to} 
            sedeId={sedeId}
          />
        </div>

        {/* Métricas principales: cards separadas y coloridas */}
        <DashboardMetrics
          totalInventoryValue={data.totalInventoryValue}
          totalUsedInventoryCost={data.totalUsedInventoryCost}
          totalEnteredInventoryCost={data.totalEnteredInventoryCost}
          lowStockAlerts={data.lowStockAlerts}
          expirationAlerts={data.expirationAlerts}
        />
        
        <div className="h-8" />
        
        {/* Métricas por categoría */}
        <InventoryMetricsWithModal 
          inventoryByCategory={data.inventoryByCategory}
          totalProductsByCategory={data.totalProductsByCategory || data.inventoryByCategory}
          inventory={data.inventory}
          lowStockAlerts={data.lowStockAlerts}
        />
        
        <div className="h-8" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sección principal */}
          <section className="lg:col-span-8 flex flex-col gap-8">
            {/* Tablas y listas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
              {/* Productos más usados */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#1b2538] mb-4">Productos Más Usados</h2>
                <div className="divide-y divide-gray-100">
                  {data.mostUsedProducts.slice(0, 5).map((product, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div>
                        <span className="font-medium text-gray-900">{product.productName}</span>
                        <span className="ml-2 text-xs text-gray-500">Salidas: {product.totalExits} | Usos: {product.totalUsage}</span>
                      </div>
                      <div className="flex gap-2">
                        {product.totalExits > 0 && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{product.totalExits} salidas</span>}
                        {product.totalUsage > 0 && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{product.totalUsage} usos</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Movimientos recientes */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#1b2538] mb-4">Movimientos Recientes</h2>
                <div className="divide-y divide-gray-100">
                  {data.recentMovements.slice(0, 5).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between py-3">
                      <div>
                        <span className="font-medium text-gray-900">{movement.productName}</span>
                        <span className="ml-2 text-xs text-gray-500">{new Date(movement.createdAt).toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{movement.quantity}</span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${movement.type === 'ENTRY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {movement.type === 'ENTRY' ? 'Entrada' : 'Salida'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Productos por caducar */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1b2538] mb-4">Productos por Caducar</h2>
              <div className="divide-y divide-gray-100">
                {data.expirationAlerts.length === 0 ? (
                  <div className="py-4 text-gray-500 text-center">No hay productos próximos a caducar</div>
                ) : (
                  data.expirationAlerts.slice(0, 10).map((product, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div>
                        <span className="font-medium text-gray-900">{product.productName}</span>
                        <span className="ml-2 text-xs text-gray-500">Lote: {product.batchNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{product.quantity} unidades</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          Caduca: {new Date(product.expiryDate).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
          </div>
          </section>
          
          {/* Inventario inmovilizado y alertas */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-[#1b2538] mb-4">Inventario Inmovilizado</h2>
              <div className="divide-y divide-gray-100">
                {data.immobilizedInventory.length === 0 ? (
                  <div className="py-4 text-gray-500 text-center">No hay inventario inmovilizado</div>
                ) : (
                  data.immobilizedInventory.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div>
                        <span className="font-medium text-gray-900">{item.productName}</span>
                        <span className="ml-2 text-xs text-gray-500">{item.quantity} unidades</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.daysWithoutMovement} días sin movimiento</span>
                    </div>
                  ))
                )}
              </div>
          </div>
          </aside>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-600">No se pudieron cargar los datos del inventario</p>
        </div>
      </div>
    )
  }
}

export default function DashboardPage(props: DashboardPageProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent {...props} />
    </Suspense>
  )
} 