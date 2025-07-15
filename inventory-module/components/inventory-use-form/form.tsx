'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const ALERGENOS = [
  'Abedul', 'Ácaros', 'Álamo del este', 'Ambrosía', 'Caballo', 'Camarón',
  'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Cucaracha',
  'Mezcla pastos', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Trueno',
]

const presentacionSchema = z.object({
  presentacion: z.enum(['unidad', 'frasco'], {
    required_error: 'Selecciona una presentación',
  }),
})

const glicerinadoUnidadSchema = z.object({
  nombrePaciente: z.string().min(1, 'El nombre es obligatorio'),
  alergenos: z.array(z.string()).min(1, 'Selecciona al menos un alérgeno').max(6, 'Máximo 6 alérgenos'),
  unidadesAplicadas: z.number().int().min(1, 'Debe ser al menos 1'),
  numeroDosis: z.number().int().min(1, 'Debe ser al menos 1'),
  frascoType: z.enum(['amarillo', 'verde', 'madre'], { required_error: 'Selecciona el tipo de frasco' }),
  observaciones: z.string().optional(),
  huboReaccion: z.enum(['Sí', 'No']),
  descripcionReaccion: z.string().optional(),
}).refine(
  (data) => data.huboReaccion === 'No' || (data.descripcionReaccion && data.descripcionReaccion.length > 0),
  {
    message: 'Describe la reacción',
    path: ['descripcionReaccion'],
  }
)

type PresentacionForm = z.infer<typeof presentacionSchema>
type GlicerinadoUnidadForm = z.infer<typeof glicerinadoUnidadSchema>
type FormStep = 'inicio' | 'unidad' | 'frasco'

