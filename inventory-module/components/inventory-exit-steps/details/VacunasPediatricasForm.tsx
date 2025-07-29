'use client'

import { SimpleTreatmentForm } from './SimpleTreatmentForm'
import { useProducts } from '@/hooks/useProducts'

// Lista de respaldo en caso de que la API falle
const vacunasPediatricasItemsBackup = [
  'Adacel Boost',
  'Gardasil',
  'Gardasil 9',
  'Hepatitis A y B',
  'Fiebre Amarilla',
  'Herpes Zóster',
  'Hexacima',
  'Influenza',
  'Menactra',
  'MMR',
  'Prevenar 13 V',
  'Proquad',
  'Pulmovax',
  'Rota Teq',
  'Vaqta',
  'Varivax',
]

export function VacunasPediatricasForm({ append, fields }: { append: (value: any) => void, fields: any[] }) {
  const { products, isLoading, error } = useProducts('Vacunas Pediátricas');
  
  // Usar productos dinámicos si están disponibles, sino usar la lista de respaldo
  const items = products.length > 0 
    ? products.map(p => p.name)
    : vacunasPediatricasItemsBackup;

  return (
    <SimpleTreatmentForm
      title="Vacunas Pediátricas"
      subtipo="VACUNAS_PEDIATRICAS"
      items={items}
      append={append}
      fields={fields}
      isLoading={isLoading}
      error={error}
    />
  )
} 