'use client'

import { SimpleTreatmentForm } from './SimpleTreatmentForm'
import { useProducts } from '@/hooks/useProducts'

// Lista de respaldo en caso de que la API falle
const gammaglobulinaItemsBackup = [
  'Hizentra 4GR',
  'Hizentra 2GR',
  'TENGELINE 10% 5G/50ML',
  'TENGELINE 10G/100ML',
  'HIGLOBIN 10GR',
]

export function GammaglobulinaForm({ append, fields }: { append: (value: any) => void, fields: any[] }) {
  const { products, isLoading, error } = useProducts('Gammaglobulina');
  
  // Usar productos dinámicos si están disponibles, sino usar la lista de respaldo
  const items = products.length > 0 
    ? products.map(p => p.name)
    : gammaglobulinaItemsBackup;

  return (
    <SimpleTreatmentForm
      title="Gammaglobulina"
      subtipo="GAMMAGLOBULINA"
      items={items}
      append={append}
      fields={fields}
      isLoading={isLoading}
      error={error}
    />
  )
} 