"use client";

import React, { useState, useEffect } from 'react'
import SupplierAutocomplete from './SupplierAutocomplete'
import NewProductForm from './NewProductForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Categorías y productos según base de datos
const PRODUCT_CATEGORIES = [
  {
    name: 'Alérgenos Alxoid',
    products: [
      'Cupressus Arizónica', 'Fresno', 'Gramínea con sinodon', 'Sinodon', '6 Gramíneas',
      'Ambrosía A', 'Ácaros A', 'Encino A', 'Gato A', 'Perro A',
      'Cupressus Arizónica B', 'Fresno B', 'Gramínea con sinodon B', 'Sinodon B', '6 Gramíneas B',
      'Ambrosía B', 'Ácaros B', 'Encino B', 'Gato B', 'Perro B',
    ],
    isAlxoid: true,
  },
  {
    name: 'Alérgenos',
    products: [
      'Abedul', 'Ácaros', 'Álamo del este', 'Alheña', 'Ambrosía', 'Caballo', 'Camarón',
      'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Mezcla cucarachas',
      'Mezcla pastos', 'Mezquite', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Sweet gum', 'Trueno',
    ],
    isAlxoid: true,
  },
  {
    name: 'Vacunas Pediátricas',
    products: [
      'Adacel Boost', 'Gardasil', 'Gardasil 9', 'Hepatitis A y B', 'Fiebre Amarilla', 'Herpes Zóster',
      'Hexacima', 'Influenza', 'Menactra', 'MMR', 'Prevenar 13 V', 'Proquad', 'Pulmovax', 'Rota Teq', 'Vaqta', 'Varivax',
    ],
  },
  {
    name: 'Medicamentos',
    products: [
      'Bacmune', 'Transferón', 'Diprospán', 'Nebulización',
    ],
  },
  {
    name: 'Gammaglobulina',
    products: [
      'Hizentra 4GR', 'Hizentra 2GR', 'TENGELINE 10% 5G/50ML', 'TENGELINE 10G/100ML', 'HIGLOBIN 10GR',
    ],
  },
]

interface Product {
  id: string
  name: string
}

interface EntryProduct {
  category: string
  name: string
  productId: string
  quantity: number
  price: number
  expiry?: string
  mlPerVial?: number // Solo para Alxoid
}

type ProductSelectionMode = 'existing' | 'new' | null;