export function InventoryUseForm() {
  const [formStep, setFormStep] = React.useState<FormStep>('inicio')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Paso 1: Selección de presentación
  const {
    register: registerPresentacion,
    handleSubmit: handleSubmitPresentacion,
    formState: { errors: errorsPresentacion },
  } = useForm<PresentacionForm>({
    resolver: zodResolver(presentacionSchema),
    defaultValues: { presentacion: undefined },
  })

  function onSubmitPresentacion({ presentacion }: PresentacionForm) {
    if (presentacion === 'unidad') setFormStep('unidad')
    else if (presentacion === 'frasco') setFormStep('frasco')
  }

  // Paso 2: Glicerinado por unidad
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<GlicerinadoUnidadForm>({
    resolver: zodResolver(glicerinadoUnidadSchema),
    defaultValues: {
      alergenos: [],
      huboReaccion: 'No',
      frascoType: undefined,
    },
  })

  const huboReaccion = watch('huboReaccion')

  async function onSubmitUnidad(data: GlicerinadoUnidadForm) {
    setIsSubmitting(true)
    try {
      // TODO: Mapear nombres de alérgenos a IDs reales si aplica
      const payload = {
        sedeId: 'sede-tecamachalco', // TODO: obtener de contexto real
        userId: 'e9c7df41-6d9d-4c34-a424-b7e429cf507f', // TODO: obtener de auth real
        nombrePaciente: data.nombrePaciente,
        tipoTratamiento: 'INMUNOTERAPIA',
        observaciones: data.observaciones || '',
        tuvoReaccion: data.huboReaccion === 'Sí',
        descripcionReaccion: data.descripcionReaccion || '',
        items: [
          {
            productId: 'f79386a9-c478-4f33-bd23-a428f9844ea3', // TODO: obtener dinámico si aplica
            units: data.unidadesAplicadas,
            doses: data.numeroDosis,
            frascoType: data.frascoType,
            allergenIds: data.alergenos, // TODO: mapear a IDs reales si aplica
          },
        ],
      }
      const res = await fetch('/api/inventory/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        reset()
        alert('Registro exitoso')
      } else {
        alert('Error al registrar uso de inventario')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {formStep === 'inicio' && (
        <form onSubmit={handleSubmitPresentacion(onSubmitPresentacion)} className="space-y-6">
          <div>
            <Label className="text-base text-[#1b2538]">Tipo de inmunoterapia</Label>
            <div className="mt-2 text-sm text-[#1b2538]">Glicerinado</div>
          </div>
          <div>
            <Label className="text-base text-[#1b2538] mb-2">Presentación</Label>
            <RadioGroup className="space-y-2 mt-2" {...registerPresentacion('presentacion')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unidad" id="unidad" />
                <Label htmlFor="unidad">Por unidad</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="frasco" id="frasco" />
                <Label htmlFor="frasco">En frasco</Label>
              </div>
            </RadioGroup>
            {errorsPresentacion.presentacion && (
              <p className="text-red-600 text-xs mt-1">{errorsPresentacion.presentacion.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-[#1b2538] text-white">Siguiente</Button>
        </form>
      )}
      {formStep === 'unidad' && (
        <form onSubmit={handleSubmit(onSubmitUnidad)} className="space-y-6">
          <div>
            <Label htmlFor="nombrePaciente" className="text-base text-[#1b2538]">Nombre del paciente</Label>
            <Input id="nombrePaciente" {...register('nombrePaciente')} className="mt-2" />
            {errors.nombrePaciente && <p className="text-red-600 text-xs mt-1">{errors.nombrePaciente.message}</p>}
          </div>
          <div>
            <Label className="text-base text-[#1b2538]">Alérgenos</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ALERGENOS.map(alergeno => (
                <label key={alergeno} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={alergeno}
                    {...register('alergenos')}
                    className="accent-[#1b2538]"
                  />
                  <span>{alergeno}</span>
                </label>
              ))}
            </div>
            {errors.alergenos && <p className="text-red-600 text-xs mt-1">{errors.alergenos.message}</p>}
          </div>
          <div>
            <Label htmlFor="unidadesAplicadas" className="text-base text-[#1b2538]">Unidades aplicadas</Label>
            <Input
              id="unidadesAplicadas"
              type="number"
              min="1"
              step="1"
              {...register('unidadesAplicadas', { valueAsNumber: true })}
              className="mt-2"
            />
            {errors.unidadesAplicadas && <p className="text-red-600 text-xs mt-1">{errors.unidadesAplicadas.message}</p>}
          </div>
          <div className="flex-1">
            <Label htmlFor="numeroDosis" className="text-base text-[#1b2538]">Número de dosis</Label>
            <Input
              id="numeroDosis"
              type="number"
              min="1"
              step="1"
              {...register('numeroDosis', { valueAsNumber: true })}
              className="mt-2"
            />
            {errors.numeroDosis && <p className="text-red-600 text-xs mt-1">{errors.numeroDosis.message}</p>}
          </div>
          <div>
            <Label htmlFor="frascoType" className="text-base text-[#1b2538]">Tipo de frasco</Label>
            <select id="frascoType" {...register('frascoType')} className="mt-2 w-full border rounded">
              <option value="">Selecciona tipo de frasco</option>
              <option value="amarillo">Amarillo</option>
              <option value="verde">Verde</option>
              <option value="madre">Madre</option>
            </select>
            {errors.frascoType && <p className="text-red-600 text-xs mt-1">{errors.frascoType.message}</p>}
          </div>
          <div>
            <Label htmlFor="observaciones" className="text-base text-[#1b2538]">Observaciones</Label>
            <Textarea id="observaciones" {...register('observaciones')} className="mt-2" />
          </div>
          <div>
            <Label className="text-base text-[#1b2538]">¿Hubo alguna reacción?</Label>
            <RadioGroup className="space-y-2 mt-2" value={huboReaccion} onValueChange={val => {
              // @ts-ignore
              // react-hook-form expects string, value is always string
              // eslint-disable-next-line
              control.setValue('huboReaccion', val)
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sí" id="huboReaccionSi" />
                <Label htmlFor="huboReaccionSi">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="huboReaccionNo" />
                <Label htmlFor="huboReaccionNo">No</Label>
              </div>
            </RadioGroup>
            {errors.huboReaccion && <p className="text-red-600 text-xs mt-1">{errors.huboReaccion.message}</p>}
          </div>
          {huboReaccion === 'Sí' && (
            <div>
              <Label htmlFor="descripcionReaccion" className="text-base text-[#1b2538]">Describe la reacción</Label>
              <Textarea id="descripcionReaccion" {...register('descripcionReaccion')} className="mt-2" />
              {errors.descripcionReaccion && typeof errors.descripcionReaccion.message === 'string' && (
                <p className="text-red-600 text-xs mt-1">{errors.descripcionReaccion.message}</p>
              )}
            </div>
          )}
          <Button type="submit" className="w-full bg-[#1b2538] text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Registrar uso'}
          </Button>
        </form>
      )}
      {formStep === 'frasco' && (
        <div className="mt-8 text-center text-[#1b2538] text-lg">➡️ Aquí irán los campos para Glicerinado en frasco</div>
      )}
    </div>
  )
} 