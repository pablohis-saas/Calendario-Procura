'use client'

import { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { InventoryUsageInput, InventoryUsageDetailInput } from '@/schemas/inventory-usage'
import { useProducts } from '@/hooks/useProducts'

// --- DATA CONSTANTS ---
const INMUNOTERAPIA_SUBTYPES = {
  glicerinado: 'Glicerinado',
  alxoid: 'Alxoid',
  sublingual: 'Sublingual',
}

const ALERGENOS_DATA = {
  glicerinado: ['Abedul', 'Ácaros', 'Álamo del este', 'Ambrosía', 'Caballo', 'Camarón', 'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Cucaracha', 'Mezcla pastos', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Trueno'],
  sublingual: ['Abedul', 'Ácaros', 'Álamo del este', 'Alheña', 'Ambrosía', 'Caballo', 'Camarón', 'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Mezcla cucarachas', 'Mezcla pastos', 'Mezquite', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Sweet gum', 'Trueno'],
  // Alérgenos exclusivos de Alxoid - Tipo A
  alxoidA: [
    'Cupressus Arizónica', 'Fresno', 'Gramínea con sinodon', 'Sinodon', '6 Gramíneas',
    'Ambrosía A', 'Ácaros A', 'Encino A', 'Gato A', 'Perro A'
  ],
  // Alérgenos exclusivos de Alxoid - Tipo B
  alxoidB: [
    'Cupressus Arizónica B', 'Fresno B', 'Gramínea con sinodon B', 'Sinodon B', '6 Gramíneas B',
    'Ambrosía B', 'Ácaros B', 'Encino B', 'Gato B', 'Perro B'
  ],
  // Alérgenos legacy (para compatibilidad)
  alxoid: ['Ambrosía', 'Ácaros', 'Cupressus Arizónica', 'Encino', 'Fresno', 'Gato', 'Gramínea con sinodon', 'Sinodon', 'Perro', '6 Gramíneas'],
}

// --- SUB-FORMS ---

function LocalList({ localItems, onRemove }: { localItems: InventoryUsageDetailInput[], onRemove: (idx: number) => void }) {
  return (
    <ul className="space-y-2">
      {localItems.map((item, idx) => (
        <li key={idx} className="flex justify-between items-center border rounded p-2">
          <span>{item.nombreProducto} {item.alergenos ? `(${item.alergenos.join(', ')})` : ''} (x{item.cantidad})</span>
          <Button type="button" size="sm" variant="destructive" onClick={() => onRemove(idx)}>Eliminar</Button>
        </li>
      ))}
    </ul>
  )
}

function GlicerinadoForm({ onAdd }: { onAdd: (detail: InventoryUsageDetailInput) => void }) {
  const [mode, setMode] = useState<'unidad' | 'frasco'>('unidad')
  const [unidades, setUnidades] = useState(1);
  const [dosis, setDosis] = useState(1);
  const [frascoUnidad, setFrascoUnidad] = useState('Madre');
  const [selectedFrascos, setSelectedFrascos] = useState<string[]>([]);
  const [numFrascosMismo, setNumFrascosMismo] = useState(1);
  const [selectedAlergenos, setSelectedAlergenos] = useState<string[]>([]);
  
  const handleAdd = () => {
    if (selectedAlergenos.length === 0) {
      alert('Por favor, seleccione al menos un alérgeno.');
      return;
    }

    let detail: InventoryUsageDetailInput;

    if (mode === 'unidad') {
      detail = {
        subtipo: 'GLICERINADO_UNIDAD',
        nombreProducto: 'Glicerinado por Unidad',
        cantidad: unidades,
        alergenos: selectedAlergenos,
        frasco: frascoUnidad,
        doses: dosis,
      };
    } else { // mode === 'frasco'
      if (selectedFrascos.length === 0) {
        alert('Por favor, seleccione al menos un número de frasco.');
        return;
      }
      detail = {
        subtipo: 'GLICERINADO_FRASCO',
        nombreProducto: 'Glicerinado en Frasco',
        cantidad: numFrascosMismo,
        alergenos: selectedAlergenos,
        frasco: `Frascos: ${selectedFrascos.join(', ')}`,
      };
    }
    
    onAdd(detail);
    
    setUnidades(1);
    setDosis(1);
    setFrascoUnidad('Madre');
    setSelectedFrascos([]);
    setNumFrascosMismo(1);
    setSelectedAlergenos([]);
  }

  return (
    <div className="p-4 border rounded-md bg-slate-50 space-y-4">
      <h4 className="font-semibold text-lg">Glicerinado</h4>
      
      <RadioGroup value={mode} onValueChange={(value: 'unidad' | 'frasco') => setMode(value)} className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="unidad" id="unidad" />
          <Label htmlFor="unidad">Por Unidad</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="frasco" id="frasco" />
          <Label htmlFor="frasco">En Frasco</Label>
        </div>
      </RadioGroup>

      {mode === 'unidad' && (
        <div className="space-y-4">
          <Label>Unidades</Label>
          <Input type="number" value={unidades} onChange={(e) => setUnidades(Number(e.target.value))} min="1" />
          <Label>Frasco</Label>
          <Select value={frascoUnidad} onValueChange={setFrascoUnidad}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Madre">Madre</SelectItem>
              <SelectItem value="Amarillo">Amarillo</SelectItem>
              <SelectItem value="Verde">Verde</SelectItem>
            </SelectContent>
          </Select>
          <Label>¿Cuántas dosis? (1-12)</Label>
          <Input type="number" value={dosis} onChange={(e) => setDosis(Number(e.target.value))} min="1" max="12" />
        </div>
      )}
      
      {mode === 'frasco' && (
        <div className="space-y-4">
            <div>
                <Label>¿Qué frascos?</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`frasco-${i+1}`}
                                onCheckedChange={(checked) => {
                                    const frascoNum = (i + 1).toString();
                                    setSelectedFrascos(prev => checked ? [...prev, frascoNum] : prev.filter(f => f !== frascoNum))
                                }}
                                checked={selectedFrascos.includes((i+1).toString())}
                            />
                            <Label htmlFor={`frasco-${i+1}`}>{i+1}</Label>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <Label>¿Cuántos frascos del mismo? (1-5)</Label>
                <Select value={numFrascosMismo.toString()} onValueChange={(val) => setNumFrascosMismo(Number(val))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {[...Array(5)].map((_, i) => (
                            <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      )}

      <div>
        <Label>Alérgenos (máx. 6)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
          {ALERGENOS_DATA.glicerinado.map(alergeno => (
            <div key={alergeno} className="flex items-center space-x-2">
              <Checkbox 
                id={`glicerinado-${alergeno}`}
                onCheckedChange={(checked) => {
                  setSelectedAlergenos(prev => checked ? [...prev, alergeno] : prev.filter(a => a !== alergeno))
                }}
                checked={selectedAlergenos.includes(alergeno)}
                disabled={selectedAlergenos.length >= 6 && !selectedAlergenos.includes(alergeno)}
              />
              <Label htmlFor={`glicerinado-${alergeno}`}>{alergeno}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleAdd} type="button" className="w-full">Añadir Detalle de Glicerinado</Button>
    </div>
  )
}

function AlxoidForm({ onAdd }: { onAdd: (detail: InventoryUsageDetailInput) => void }) {
  const [tipoAlxoid, setTipoAlxoid] = useState('A');
  const [dosis, setDosis] = useState(1);
  const [selectedAlergenos, setSelectedAlergenos] = useState<string[]>([]);

  // Obtener alérgenos según el tipo seleccionado
  const getAlergenosByType = (tipo: string) => {
    switch (tipo) {
      case 'A':
        return ALERGENOS_DATA.alxoidA;
      case 'B':
      case 'B.2':
        return ALERGENOS_DATA.alxoidB;
      default:
        return ALERGENOS_DATA.alxoidA;
    }
  };

  // Limpiar alérgenos seleccionados cuando cambie el tipo
  const handleTipoChange = (newTipo: string) => {
    setTipoAlxoid(newTipo);
    setSelectedAlergenos([]); // Limpiar selección al cambiar tipo
  };

  const handleAdd = () => {
    if (selectedAlergenos.length === 0) {
      alert('Por favor, seleccione al menos un alérgeno.');
      return;
    }

    onAdd({
      subtipo: `ALXOID_${tipoAlxoid}`,
      nombreProducto: `Alxoid Tipo ${tipoAlxoid}`,
      cantidad: dosis,
      alergenos: selectedAlergenos,
    });

    // Reset local state
    setTipoAlxoid('A');
    setDosis(1);
    setSelectedAlergenos([]);
  }

  const alergenosDisponibles = getAlergenosByType(tipoAlxoid);

  return (
    <div className="p-4 border rounded-md bg-slate-50 space-y-4">
      <h4 className="font-semibold text-lg">Alxoid</h4>
      <Label>Tipo</Label>
      <Select value={tipoAlxoid} onValueChange={handleTipoChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="A">Tipo A</SelectItem>
          <SelectItem value="B">Tipo B</SelectItem>
          <SelectItem value="B.2">Tipo B.2</SelectItem>
        </SelectContent>
      </Select>
      <Label>¿Cuántas dosis? (1-10)</Label>
      <Input type="number" value={dosis} onChange={(e) => setDosis(Number(e.target.value))} min="1" max="10" />
      <div>
        <Label>Alérgenos (Tipo {tipoAlxoid})</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
          {alergenosDisponibles.map(alergeno => (
            <div key={alergeno} className="flex items-center space-x-2">
              <Checkbox 
                id={`alxoid-${alergeno}`}
                onCheckedChange={(checked) => {
                  setSelectedAlergenos(prev => checked ? [...prev, alergeno] : prev.filter(a => a !== alergeno))
                }}
                checked={selectedAlergenos.includes(alergeno)}
              />
              <Label htmlFor={`alxoid-${alergeno}`}>{alergeno}</Label>
            </div>
          ))}
        </div>
      </div>
      <Button onClick={handleAdd} type="button" className="w-full">Añadir Detalle de Alxoid</Button>
    </div>
  )
}

function SublingualForm({ onAdd }: { onAdd: (detail: InventoryUsageDetailInput) => void }) {
  const [numeroFrasco, setNumeroFrasco] = useState(1);
  const [selectedAlergenos, setSelectedAlergenos] = useState<string[]>([]);

  const handleAdd = () => {
    if (selectedAlergenos.length === 0) {
      alert('Por favor, seleccione al menos un alérgeno.');
      return;
    }

    onAdd({
      subtipo: 'SUBLINGUAL',
      nombreProducto: `Sublingual Frasco #${numeroFrasco}`,
      cantidad: 1, // La cantidad es implícitamente 1 frasco
      alergenos: selectedAlergenos,
      frasco: numeroFrasco.toString(),
    });

    // Reset local state
    setNumeroFrasco(1);
    setSelectedAlergenos([]);
  }

  return (
    <div className="p-4 border rounded-md bg-slate-50 space-y-4">
      <h4 className="font-semibold text-lg">Sublingual</h4>
      <Label>Número de frasco (1-4)</Label>
      <Input type="number" value={numeroFrasco} onChange={(e) => setNumeroFrasco(Number(e.target.value))} min="1" max="4" />
      
      <div>
        <Label>Alérgenos</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
          {ALERGENOS_DATA.sublingual.map(alergeno => (
            <div key={alergeno} className="flex items-center space-x-2">
              <Checkbox 
                id={`sublingual-${alergeno}`}
                onCheckedChange={(checked) => {
                  setSelectedAlergenos(prev => checked ? [...prev, alergeno] : prev.filter(a => a !== alergeno))
                }}
                checked={selectedAlergenos.includes(alergeno)}
              />
              <Label htmlFor={`sublingual-${alergeno}`}>{alergeno}</Label>
            </div>
          ))}
        </div>
      </div>
      <Button onClick={handleAdd} type="button" className="w-full">Añadir Detalle de Sublingual</Button>
    </div>
  )
}

// --- MAIN FORM COMPONENT ---

export function InmunoterapiaForm({ append, fields, onBack }: { append: (value: any[]) => void, fields: any[], onBack?: () => void }) {
  const [subType, setSubType] = useState<keyof typeof INMUNOTERAPIA_SUBTYPES | null>(null)
  const [localItems, setLocalItems] = useState<InventoryUsageDetailInput[]>([])

  const handleAddLocal = (detail: InventoryUsageDetailInput) => {
    setLocalItems(prev => [...prev, detail])
  }

  const handleRemoveLocal = (idx: number) => {
    setLocalItems(localItems.filter((_, i) => i !== idx))
  }

  const handleSaveAll = () => {
    if (localItems.length === 0) return
    append(localItems)
    setLocalItems([])
  }

  const handleCancel = () => {
    setLocalItems([])
  }

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inmunoterapia</CardTitle>
        {onBack && (
          <Button type="button" variant="outline" size="sm" onClick={onBack} className="ml-auto">
            Regresar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div>
          <Label>Subtipo de Inmunoterapia</Label>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {Object.entries(INMUNOTERAPIA_SUBTYPES).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`flex-1 px-4 py-3 rounded-xl border-2 shadow-sm text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 hover:scale-[1.03] hover:shadow-md bg-white
                  ${subType === key ? 'border-primary ring-2 ring-primary/30 bg-primary/5 text-primary' : 'border-gray-200 text-gray-900'}`}
                onClick={() => setSubType(key as keyof typeof INMUNOTERAPIA_SUBTYPES)}
                tabIndex={0}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {subType === 'glicerinado' && <GlicerinadoForm onAdd={handleAddLocal} />}
        {subType === 'alxoid' && <AlxoidForm onAdd={handleAddLocal} />}
        {subType === 'sublingual' && <SublingualForm onAdd={handleAddLocal} />}
        <div className="space-y-2 pt-4">
          <h3 className="text-sm font-medium">Detalles locales (sin guardar):</h3>
          <LocalList localItems={localItems} onRemove={handleRemoveLocal} />
          <div className="flex gap-2 mt-2">
            <Button type="button" onClick={handleSaveAll} disabled={localItems.length === 0}>Guardar todos</Button>
            <Button type="button" onClick={handleCancel} variant="outline" disabled={localItems.length === 0}>Cancelar</Button>
          </div>
        </div>
        <div className="space-y-2 pt-4">
          <h3 className="text-sm font-medium">Detalles ya guardados:</h3>
          <LocalList localItems={fields} onRemove={() => {}} />
        </div>
      </CardContent>
    </Card>
  )
} 