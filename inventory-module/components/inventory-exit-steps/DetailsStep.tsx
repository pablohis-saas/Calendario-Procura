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
import { ArrowLeft, ArrowRight, Package, Trash2 } from 'lucide-react'

interface DetailsStepProps {
  onNext: () => void;
  onBack: () => void;
}

function ItemsList({ fields, remove }: { fields: any[]; remove: (index: number) => void }) {
  if (fields.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <Package className="w-5 h-5 mr-2 text-primary" />
          Resumen de productos
        </h3>
        <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay productos agregados</p>
          <p className="text-gray-400 text-sm">Agrega productos del tratamiento seleccionado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Package className="w-5 h-5 mr-2 text-primary" />
        Resumen de productos ({fields.length})
      </h3>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex justify-between items-center p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {field.categoria || 'Sin categoría'}
                </span>
                <span className="font-semibold text-gray-800">{field.nombreProducto}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1 space-y-1">
                <div className="flex items-center space-x-4">
                  <span>📦 Cantidad: <strong>{field.cantidad}</strong></span>
                  {field.dosis && <span>💉 Dosis: <strong>{field.dosis}</strong></span>}
                  {field.mlPorFrasco && <span>🧪 ml/frasco: <strong>{field.mlPorFrasco}</strong></span>}
                </div>
                {field.fechaCaducidad && (
                  <span>📅 Caducidad: <strong>{field.fechaCaducidad}</strong></span>
                )}
              </div>
            </div>
            <Button
              type="button"
              onClick={() => remove(index)}
              variant="outline"
              size="sm"
              className="ml-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          </div>
        ))}
      </div>
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
        <div className="text-center p-8 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="text-red-600 mb-4">
            <Package className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Error: Tipo de tratamiento no seleccionado</h3>
          </div>
          <p className="text-red-700 mb-4">Por favor, regrese y seleccione una opción válida.</p>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
            Regresar a selección
          </Button>
        </div>
      )
  }
}

export function DetailsStep({ onNext, onBack }: DetailsStepProps) {
  const { control, watch, formState: { errors } } = useFormContext<InventoryUsageInput>()
  const tipoTratamiento = watch('tipoTratamiento')
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  return (
    <div className="space-y-6">
      {/* Indicador de progreso */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            ✓
          </div>
          <span className="text-sm font-medium text-gray-600">Datos del Paciente</span>
        </div>
        <div className="w-8 h-1 bg-green-500 rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            ✓
          </div>
          <span className="text-sm font-medium text-gray-600">Tipo de Tratamiento</span>
        </div>
        <div className="w-8 h-1 bg-primary rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
            3
          </div>
          <span className="text-sm font-medium text-gray-600">Detalles</span>
        </div>
        <div className="w-8 h-1 bg-gray-200 rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
            4
          </div>
          <span className="text-sm font-medium text-gray-400">Resumen</span>
        </div>
      </div>

      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Package className="w-6 h-6" />
            <span>Detalles del Tratamiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {renderDetailForm(tipoTratamiento as TipoTratamiento | undefined, append, fields)}
          <ItemsList fields={fields} remove={remove} />
          
          {errors.items && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.items.message}
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button 
              onClick={onBack} 
              variant="outline" 
              type="button"
              className="px-6 py-2 text-base font-medium border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
            
            <Button 
              onClick={onNext} 
              type="button"
              className="px-6 py-2 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
              disabled={fields.length === 0}
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 