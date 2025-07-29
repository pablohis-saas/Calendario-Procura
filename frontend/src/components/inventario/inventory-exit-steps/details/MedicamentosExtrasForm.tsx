'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/hooks/useProducts'

// Lista de respaldo en caso de que la API falle
const medicamentosExtrasItemsBackup = [
  'Bacmune',
  'Transferón',
  'Diprospán',
  'Nebulización',
]

export function MedicamentosExtrasForm({ append }: { append: (value: any[]) => void }) {
  const { products, isLoading, error } = useProducts('Medicamentos');
  const items = products.length > 0 ? products.map(p => p.name) : medicamentosExtrasItemsBackup;
  const [localItems, setLocalItems] = useState<{ nombreProducto: string, cantidad: number }[]>([]);
  const [selected, setSelected] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const handleAdd = () => {
    if (!selected) return;
    setLocalItems([...localItems, { nombreProducto: selected, cantidad }]);
    setSelected('');
    setCantidad(1);
  };

  const handleRemove = (idx: number) => {
    setLocalItems(localItems.filter((_, i) => i !== idx));
  };

  const handleSaveAll = () => {
    if (localItems.length === 0) return;
    append(localItems.map(item => ({
      subtipo: 'MEDICAMENTOS_EXTRAS',
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      categoria: 'MEDICAMENTOS_EXTRAS',
    })));
    setLocalItems([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medicamentos Extras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-end">
          <select value={selected} onChange={e => setSelected(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Selecciona medicamento</option>
            {items.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <input type="number" min={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="w-16 border rounded px-2 py-1" />
          <Button type="button" onClick={handleAdd} disabled={!selected}>Añadir</Button>
        </div>
        <ul className="space-y-2">
          {localItems.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center border rounded p-2">
              <span>{item.nombreProducto} (x{item.cantidad})</span>
              <Button type="button" size="sm" variant="destructive" onClick={() => handleRemove(idx)}>Eliminar</Button>
            </li>
          ))}
        </ul>
        <Button type="button" onClick={handleSaveAll} disabled={localItems.length === 0}>Guardar todos</Button>
        {isLoading && <div className="text-blue-600">Cargando productos...</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
      </CardContent>
    </Card>
  );
} 