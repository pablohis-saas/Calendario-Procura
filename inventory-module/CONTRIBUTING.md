# 🤝 Guía de Contribución - Integración con Módulo de Cobros

Esta guía está diseñada específicamente para la integración entre el **Sistema de Inventario** y el **Módulo de Cobros**.

## 🎯 Objetivo

Integrar ambos módulos de forma segura y eficiente, manteniendo la separación de responsabilidades y la escalabilidad del sistema.

## 📋 Checklist de Preparación

### Antes de Empezar
- [ ] Repositorio configurado en GitHub
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada a Supabase
- [ ] Documentación actualizada
- [ ] Colaboradores invitados al repositorio

## 🔗 Arquitectura de Integración

### Flujo de Datos
```
Frontend (Next.js) → Backend (NestJS) → Módulo de Cobros
```

### Puntos de Integración
1. **Creación de Pagos**: Al registrar salidas de inventario
2. **Validación de Pagos**: Antes de liberar productos
3. **Sincronización**: Estado de pagos y movimientos de inventario

## 🛠 Configuración del Entorno

### Variables de Entorno Requeridas

```env
# Base de datos (Inventario)
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"

# JWT (Compartido entre módulos)
JWT_SECRET="shared_jwt_secret"

# Módulo de Cobros
PAYMENTS_API_URL="https://cobros-api.com"
PAYMENTS_API_KEY="your_api_key"

# Entorno
NODE_ENV="development"
```

### Endpoints de Integración

#### Endpoints que EXPONE el Módulo de Cobros
```typescript
// Crear pago
POST /payments
{
  "amount": number,
  "currency": "MXN",
  "description": string,
  "movementId": string,
  "userId": string
}

// Consultar estado de pago
GET /payments/:id
Response: {
  "id": string,
  "status": "pending" | "paid" | "failed",
  "amount": number,
  "createdAt": string
}

// Listar pagos por movimiento
GET /payments?movementId=:id
```

#### Endpoints que CONSUME el Sistema de Inventario
```typescript
// Validar pago antes de liberar producto
GET /payments/:id/validate

// Crear pago automático al registrar salida
POST /payments (proxy desde NestJS)
```

## 🔐 Seguridad y Autenticación

### JWT Compartido
- Ambos módulos deben usar el mismo `JWT_SECRET`
- Validación de tokens en cada request
- Roles y permisos coordinados

### Headers Requeridos
```typescript
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json",
  "X-API-Key": "<PAYMENTS_API_KEY>" // Si es requerido
}
```

## 📝 Convenciones de Código

### Nomenclatura
- **Archivos**: `kebab-case` (ej: `payment-service.ts`)
- **Funciones**: `camelCase` (ej: `createPayment`)
- **Clases**: `PascalCase` (ej: `PaymentService`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `PAYMENT_STATUS`)

### Estructura de Carpetas
```
src/
├── payments/              # Integración con módulo de cobros
│   ├── dto/
│   ├── services/
│   └── controllers/
├── inventory/             # Lógica de inventario
└── shared/               # Utilidades compartidas
```

### Commits
```bash
# Formato: tipo(alcance): descripción
feat(payments): integrar creación de pagos en salidas de inventario
fix(auth): corregir validación de JWT compartido
docs(api): actualizar documentación de endpoints de cobros
```

## 🧪 Testing

### Tests Requeridos
- [ ] Creación de pagos al registrar salidas
- [ ] Validación de pagos antes de liberar productos
- [ ] Manejo de errores de comunicación entre módulos
- [ ] Autenticación JWT compartida

### Ejemplo de Test
```typescript
describe('Payment Integration', () => {
  it('should create payment when inventory exit is registered', async () => {
    // Test implementation
  });
  
  it('should validate payment before releasing product', async () => {
    // Test implementation
  });
});
```

## 🚀 Proceso de Integración

### Fase 1: Configuración Base
1. Configurar variables de entorno
2. Implementar servicios de comunicación
3. Configurar autenticación compartida

### Fase 2: Endpoints Básicos
1. Crear proxy endpoints en NestJS
2. Implementar validación de pagos
3. Sincronizar estados

### Fase 3: Flujos Complejos
1. Integrar creación automática de pagos
2. Implementar rollback en caso de errores
3. Agregar logging y monitoreo

### Fase 4: Testing y Despliegue
1. Tests de integración
2. Pruebas en ambiente de staging
3. Despliegue a producción

## 📊 Monitoreo y Logs

### Logs Requeridos
```typescript
// Creación de pago
logger.info('Payment created', { 
  movementId, 
  amount, 
  paymentId 
});

// Error de comunicación
logger.error('Payment service unavailable', { 
  error, 
  endpoint 
});
```

### Métricas a Monitorear
- Tiempo de respuesta del módulo de cobros
- Tasa de éxito en creación de pagos
- Errores de autenticación
- Latencia de validación de pagos

## 🔄 Rollback y Recuperación

### Estrategias de Rollback
1. **Rollback de Base de Datos**: Restaurar estado anterior
2. **Rollback de Código**: Revertir a versión estable
3. **Rollback de Configuración**: Restaurar variables de entorno

### Plan de Recuperación
1. Detectar fallo en integración
2. Deshabilitar integración temporalmente
3. Operar en modo standalone
4. Corregir y reactivar integración

## 📞 Comunicación

### Canales de Comunicación
- **GitHub Issues**: Para bugs y features
- **Pull Requests**: Para revisión de código
- **Discord/Slack**: Para comunicación rápida
- **Email**: Para decisiones importantes

### Responsabilidades
- **Desarrollador Inventario**: Integración en el lado del inventario
- **Desarrollador Cobros**: Endpoints y validaciones del módulo de cobros
- **Ambos**: Testing y documentación

## ✅ Checklist de Finalización

### Antes de Merge
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Variables de entorno configuradas
- [ ] Logs implementados
- [ ] Monitoreo configurado

### Antes de Producción
- [ ] Pruebas en staging
- [ ] Plan de rollback preparado
- [ ] Monitoreo activo
- [ ] Documentación de operaciones

---

**¡Gracias por contribuir a la integración exitosa de ambos módulos! 🚀** 