'use client'

import { SimpleTreatmentForm } from './SimpleTreatmentForm'
import { useProducts } from '@/hooks/useProducts'

const pruebasItemsBackup = [
  'ALEX molecular',
  'Phadiatop',
  'Prick',
  'Prick to prick',
  'Pruebas con alimentos',
  'Suero',
  'FeNO',
  'COVID/Influenza',
  'Estreptococo B',
  'Influenza A y B / Sincitial / Adenovirus',
]

export function PruebasForm({ append, fields }: { append: (value: any) => void, fields: any[] }) {
  const { products, isLoading, error } = useProducts('PRUEBAS')
  
  // Usar productos de la categoría PRUEBAS o lista de respaldo
  const pruebasItems = products.length > 0 
    ? products.map(p => p.name)
    : pruebasItemsBackup

  return (
    <SimpleTreatmentForm
      title="Pruebas"
      subtipo="PRUEBAS"
      items={pruebasItems}
      append={append}
      fields={fields}
      isLoading={isLoading}
      error={error}
    />
  )
} 