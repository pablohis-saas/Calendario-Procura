'use client'

import { SimpleTreatmentForm } from './SimpleTreatmentForm'
import { useProducts } from '@/hooks/useProducts'

const consultaItemsBackup = [
  'Consulta',
]

export function ConsultaForm({ append, fields }: { append: (value: any) => void, fields: any[] }) {
  const { products, isLoading, error } = useProducts('CONSULTA')
  
  // Usar productos de la categoría CONSULTA o lista de respaldo
  const consultaItems = products.length > 0 
    ? products.map(p => p.name)
    : consultaItemsBackup

  return (
    <SimpleTreatmentForm
      title="Consulta"
      subtipo="CONSULTA"
      items={consultaItems}
      append={append}
      fields={fields}
      maxQuantity={3}
      isLoading={isLoading}
      error={error}
    />
  )
} 