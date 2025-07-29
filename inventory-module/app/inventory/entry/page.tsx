'use client'

import InventoryEntryForm from '@/components/inventory-entry/InventoryEntryForm'
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface EntryByCategory {
  category: string
  totalQuantity: number
  totalValue: number
  entries: { name: string; quantity: number; totalValue: number; createdAt: string }[]
}

export default function InventoryEntryPage() {
  const sedeId = 'sede-tecamachalco'
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const [entriesByCategory, setEntriesByCategory] = useState<EntryByCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function fetchEntries() {
      setLoading(true)
      setError(null)
      try {
        const url = `/api/inventory-entry/by-category?sedeId=${sedeId}` + (from ? `&from=${from}` : '') + (to ? `&to=${to}` : '')
        const res = await fetch(url)
        if (!res.ok) throw new Error('No se pudo cargar el detalle de entradas')
        const data = await res.json()
        setEntriesByCategory(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEntries()
  }, [from, to, sedeId])

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      {/* Header con título y filtros */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registrar Entrada de Inventario</h1>
            <p className="text-gray-600">Agregar nuevos productos al inventario clínico</p>
          </div>
        </div>
        
        {/* Filtro de fechas para ver métricas relacionadas */}
        <DateRangeFilter basePath="/inventory/entry" initialFrom={from} initialTo={to} sedeId={sedeId} />
      </div>
      
      {/* Resumen de entradas por categoría */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalle de Entradas por Categoría</h2>
        {loading && <div className="text-gray-500">Cargando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && entriesByCategory.length === 0 && (
          <div className="text-gray-500">No hay entradas registradas en este periodo.</div>
        )}
        {!loading && !error && entriesByCategory.length > 0 && (
          <div className="space-y-8">
            {entriesByCategory.map((cat, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-2">{cat.category}</h3>
                <div className="flex gap-8 mb-2">
                  <span className="text-lg font-bold text-gray-700">Total cantidad: <span className="text-green-700">{cat.totalQuantity}</span></span>
                  <span className="text-lg font-bold text-gray-700">Total valor: <span className="text-green-700">${cat.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></span>
                </div>
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Producto</th>
                      <th className="py-2 text-right">Cantidad</th>
                      <th className="py-2 text-right">Valor</th>
                      <th className="py-2 text-right">Fecha de Entrada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.entries.map((entry, j) => (
                      <tr key={j} className="border-b last:border-0">
                        <td className="py-2 font-medium text-gray-900">{entry.name}</td>
                        <td className="py-2 text-right">{entry.quantity}</td>
                        <td className="py-2 text-right">${entry.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 text-right">{new Date(entry.createdAt).toLocaleDateString('es-MX')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Botón para mostrar el formulario */}
      <div className="mb-8 flex justify-center">
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="px-6 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow">
            Registrar Entrada de Inventario
          </Button>
        )}
      </div>

      {/* Formulario y panel lateral solo si showForm es true */}
      {showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Información del Producto</h2>
                <p className="text-gray-600">Completa los datos del producto que deseas agregar</p>
              </div>
              <InventoryEntryForm />
            </div>
          </div>
          
          {/* Panel lateral con información útil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Útil</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Categorías Disponibles</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Alérgenos Alxoid</li>
                    <li>• Alérgenos</li>
                    <li>• Vacunas Pediátricas</li>
                    <li>• Medicamentos</li>
                    <li>• Gammaglobulina</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">✅ Consejos</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Verifica la fecha de caducidad</li>
                    <li>• Revisa el lote del producto</li>
                    <li>• Confirma el precio unitario</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h4 className="font-medium text-orange-900 mb-2">⚠️ Importante</h4>
                  <p className="text-sm text-orange-800">
                    Los productos Alxoid requieren especificar ml por vial para el cálculo correcto de la cantidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 