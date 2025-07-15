'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { InventoryUsageInput } from '@/schemas/inventory-usage'
import { TipoTratamiento } from '@/types/inventory'
import { Stethoscope, Syringe, TestTube, Baby, Pill, UserCheck, ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'

interface TreatmentTypeStepProps {
  onNext: () => void
  onBack: () => void
}

const treatmentLabels: Record<TipoTratamiento, string> = {
  [TipoTratamiento.INMUNOTERAPIA]: 'Inmunoterapia',
  [TipoTratamiento.PRUEBAS]: 'Pruebas',
  [TipoTratamiento.GAMMAGLOBULINA]: 'Gammaglobulina',
  [TipoTratamiento.VACUNAS_PEDIATRICAS]: 'Vacunas Pediátricas',
  [TipoTratamiento.MEDICAMENTOS_EXTRAS]: 'Medicamentos Extras',
  [TipoTratamiento.CONSULTA]: 'Consulta',
}

const treatmentIcons: Record<TipoTratamiento, React.ReactNode> = {
  [TipoTratamiento.INMUNOTERAPIA]: <Syringe className="w-8 h-8 text-primary" />,
  [TipoTratamiento.PRUEBAS]: <TestTube className="w-8 h-8 text-primary" />,
  [TipoTratamiento.GAMMAGLOBULINA]: <Pill className="w-8 h-8 text-primary" />,
  [TipoTratamiento.VACUNAS_PEDIATRICAS]: <Baby className="w-8 h-8 text-primary" />,
  [TipoTratamiento.MEDICAMENTOS_EXTRAS]: <Pill className="w-8 h-8 text-primary" />,
  [TipoTratamiento.CONSULTA]: <Stethoscope className="w-8 h-8 text-primary" />,
}

export function TreatmentTypeStep({ onNext, onBack }: TreatmentTypeStepProps) {
  const { setValue, formState: { errors }, trigger } = useFormContext<InventoryUsageInput>()
  const tipoTratamiento = useWatch({ name: 'tipoTratamiento' })

  const handleSelect = async (value: TipoTratamiento) => {
    setValue('tipoTratamiento', value, { shouldValidate: true })
    const valid = await trigger('tipoTratamiento')
    if (valid) onNext()
  }

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
        <div className="w-8 h-1 bg-primary rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <span className="text-sm font-medium text-gray-600">Tipo de Tratamiento</span>
        </div>
        <div className="w-8 h-1 bg-gray-200 rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
            3
          </div>
          <span className="text-sm font-medium text-gray-400">Detalles</span>
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
            <UserCheck className="w-6 h-6" />
            <span>Tipo de Tratamiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {Object.values(TipoTratamiento).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => handleSelect(tipo)}
                className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 hover:scale-[1.02] hover:shadow-lg bg-white px-4 py-3 text-base font-semibold gap-3
                  ${tipoTratamiento === tipo ? 'border-primary ring-2 [--tw-ring-color:rgb(var(--primary)/0.3)] shadow-[0_0_0_4px_rgb(var(--primary)/0.2)] bg-[rgb(var(--primary)/0.05)] text-primary' : 'border-gray-200 text-gray-900 hover:border-primary/50'}`}
              >
                {treatmentIcons[tipo]}
                <span>{treatmentLabels[tipo]}</span>
              </button>
            ))}
          </div>
          
          {errors.tipoTratamiento && (
            <p className="text-red-600 text-sm mt-2 flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.tipoTratamiento.message}
            </p>
          )}

          <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
            <Button 
              onClick={onBack} 
              variant="outline" 
              type="button"
              className="px-6 py-2 text-base font-medium border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
            
            {tipoTratamiento && (
              <Button 
                onClick={() => onNext()} 
                className="px-6 py-2 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 