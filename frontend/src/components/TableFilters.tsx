import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PacienteSearch from "./PacienteSearch";

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
}

interface TableFiltersProps {
  pacientes: Paciente[];
  onFiltersChange: (filters: {
    pacienteId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) => void;
}

export default function TableFilters({ pacientes, onFiltersChange }: TableFiltersProps) {
  function getToday() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  }
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [fechaDesde, setFechaDesde] = useState(getToday());
  const [fechaHasta, setFechaHasta] = useState(getToday());

  useEffect(() => {
    applyFilters(undefined, getToday(), getToday());
    // eslint-disable-next-line
  }, []);

  const handlePacienteSelect = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    applyFilters(paciente.id, fechaDesde, fechaHasta);
  };

  const handleFechaDesdeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value;
    setFechaDesde(fecha);
    applyFilters(selectedPaciente?.id, fecha, fechaHasta);
  };

  const handleFechaHastaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value;
    setFechaHasta(fecha);
    applyFilters(selectedPaciente?.id, fechaDesde, fecha);
  };

  const applyFilters = (pacienteId?: string, desde?: string, hasta?: string) => {
    onFiltersChange({
      pacienteId,
      fechaDesde: desde,
      fechaHasta: hasta,
    });
  };

  const clearFilters = () => {
    setSelectedPaciente(null);
    setFechaDesde(getToday());
    setFechaHasta(getToday());
    onFiltersChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Paciente</label>
          <PacienteSearch
            pacientes={pacientes}
            onPacienteSelect={handlePacienteSelect}
            placeholder="Buscar paciente..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Fecha desde</label>
          <Input
            type="date"
            value={fechaDesde}
            onChange={handleFechaDesdeChange}
            className="w-full text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Fecha hasta</label>
          <Input
            type="date"
            value={fechaHasta}
            onChange={handleFechaHastaChange}
            className="w-full text-gray-900"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={clearFilters}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
} 