export default function InventoryEntryForm() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState<string>('1')
  const [price, setPrice] = useState<string>('0')
  const [expiry, setExpiry] = useState('')
  const [mlPerVial, setMlPerVial] = useState<string>('1')
  const [entryProducts, setEntryProducts] = useState<EntryProduct[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productSelectionMode, setProductSelectionMode] = useState<ProductSelectionMode>(null)
  const [showNewProductForm, setShowNewProductForm] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory)
    }
  }, [selectedCategory])

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      } else {
        console.error('Error fetching products: status', res.status)
        setSaveMessage('Error al cargar productos. Intenta recargar la página.')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setSaveMessage('Error al cargar productos. Intenta recargar la página.')
    }
  }

  async function fetchProductsByCategory(categoryName: string) {
    try {
      const res = await fetch(`/api/products/category/${encodeURIComponent(categoryName)}`)
      if (res.ok) {
        const data = await res.json()
        console.log(`Productos recibidos para categoría "${categoryName}":`, data)
        setProducts(data)
      } else {
        console.error(`Error fetching products by category (${categoryName}): status`, res.status)
        setSaveMessage(`Error al cargar productos de la categoría "${categoryName}". Intenta recargar la página.`)
      }
    } catch (error) {
      console.error('Error fetching products by category:', error)
      setSaveMessage(`Error al cargar productos de la categoría "${categoryName}". Intenta recargar la página.`)
      // Fallback a productos hardcodeados si hay error
      const currentCategory = PRODUCT_CATEGORIES.find(c => c.name === categoryName)
      if (currentCategory) {
        const fallbackProducts = currentCategory.products.map((name, index) => ({
          id: `fallback-${index}`,
          name
        }))
        setProducts(fallbackProducts)
      }
    }
  }

  const currentCategory = PRODUCT_CATEGORIES.find(c => c.name === selectedCategory)
  const isAlxoid = currentCategory?.isAlxoid

  // Map product name to id
  function getProductIdByName(name: string) {
    const availableProducts = getAvailableProducts()
    const found = availableProducts.find(p => p.name === name)
    return found ? found.id : ''
  }

  function handleProductCreated(newProduct: { id: string; name: string }) {
    // Recargar productos de la categoría actual para incluir el nuevo
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory)
    }
    
    // Seleccionar automáticamente el nuevo producto
    setSelectedProduct(newProduct.name)
    setSelectedProductId(newProduct.id)
    
    // Ocultar el formulario de nuevo producto
    setShowNewProductForm(false)
    setProductSelectionMode('existing')
    
    // Limpiar el formulario de nuevo producto
    setPrice('0')
  }

  function handleAddProduct() {
    if (!selectedCategory || !selectedProduct) return
    if (!quantity || Number(quantity) <= 0 || !price || Number(price) <= 0) return
    const productId = selectedProductId || getProductIdByName(selectedProduct)
    if (!productId) {
      alert('Error: No se pudo obtener el ID del producto. Por favor, selecciona el producto nuevamente.')
      return
    }
    setEntryProducts(prev => [
      ...prev,
      {
        category: selectedCategory,
        name: selectedProduct,
        productId,
        quantity: isAlxoid ? Number(quantity) * Number(mlPerVial) : Number(quantity),
        price: Number(price),
        expiry: expiry || undefined,
        mlPerVial: isAlxoid ? Number(mlPerVial) : undefined,
      },
    ])
    setSelectedProduct('')
    setSelectedProductId('')
    setQuantity('1')
    setPrice('0')
    setExpiry('')
    setMlPerVial('1')
    setProductSelectionMode(null)
  }

  function handleRemoveProduct(index: number) {
    setEntryProducts(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const res = await fetch('/api/inventory-entry/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: entryProducts.map(p => ({
            productId: p.productId,
            quantity: p.quantity,
            unitCost: p.price,
            expiryDate: p.expiry,
            supplierName: 'Proveedor demo', // TODO: integrar proveedor real
            sedeId: 'sede-tecamachalco',
            userId: '590c7231-dabf-4224-abb4-25576c349cb8', // Dr. Carlos García
          })),
          entryDate: new Date().toISOString().slice(0, 10),
        }),
      })
      if (!res.ok) {
        const text = await res.text();
        console.error('Error al registrar entrada:', text)
        throw new Error(text || 'Error al registrar entrada')
      }
      setSaveMessage('¡Entrada registrada exitosamente!')
      setEntryProducts([])
    } catch (err) {
      console.error('Error en handleSave:', err)
      setSaveMessage('Error al registrar entrada: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsSaving(false)
    }
  }

  function resetProductSelection() {
    setSelectedProduct('')
    setSelectedProductId('')
    setProductSelectionMode(null)
    setShowNewProductForm(false)
  }

  // Obtener productos para mostrar en el selector
  function getAvailableProducts() {
    console.log('getAvailableProducts - products:', products)
    console.log('getAvailableProducts - selectedCategory:', selectedCategory)
    
    // Si hay productos dinámicos, usarlos
    if (products.length > 0) {
      console.log('Usando productos dinámicos:', products.length)
      return products
    }
    
    // Fallback a productos hardcodeados
    const currentCategory = PRODUCT_CATEGORIES.find(c => c.name === selectedCategory)
    if (currentCategory) {
      const fallbackProducts = currentCategory.products.map((name, index) => ({
        id: `fallback-${index}`,
        name
      }))
      console.log('Usando productos fallback:', fallbackProducts.length)
      return fallbackProducts
    }
    
    console.log('No hay productos disponibles')
    return []
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Agregar productos a la entrada</h2>
      
      {/* Selección de categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <select 
          value={selectedCategory} 
          onChange={e => {
            setSelectedCategory(e.target.value)
            resetProductSelection()
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona una categoría</option>
          {PRODUCT_CATEGORIES.map(cat => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Selección de producto */}
      {selectedCategory && !showNewProductForm && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
          
          {/* Botones de selección de modo */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setProductSelectionMode('existing')}
              className={`px-3 py-1 text-sm rounded-md ${
                productSelectionMode === 'existing' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Producto Existente
            </button>
            <button
              type="button"
              onClick={() => {
                setProductSelectionMode('new')
                setShowNewProductForm(true)
              }}
              className={`px-3 py-1 text-sm rounded-md ${
                productSelectionMode === 'new' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Nuevo Producto
            </button>
          </div>

          {/* Selector de producto existente */}
          {productSelectionMode === 'existing' && (
            <select 
              value={selectedProduct} 
              onChange={e => {
                setSelectedProduct(e.target.value)
                setSelectedProductId(getProductIdByName(e.target.value))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un producto</option>
              {getAvailableProducts().map(prod => (
                <option key={prod.id} value={prod.name}>{prod.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Formulario de nuevo producto */}
      {showNewProductForm && (
        <NewProductForm
          onProductCreated={handleProductCreated}
          onCancel={() => setShowNewProductForm(false)}
          selectedCategory={selectedCategory}
        />
      )}

      {/* Campos de entrada para producto seleccionado */}
      {selectedProduct && !showNewProductForm && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-800">Detalles del producto: {selectedProduct}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input 
                type="number" 
                min={1} 
                value={quantity}
                onChange={e => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {isAlxoid && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ml por frasco</label>
                <input 
                  type="number" 
                  min={1} 
                  value={mlPerVial}
                  onChange={e => setMlPerVial(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input 
                type="number" 
                min={0} 
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caducidad (opcional)</label>
              <input 
                type="date" 
                value={expiry} 
                onChange={e => setExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleAddProduct}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Agregar al resumen
          </button>
        </div>
      )}

      {/* Resumen de productos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumen de productos</h3>
        {entryProducts.length === 0 && (
          <p className="text-gray-500 italic">No hay productos agregados.</p>
        )}
        <ul className="space-y-2">
          {entryProducts.map((prod, i) => (
            <li key={i} className="flex justify-between items-center p-3 bg-white border rounded-lg">
              <div>
                <span className="font-medium text-gray-800">[{prod.category}] {prod.name}</span>
                <div className="text-sm text-gray-600">
                  Cantidad: {prod.quantity} — Precio: ${prod.price}
                  {prod.expiry && ` — Caducidad: ${prod.expiry}`}
                  {prod.mlPerVial && ` — ml/frasco: ${prod.mlPerVial}`}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => handleRemoveProduct(i)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón de guardar */}
      {entryProducts.length > 0 && (
        <button 
          type="button" 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {isSaving ? 'Guardando...' : 'Registrar entrada'}
        </button>
      )}

      {/* Mensaje de estado */}
      {saveMessage && (
        <div className={`p-3 rounded-md mt-4 ${
          saveMessage.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {saveMessage}
        </div>
      )}
    </div>
  )
} 