# 🏥 Sistema Integrado ProCura

Sistema médico integrado que combina módulos de **cobros** e **inventario** para una gestión completa de consultorios médicos.

## 🏗️ Estructura del Proyecto

```
modulo de cobros/
├── backend/                    # Módulo de cobros (Express + TypeScript)
│   ├── controllers/           # Controladores de cobros
│   ├── routes/               # Rutas de la API
│   ├── prisma/              # Configuración de base de datos
│   └── index.ts             # Servidor principal (puerto 3002)
├── inventory-module/         # Módulo de inventario (Next.js + NestJS)
│   ├── app/                 # Aplicación Next.js
│   ├── components/          # Componentes React
│   └── prisma/             # Configuración de base de datos
├── frontend/                # Frontend principal (React + Vite)
│   ├── src/                # Código fuente React
│   └── components/         # Componentes UI
├── shared/                  # Código compartido entre módulos
└── package.json            # Configuración principal
```

## 🚀 Inicio Rápido

### Instalación
```bash
# Instalar todas las dependencias
npm run install:all

# O instalar módulo por módulo
npm install
cd backend && npm install
cd ../inventory-module && npm install
cd ../frontend && npm install
```

### Desarrollo
```bash
# Ejecutar todos los módulos simultáneamente
npm run dev

# O ejecutar módulos individualmente
npm run dev:cobros      # Puerto 3002
npm run dev:inventory   # Puerto 5558
npm run dev:frontend    # Puerto 5173
```

## 📡 Endpoints Disponibles

### Módulo de Cobros (Puerto 3002)
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Crear paciente
- `GET /api/cobros` - Listar cobros
- `POST /api/cobros` - Crear cobro (requiere JWT)
- `GET /api/servicios` - Listar servicios
- `GET /api/consultorios` - Listar consultorios

### Módulo de Inventario (Puerto 5558)
- `POST /inventory/entry` - Entrada de inventario
- `POST /inventory/exit` - Salida de inventario
- `POST /inventory/use` - Uso de inventario
- `GET /dashboard` - Dashboard de inventario
- `GET /inventory/products` - Listar productos

## 🔐 Autenticación

Ambos módulos utilizan JWT para autenticación:
```bash
Authorization: Bearer <JWT_TOKEN>
```

## 🗄️ Base de Datos

- **Proveedor**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Compartida**: Ambos módulos usan la misma base de datos

## 🛠️ Tecnologías

### Backend Cobros
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication

### Módulo Inventario
- Next.js 14
- NestJS
- Prisma ORM
- JWT Authentication

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Shadcn UI

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev                    # Ejecutar todos los módulos
npm run dev:cobros            # Solo módulo de cobros
npm run dev:inventory         # Solo módulo de inventario
npm run dev:frontend          # Solo frontend

# Construcción
npm run build                 # Construir todos los módulos
npm run build:cobros         # Construir módulo de cobros
npm run build:inventory      # Construir módulo de inventario
npm run build:frontend       # Construir frontend

# Producción
npm run start                 # Ejecutar en producción
npm run start:cobros         # Solo cobros en producción
npm run start:inventory      # Solo inventario en producción
npm run start:frontend       # Solo frontend en producción
```

## 🔧 Configuración

### Variables de Entorno

**Backend Cobros** (`backend/.env`):
```env
PORT=3002
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
```

**Módulo Inventario** (`inventory-module/.env`):
```env
PORT=5558
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
```

## 🤝 Integración

Los módulos se comunican a través de:
- **Base de datos compartida** (Supabase)
- **Autenticación unificada** (JWT)
- **Frontend integrado** (React + Vite)

## 📊 Estado del Proyecto

- ✅ **Módulo de Cobros**: Funcionando
- ✅ **Módulo de Inventario**: Integrado
- ✅ **Frontend**: Configurado
- 🔄 **Integración**: En progreso

## 👥 Autores

- **Rodrigo Espinosa** - Módulo de Cobros
- **Pablo** - Módulo de Inventario

## 📄 Licencia

MIT License 