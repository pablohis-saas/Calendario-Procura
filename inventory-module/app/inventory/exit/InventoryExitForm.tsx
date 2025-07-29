'use client'

import { useState, useRef } from 'react'
import { useForm, FormProvider, useFormContext, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { inventoryUsageSchema, InventoryUsageInput, InventoryUsageDetailInput } from '@/schemas/inventory-usage'
import { processInventoryUsage } from '@/app/actions/inventory-usage'
import { PatientStep } from '@/components/inventory-exit-steps/PatientStep'
import { TreatmentTypeStep } from '@/components/inventory-exit-steps/TreatmentTypeStep'
import { DetailsStep } from '@/components/inventory-exit-steps/DetailsStep'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

// Define los pasos del formulario
const steps = ['PATIENT_NAME', 'TREATMENT_TYPE', 'DETAILS', 'SUMMARY']

function ReactionForm() {
    const { register, control } = useFormContext<InventoryUsageInput>()
    const tuvoReaccion = useWatch({
        control,
        name: 'tuvoReaccion'
    })

    return (
        <div className="space-y-4">
             <div className="space-y-2">
                <Label>Observaciones Adicionales</Label>
                <Textarea {...register('observaciones')} placeholder="Anotaciones sobre el tratamiento o el paciente..." />
            </div>
            <div className="space-y-2">
                <Label>¿El paciente tuvo alguna reacción?</Label>
                 <Controller
                    name="tuvoReaccion"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={(value) => field.onChange(value === 'true')}
                            value={String(field.value)}
                            className="flex items-center"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="reaccion-si" />
                                <Label htmlFor="reaccion-si">Sí</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="reaccion-no" />
                                <Label htmlFor="reaccion-no">No</Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>
            {tuvoReaccion === true && (
                 <div className="space-y-2">
                    <Label>Descripción de la Reacción</Label>
                    <Textarea {...register('descripcionReaccion')} placeholder="Detalle la reacción observada..." />
                </div>
            )}
        </div>
    )
}

function SummaryStep({ 
    onBack, 
    isPending 
}: { 
    onBack: () => void, 
    isPending: boolean 
}) {
    const { control } = useFormContext<InventoryUsageInput>()
    const [nombrePaciente, items] = useWatch({
        control,
        name: ['nombrePaciente', 'items']
    })

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
                <div className="w-8 h-1 bg-green-500 rounded"></div>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        ✓
                    </div>
                    <span className="text-sm font-medium text-gray-600">Detalles</span>
                </div>
                <div className="w-8 h-1 bg-primary rounded"></div>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        4
                    </div>
                    <span className="text-sm font-medium text-gray-600">Resumen</span>
                </div>
            </div>

            <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardTitle className="flex items-center space-x-2 text-primary">
                        <span>📋 Resumen y Reacciones</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                            <span>👤 Información del Paciente</span>
                        </h4>
                        <p className="text-blue-800"><strong>Nombre:</strong> {nombrePaciente}</p>
                        <p className="text-blue-800 mt-2"><strong>Productos aplicados ({items?.length || 0}):</strong></p>
                        <ul className="pl-5 list-disc mt-2 space-y-1">
                            {(items || []).map((d: InventoryUsageDetailInput, i: number) => (
                                <li key={i} className="text-blue-700">
                                    {d.nombreProducto} - Cantidad: {d.cantidad}
                                    {d.doses && ` (Dosis: ${d.doses})`}
                                </li>
                            ))}
                </ul>
            </div>

            <ReactionForm />

                    <div className="flex justify-between pt-6 border-t border-gray-200">
                        <Button 
                            onClick={onBack} 
                            variant="outline" 
                            type="button" 
                            disabled={isPending}
                            className="px-6 py-2 text-base font-medium border-2 hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Atrás
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isPending}
                            className="px-8 py-3 text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                        >
                            {isPending ? '🔄 Registrando...' : '✅ Registrar Salida'}
                </Button>
            </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function InventoryExitForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const [unexpectedError, setUnexpectedError] = useState<string | null>(null)
  const methods = useForm<InventoryUsageInput>({
    resolver: zodResolver(inventoryUsageSchema),
    mode: 'onSubmit',
    defaultValues: { 
      items: [],
      tuvoReaccion: false,
     },
  })

  const { execute, result, status } = useAction(processInventoryUsage, {
    onSuccess: (res) => {
        if (res.data?.success) {
            toast.success(res.data.success)
            methods.reset()
            setCurrentStep(0)
            setUnexpectedError(null)
        } else if (res.data?.failure) {
            toast.error(res.data.failure)
            setUnexpectedError(res.data.failure)
        }
    },
    onError: (error) => {
        toast.error('Ocurrió un error inesperado.')
        setUnexpectedError('Ocurrió un error inesperado. Intenta de nuevo o contacta soporte.')
        console.error('InventoryExitForm error:', error);
    }
  })

  const handleNext = async () => {
    let fieldsToValidate: (keyof InventoryUsageInput)[] = []
    if (steps[currentStep] === 'PATIENT_NAME') fieldsToValidate.push('nombrePaciente')
    if (steps[currentStep] === 'TREATMENT_TYPE') fieldsToValidate.push('tipoTratamiento')
    if (steps[currentStep] === 'DETAILS') fieldsToValidate.push('items')
    const isValid = await methods.trigger(fieldsToValidate)
    if (!isValid) {
      console.warn('Errores de validación:', methods.formState.errors)
    }
    if (isValid) setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => setCurrentStep((prev) => prev - 1)

  const onSubmit = async (data: InventoryUsageInput) => {
    if (!data.tipoTratamiento) {
      toast.error('Debes seleccionar un tipo de tratamiento antes de registrar la salida.')
      if (errorRef.current) errorRef.current.focus()
      setUnexpectedError('Debes seleccionar un tipo de tratamiento antes de registrar la salida.')
      return
    }
    setUnexpectedError(null)
    execute(data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        {/* Mensajes de error mejorados */}
        {unexpectedError && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 text-sm flex items-center">
            <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
            <span className="font-medium">{unexpectedError}</span>
          </div>
        )}
        
        {Object.values(methods.formState.errors).length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">
            <div className="flex items-center mb-2">
              <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
              <span className="font-medium">Errores de validación:</span>
            </div>
            <ul className="space-y-1 ml-5">
              {Object.values(methods.formState.errors).map((err: any, i) => 
                err?.message && <li key={i} className="flex items-center">
                  <span className="w-1 h-1 bg-yellow-600 rounded-full mr-2"></span>
                  {err.message}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Contenido del paso actual */}
        <div className="min-h-[500px]">
        {steps[currentStep] === 'PATIENT_NAME' && <PatientStep onNext={handleNext} />}
        {steps[currentStep] === 'TREATMENT_TYPE' && <TreatmentTypeStep onNext={handleNext} onBack={handleBack} />}
        {steps[currentStep] === 'DETAILS' && (
            <DetailsStep onNext={handleNext} onBack={handleBack} />
        )}
        {steps[currentStep] === 'SUMMARY' && <SummaryStep onBack={handleBack} isPending={status === 'executing'} />}
        </div>

        <p ref={errorRef} tabIndex={-1} className="sr-only text-red-600">
          Debes seleccionar un tipo de tratamiento antes de registrar la salida.
        </p>
      </form>
    </FormProvider>
  )
} 