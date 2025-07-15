'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InventoryUsageDetailInput } from '@/schemas/inventory-usage'

interface SimpleTreatmentFormProps {
  title: string;
  subtipo: string;
  items: readonly string[];
  append: (value: any) => void;
  fields: any[];
  maxQuantity?: number;
  isLoading?: boolean;
  error?: string | null;
}

export function SimpleTreatmentForm({ 
  title, 
  subtipo, 
  items, 
  append, 
  fields, 
  maxQuantity = 10,
  isLoading = false,
  error = null
}: SimpleTreatmentFormProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})
  const [lastAddedItem, setLastAddedItem] = useState<string>('')
  const [customQuantity, setCustomQuantity] = useState<Record<string, string>>({})

  const handleAddItem = (itemName: string, quantity: number) => {
    append({
      subtipo: subtipo,
      nombreProducto: itemName,
      cantidad: quantity,
      categoria: subtipo,
    });
    setLastAddedItem(`${itemName} (${quantity})`)
    setTimeout(() => setLastAddedItem(''), 3000)
    setSelectedItems(prev => {
      const newState = { ...prev };
      delete newState[itemName];
      return newState;
    });
    setCustomQuantity(prev => {
      const newState = { ...prev };
      delete newState[itemName];
      return newState;
    });
  }

  const quickQuantities = [1, 2, 3]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {lastAddedItem && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            ✅ Agregado: {lastAddedItem}
          </div>
        )}
        {isLoading && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            🔄 Cargando productos...
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            ⚠️ Error: {error}
          </div>
        )}
        <div className="text-sm text-blue-600">
          Items en formulario: {fields.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border rounded-md gap-2">
            <Label htmlFor={`item-${item}`}>{item}</Label>
            <div className="flex flex-wrap items-center gap-2">
              {quickQuantities.map((qty) => (
                <Button
                  key={qty}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="min-w-[2.5rem]"
                  onClick={() => handleAddItem(item, qty)}
                >
                  {qty}
                </Button>
              ))}
              <input
                type="number"
                min={1}
                max={maxQuantity}
                value={customQuantity[item] ?? ''}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setCustomQuantity(prev => ({ ...prev, [item]: val }))
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customQuantity[item] && Number(customQuantity[item]) > 0) {
                    handleAddItem(item, Number(customQuantity[item]))
                  }
                }}
                placeholder="Otra"
                className="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary/40 text-center"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (customQuantity[item] && Number(customQuantity[item]) > 0) {
                    handleAddItem(item, Number(customQuantity[item]))
                  }
                }}
                disabled={!customQuantity[item] || Number(customQuantity[item]) < 1}
              >
                Añadir
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 