'use client'
import InventoryExitForm from './InventoryExitForm'
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ExitByCategory {
  category: string
  totalQuantity: number
  totalValue: number
  products: { name: string; quantity: number; totalValue: number }[]
}

export default function InventoryExitPage() {
  const sedeId = 'sede-tecamachalco'
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const [exitsByCategory, setExitsByCategory] = useState<ExitByCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function fetchExits() {
      setLoading(true)
      setError(null)
      try {
        const url = `/api/inventory/exit/by-category?sedeId=${sedeId}` + (from ? `&from=${from}` : '') + (to ? `&to=${to}` : '')
        const res = await fetch(url)
        if (!res.ok) throw new Error('Error al cargar salidas')
        const data = await res.json()
        setExitsByCategory(data)
      } catch (err) {
        setError('No se pudo cargar el detalle de salidas')
      } finally {
        setLoading(false)
      }
    }
    fetchExits()
  }, [sedeId, from, to])

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      {/* Filtro de fechas arriba */}
      <div className="mb-8">
        <DateRangeFilter basePath="/inventory/exit" initialFrom={from} initialTo={to} sedeId={sedeId} />
      </div>
      {/* Resumen de salidas por categoría */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Detalle de Inventario Utilizado por Categoría</h2>
        {loading && <div className="text-gray-500">Cargando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exitsByCategory.map(cat => (
              <Card key={cat.category} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-2xl text-gray-900">{cat.category}</h3>
                  <span className="text-lg text-gray-500">{cat.totalQuantity} salidas</span>
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-2">
                  {cat.totalValue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </div>
                <ul className="text-lg text-gray-800 space-y-1">
                  {cat.products.map(prod => (
                    <li key={prod.name} className="flex justify-between">
                      <span>{prod.name}</span>
                      <span>{prod.quantity} / {prod.totalValue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Botón para mostrar el formulario de salida */}
      <div className="mb-8 flex justify-center">
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="px-8 py-4 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-colors">
            Registrar Salida de Inventario
          </Button>
        )}
      </div>
      {/* Formulario principal y panel lateral, solo visibles si showForm es true */}
      {showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Información de la Salida</h2>
                <p className="text-gray-600">Completa los datos del paciente y tratamiento</p>
              </div>
              <InventoryExitForm />
            </div>
          </div>
          {/* Panel lateral con información útil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Útil</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">🏥 Tipos de Tratamiento</h4>
                  <ul className="text-base text-blue-800 space-y-1">
                    <li>• Consulta</li>
                    <li>• Inmunoterapia</li>
                    <li>• Vacunas Pediátricas</li>
                    <li>• Gammaglobulina</li>
                    <li>• Pruebas</li>
                    <li>• Medicamentos Extras</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">✅ Proceso</h4>
                  <ul className="text-base text-green-800 space-y-1">
                    <li>1. Datos del paciente</li>
                    <li>2. Tipo de tratamiento</li>
                    <li>3. Productos utilizados</li>
                    <li>4. Observaciones</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h4 className="font-medium text-orange-900 mb-2">⚠️ Importante</h4>
                  <p className="text-base text-orange-800">
                    Registra cualquier reacción del paciente para seguimiento médico.
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