'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { InventoryUsageInput } from '@/schemas/inventory-usage'
import { TipoTratamiento } from '@/types/inventory'
import { Stethoscope, Syringe, TestTube, Baby, Pill, UserCheck } from 'lucide-react'
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
    <Card>
      <CardHeader>
        <CardTitle>Tipo de Tratamiento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
          {Object.values(TipoTratamiento).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => handleSelect(tipo)}
              className={`flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 hover:scale-[1.03] hover:shadow-lg px-4 py-2 text-lg font-semibold gap-2
                ${tipoTratamiento === tipo ? 'bg-gray-800 text-white border-primary ring-2 [--tw-ring-color:rgb(var(--primary)/0.3)] shadow-[0_0_0_4px_rgb(var(--primary)/0.2)]' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              {treatmentIcons[tipo]}
              <span>{treatmentLabels[tipo]}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-8">
          <Button onClick={onBack} variant="outline" type="button">Atrás</Button>
        </div>
      </CardContent>
    </Card>
  )
} 