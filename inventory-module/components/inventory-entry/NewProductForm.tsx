"use client";

import React, { useState } from 'react';
import { ProductType, ProductUnit } from '@prisma/client';

interface NewProductFormProps {
  onProductCreated: (product: { id: string; name: string }) => void;
  onCancel: () => void;
  selectedCategory: string;
}

export default function NewProductForm({ onProductCreated, onCancel, selectedCategory }: NewProductFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>(ProductType.SIMPLE);
  const [unit, setUnit] = useState<ProductUnit>(ProductUnit.PIECE);
  const [description, setDescription] = useState('');
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determinar el tipo y unidad por defecto basado en la categoría
  React.useEffect(() => {
    if (selectedCategory === 'Alérgenos Alxoid') {
      setType(ProductType.COMPLEX);
      setUnit(ProductUnit.ML);
    } else if (selectedCategory === 'Alérgenos') {
      setType(ProductType.SIMPLE);
      setUnit(ProductUnit.ML);
    } else {
      setType(ProductType.SIMPLE);
      setUnit(ProductUnit.PIECE);
    }
  }, [selectedCategory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }
    if (costPerUnit <= 0) {
      setError('El costo por unidad debe ser mayor a 0');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          unit,
          description: description.trim() || undefined,
          costPerUnit,
          minStockLevel,
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear el producto');
      }

      const newProduct = await response.json();
      onProductCreated(newProduct);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el producto');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Nuevo Producto - {selectedCategory}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el nombre del producto"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del producto"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ProductType.SIMPLE}>Simple</option>
              <option value={ProductType.COMPLEX}>Complejo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Unidad
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as ProductUnit)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ProductUnit.PIECE}>Pieza</option>
              <option value={ProductUnit.ML}>Mililitros</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Costo por Unidad *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Stock Mínimo
            </label>
            <input
              type="number"
              min="1"
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creando...' : 'Crear Producto'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 