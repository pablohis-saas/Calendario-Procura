'use client'

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { InventoryUsageInput } from '@/schemas/inventory-usage'
import PacienteSearch from '@/components/PacienteSearch'
import { useEffect, useState } from 'react'

interface PatientStepProps {
  onNext: () => void;
}

export function PatientStep({ onNext }: PatientStepProps) {
  const {
    setValue,
    formState: { errors },
    watch,
  } = useFormContext<InventoryUsageInput>()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const pacienteId = watch('pacienteId')
  const nombrePaciente = watch('nombrePaciente')

  useEffect(() => {
    const loadPacientes = async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:3002/api/pacientes')
        if (response.ok) {
          const data = await response.json()
          setPacientes(data)
        }
      } catch (error) {
        setPacientes([])
      } finally {
        setLoading(false)
      }
    }
    loadPacientes()
  }, [])

  const handlePacienteSelect = (paciente: any) => {
    setSelectedPaciente(paciente)
    if (paciente) {
      setValue('nombrePaciente', `${paciente.nombre} ${paciente.apellido}`)
      setValue('pacienteId', paciente.id)
    } else {
      setValue('nombrePaciente', '')
      setValue('pacienteId', '')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="paciente" className="text-base text-[#1b2538]">Paciente *</Label>
          <PacienteSearch
            pacientes={pacientes}
            onPacienteSelect={(paciente) => {
              setValue('pacienteId', paciente ? paciente.id : '')
              setValue('nombrePaciente', paciente ? `${paciente.nombre} ${paciente.apellido}` : '')
            }}
            placeholder="Buscar paciente por nombre..."
          />
          {errors.pacienteId && (
            <p className="text-red-500 text-sm mt-1">{errors.pacienteId.message as string}</p>
          )}
        </div>
        <Button onClick={onNext} className="w-full">
          Siguiente
        </Button>
      </CardContent>
    </Card>
  )
} 