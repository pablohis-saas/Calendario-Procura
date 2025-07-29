'use client'

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { InventoryUsageInput } from '@/schemas/inventory-usage'
import { ArrowRight, User } from 'lucide-react'

interface PatientStepProps {
  onNext: () => void;
}

export function PatientStep({ onNext }: PatientStepProps) {
  const {
    register,
    formState: { errors, isValid },
    trigger,
  } = useFormContext<InventoryUsageInput>()

  const handleNext = async () => {
    const isValid = await trigger('nombrePaciente')
    if (isValid) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Indicador de progreso */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <span className="text-sm font-medium text-gray-600">Datos del Paciente</span>
        </div>
        <div className="w-8 h-1 bg-gray-200 rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <span className="text-sm font-medium text-gray-400">Tipo de Tratamiento</span>
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
            <User className="w-6 h-6" />
            <span>Datos del Paciente</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="nombrePaciente" className="text-base font-medium">
              Nombre del Paciente *
            </Label>
            <Input
              id="nombrePaciente"
              {...register('nombrePaciente')}
              placeholder="Ej: Juan Pérez García"
              className="h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.nombrePaciente && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.nombrePaciente.message}
              </p>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleNext} 
              className="px-8 py-3 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              disabled={!isValid}
            >
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 