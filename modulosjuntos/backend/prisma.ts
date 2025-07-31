import { PrismaClient } from '@prisma/client'

// Configuración optimizada para producción multi-tenant
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configuración del pool de conexiones para producción
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Middleware para logging de queries lentas y métricas
prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  const duration = after - before
  
  // Log queries que toman más de 500ms en desarrollo, 1000ms en producción
  const slowQueryThreshold = process.env.NODE_ENV === 'development' ? 500 : 1000
  if (duration > slowQueryThreshold) {
    console.warn(`⚠️ Query lenta detectada: ${params.model}.${params.action} - ${duration}ms`)
  }
  
  // Log de métricas en producción
  if (process.env.NODE_ENV === 'production') {
    console.log(`📊 Query: ${params.model}.${params.action} - ${duration}ms`)
  }
  
  return result
})

// Middleware para manejo de errores de conexión
prisma.$use(async (params, next) => {
  try {
    return await next(params)
  } catch (error: any) {
    // Log específico para errores de conexión
    if (error.code === 'P1001' || error.code === 'P1002') {
      console.error('🚨 Error de conexión a la base de datos:', error.message)
    }
    throw error
  }
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma 