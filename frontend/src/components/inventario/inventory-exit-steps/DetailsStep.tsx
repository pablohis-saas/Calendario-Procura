'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { InventoryUsageInput, InventoryUsageDetailInput } from '@/schemas/inventory-usage'
import { TipoTratamiento } from '@/types/inventory'
import { InmunoterapiaForm } from './details/InmunoterapiaForm'
import { PruebasForm } from './details/PruebasForm'
import { ConsultaForm } from './details/ConsultaForm'
import { GammaglobulinaForm } from './details/GammaglobulinaForm'
import { VacunasPediatricasForm } from './details/VacunasPediatricasForm'
import { MedicamentosExtrasForm } from './details/MedicamentosExtrasForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function ItemsList({ fields, remove }: { fields: any[]; remove: (index: number) => void }) {
  if (fields.length === 0) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumen de productos</h3>
        <p className="text-gray-500 italic">No hay productos agregados.</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumen de productos</h3>
      <ul className="space-y-2">
        {fields.map((field, index) => (
          <li key={field.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
            <div>
              <span className="font-medium text-gray-800">[{field.categoria || 'Sin categoría'}] {field.nombreProducto}</span>
              <div className="text-sm text-gray-600">
                Cantidad: {field.cantidad}
                {field.dosis && ` — Dosis: ${field.dosis}`}
                {field.mlPorFrasco && ` — ml/frasco: ${field.mlPorFrasco}`}
                {field.fechaCaducidad && ` — Caducidad: ${field.fechaCaducidad}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const renderDetailForm = (tipo: TipoTratamiento | undefined, append: any, fields: any[]) => {
  switch (tipo) {
    case TipoTratamiento.INMUNOTERAPIA:
      return <InmunoterapiaForm append={append} fields={fields} />
    case TipoTratamiento.PRUEBAS:
      return <PruebasForm append={append} fields={fields} />
    case TipoTratamiento.CONSULTA:
      return <ConsultaForm append={append} fields={fields} />
    case TipoTratamiento.GAMMAGLOBULINA:
      return <GammaglobulinaForm append={append} fields={fields} />
    case TipoTratamiento.VACUNAS_PEDIATRICAS:
      return <VacunasPediatricasForm append={append} fields={fields} />
    case TipoTratamiento.MEDICAMENTOS_EXTRAS:
      return <MedicamentosExtrasForm append={append} fields={fields} />
    default:
      return (
        <div className="text-center text-red-600">
          <p>Error: Tipo de tratamiento no seleccionado o no válido.</p>
          <p>Por favor, regrese y seleccione una opción.</p>
        </div>
      )
  }
}

export function DetailsStep() {
  const { control, watch } = useFormContext<InventoryUsageInput>()
  const tipoTratamiento = watch('tipoTratamiento')
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  return (
    <div className="space-y-4">
      {renderDetailForm(tipoTratamiento as TipoTratamiento | undefined, append, fields)}
      <ItemsList fields={fields} remove={remove} />
    </div>
  )
} 