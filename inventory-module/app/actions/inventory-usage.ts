'use server'
import { inventoryUsageSchema, InventoryUsageInput, InventoryUsageDetailInput } from '@/schemas/inventory-usage'
import { createSafeActionClient } from 'next-safe-action'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const action = createSafeActionClient()

// Función para mapear productos del frontend a IDs del backend
async function mapProductToId(nombreProducto: string, subtipo: string): Promise<string | null> {
  console.log('🔍 FRONTEND: Searching for product:', nombreProducto, 'with subtipo:', subtipo);
  
  // Mapeo específico para productos que no coinciden exactamente
  const productMappings: Record<string, string> = {
    'Glicerinado por Unidad': 'Glicerinado Frasco #1',
    'Glicerinado Madre': 'Glicerinado Frasco #2',
    'Glicerinado Hija': 'Glicerinado Frasco #3',
    // No mapeamos directamente 'Glicerinado en Frasco' aquí
  };
  
  // Si hay un mapeo específico, usarlo
  const mappedName = productMappings[nombreProducto];
  if (mappedName) {
    console.log('🔄 FRONTEND: Mapping', nombreProducto, 'to', mappedName);
    nombreProducto = mappedName;
  }
  
  // Lógica especial para 'Glicerinado en Frasco': buscar el primer frasco disponible
  if (nombreProducto === 'Glicerinado en Frasco') {
    const frascos = await prisma.product.findMany({
      where: {
        name: {
          startsWith: 'Glicerinado Frasco #',
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
    });
    if (frascos.length > 0) {
      console.log('🔄 FRONTEND: Mapping Glicerinado en Frasco to', frascos[0].name);
      return frascos[0].id;
    } else {
      console.log('❌ FRONTEND: No frascos found for Glicerinado en Frasco');
      return null;
    }
  }

  // Lógica especial para 'Sublingual': mapear nombre con # a nombre sin #
  if (nombreProducto.startsWith('Sublingual Frasco #')) {
    const numeroFrasco = nombreProducto.replace('Sublingual Frasco #', '');
    const nombreMapeado = `Sublingual Frasco ${numeroFrasco}`;
    console.log('🔄 FRONTEND: Mapping', nombreProducto, 'to', nombreMapeado);
    nombreProducto = nombreMapeado;
  }
  
  // Buscar producto por nombre en la base de datos
  const product = await prisma.product.findFirst({
    where: {
      name: {
        contains: nombreProducto,
        mode: 'insensitive'
      }
    }
  })
  
  if (product) {
    console.log('✅ FRONTEND: Found product:', product.name, 'with ID:', product.id);
  } else {
    console.log('❌ FRONTEND: No product found for:', nombreProducto);
    // Listar todos los productos disponibles para debug
    const allProducts = await prisma.product.findMany({
      where: { name: { contains: 'glicerinado', mode: 'insensitive' } }
    });
    console.log('🔍 FRONTEND: Available glicerinado products:', allProducts.map((p: any) => p.name));
  }
  
  return product?.id || null
}

// Función para obtener sede y usuario por defecto (actualizada con datos reales)
async function getDefaultSedeAndUser() {
  // Usar la sede de Tecamachalco como default
  const sede = await prisma.sede.findFirst({
    where: { name: 'Clínica Tecamachalco' }
  })
  
  // Usar la enfermera de Tecamachalco como default
  const user = await prisma.user.findFirst({
    where: { 
      role: 'NURSE',
      sedeId: sede?.id 
    }
  })
  
  return {
    sedeId: sede?.id || '',
    userId: user?.id || ''
  }
}

export const processInventoryUsage = action
  .schema(inventoryUsageSchema)
  .action(async ({ parsedInput }: { parsedInput: InventoryUsageInput }) => {
    try {
      console.log('Procesando datos de uso de inventario:', parsedInput)

      const items = parsedInput.items as InventoryUsageDetailInput[]
      // 1. Obtener sede y usuario por defecto
      const { sedeId, userId } = await getDefaultSedeAndUser()
      if (!sedeId || !userId) {
        console.warn('No se encontró sede o usuario por defecto')
        return { failure: 'No se encontró sede o usuario por defecto para registrar el movimiento.' }
      }
      // 2. Mapear items a formato del backend
      const backendItems = []
      for (const item of items) {
        const productId = await mapProductToId(item.nombreProducto, item.subtipo)
        if (productId) {
          let allergenIds: string[] = []
          if (item.alergenos && item.alergenos.length > 0) {
            const foundAllergens = await prisma.allergen.findMany({
              where: {
                name: { in: item.alergenos }
              },
              select: { id: true }
            })
            allergenIds = foundAllergens.map((a: { id: string }) => a.id)
          }
          let doses = 1
          if ('doses' in item && typeof item.doses === 'number') {
            doses = item.doses
          } else if (typeof item.cantidad === 'number' && item.cantidad > 0) {
            doses = item.cantidad
          }

          // --- CORRECCIÓN DE FRASCOS ---
          let frascoLevels: number[] | undefined = undefined
          if (item.subtipo === 'GLICERINADO_FRASCO' && typeof item.frasco === 'string') {
            // Extrae todos los números de la cadena y los convierte a índices base 0
            frascoLevels = item.frasco
              .replace(/Frascos?:/i, '')
              .split(',')
              .map(f => parseInt(f.trim(), 10) - 1)
              .filter(f => !isNaN(f))
          }

          if (item.subtipo === 'GLICERINADO_FRASCO' && frascoLevels && frascoLevels.length > 0) {
            backendItems.push({
              productId,
              doses,
              frascoLevels,
              allergenIds,
            })
          } else if (item.subtipo === 'GLICERINADO_UNIDAD') {
            // Mapear el campo frasco a frascoType
            let frascoType = 'madre'; // default
            if (item.frasco) {
              const frascoLower = item.frasco.toLowerCase();
              if (frascoLower === 'amarillo') {
                frascoType = 'amarillo';
              } else if (frascoLower === 'verde') {
                frascoType = 'verde';
              } else if (frascoLower === 'madre') {
                frascoType = 'madre';
              }
            }
            
            backendItems.push({
              productId,
              units: item.cantidad || 1,
              doses: item.doses || 1,
              allergenIds,
              frascoType,
            })
          } else if (item.subtipo.startsWith('ALXOID')) {
            // Alxoid necesita doses
            backendItems.push({
              productId,
              doses: item.doses || item.cantidad || 1,
              allergenIds,
            })
          } else if (item.subtipo === 'SUBLINGUAL') {
            // Sublingual necesita frascoFactor
            const frascoFactor = parseInt(item.frasco || '1', 10);
            backendItems.push({
              productId,
              frascoFactor,
              allergenIds,
            })
          } else {
            // Otros productos
            backendItems.push({
              productId,
              quantity: item.cantidad || 1,
              allergenIds,
            })
          }
        }
      }
      // 3. Llamar al backend si hay productos válidos
      if (backendItems.length > 0) {
        try {
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
          const backendPayload = {
            sedeId,
            userId,
            nombrePaciente: parsedInput.nombrePaciente,
            tipoTratamiento: parsedInput.tipoTratamiento,
            observaciones: parsedInput.observaciones || '',
            tuvoReaccion: parsedInput.tuvoReaccion,
            descripcionReaccion: parsedInput.descripcionReaccion || '',
            items: backendItems
          };
          console.log('🚀 FRONTEND: Sending to backend:', JSON.stringify(backendPayload, null, 2));
          console.log('🚀 FRONTEND: Backend URL:', `${backendUrl}/api/inventory/usage`);
          const response = await fetch(`${backendUrl}/api/inventory/usage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendPayload)
          })
          const responseText = await response.text();
          console.log('🚀 FRONTEND: Backend response status:', response.status);
          console.log('🚀 FRONTEND: Backend response text:', responseText);
          if (!response.ok) {
            console.error('Error del backend:', response.statusText)
            return { failure: responseText || 'Error del backend al registrar la salida.' }
          } else {
            console.log('Inventario actualizado exitosamente')
            return { success: '¡Salida de inventario registrada con éxito!' }
          }
        } catch (backendError) {
          console.error('Error conectando con el backend:', backendError)
          return { failure: 'Error conectando con el backend.' }
        }
      } else {
        console.log('⚠️ FRONTEND: No valid products found, skipping backend call');
        return { failure: 'No se encontraron productos válidos para registrar.' }
      }
    } catch (error) {
      console.error('Error procesando uso de inventario:', error)
      return { failure: 'Ocurrió un error al registrar la salida.' }
    }
  }) 