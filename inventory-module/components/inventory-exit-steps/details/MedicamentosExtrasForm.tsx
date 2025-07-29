'use client'

import { SimpleTreatmentForm } from './SimpleTreatmentForm'
import { useProducts } from '@/hooks/useProducts'

// Lista de respaldo en caso de que la API falle
const medicamentosExtrasItemsBackup = [
  'Bacmune',
  'Transferón',
  'Diprospán',
  'Nebulización',
]

export function MedicamentosExtrasForm({ append, fields }: { append: (value: any) => void, fields: any[] }) {
  const { products, isLoading, error } = useProducts('Medicamentos');
  
  // Usar productos dinámicos si están disponibles, sino usar la lista de respaldo
  const items = products.length > 0 
    ? products.map(p => p.name)
    : medicamentosExtrasItemsBackup;

  return (
    <SimpleTreatmentForm
      title="Medicamentos Extras"
      subtipo="MEDICAMENTOS_EXTRAS"
      items={items}
      append={append}
      fields={fields}
      isLoading={isLoading}
      error={error}
    />
  )
} 