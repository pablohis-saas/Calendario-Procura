# 🏥 Sistema de Inventario Médico

Sistema completo de gestión de inventario para clínicas médicas, desarrollado con Next.js 14, NestJS, Prisma y PostgreSQL.

## 🚀 Características

- **Gestión de Inventario**: Entrada, salida y uso de productos médicos
- **Dashboard en Tiempo Real**: Métricas, alertas de stock bajo y productos más usados
- **Categorización**: Organización por tipos (Vacunas, Alérgenos, Pruebas, etc.)
- **Alertas Inteligentes**: Stock bajo, productos inmobilizados, fechas de vencimiento
- **Autenticación JWT**: Sistema seguro de usuarios y roles
- **API RESTful**: Backend robusto con NestJS
- **Frontend Moderno**: Interfaz responsive con Next.js y Tailwind CSS

## 🛠 Tecnologías

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **Radix UI**

### Backend
- **NestJS**
- **Prisma ORM**
- **PostgreSQL** (Supabase)
- **JWT Authentication**

### Herramientas
- **GitHub** (Control de versiones)
- **Supabase** (Base de datos en la nube)

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- PostgreSQL (local o Supabase)
- Git

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd Inventario
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/base_datos"

# JWT
JWT_SECRET="tu_jwt_secret_super_seguro"

# Otros
NODE_ENV="development"
```

### 4. Configurar la base de datos
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Poblar con datos de ejemplo
npx prisma db seed
```

### 5. Ejecutar el proyecto
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
Inventario/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard principal
│   ├── inventory/         # Gestión de inventario
│   └── actions/           # Server Actions
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Shadcn)
│   ├── dashboard/        # Componentes del dashboard
│   └── inventory-*/      # Componentes de inventario
├── src/                  # Backend NestJS
│   ├── auth/             # Autenticación
│   ├── dashboard/        # API del dashboard
│   ├── inventory/        # API de inventario
│   └── prisma/           # Configuración de Prisma
├── prisma/               # Esquema y migraciones
├── schemas/              # Validaciones Zod
├── types/                # Tipos TypeScript
└── lib/                  # Utilidades y configuraciones
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="..."

# Entorno
NODE_ENV="development"

# URLs (opcional)
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Ejecutar en modo desarrollo
npm run build            # Construir para producción
npm run start            # Ejecutar en modo producción

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Poblar con datos de ejemplo
npm run db:studio        # Abrir Prisma Studio

# Linting y formateo
npm run lint             # Ejecutar ESLint
npm run format           # Formatear código
```

## 📊 Funcionalidades Principales

### Dashboard
- **Métricas en Tiempo Real**: Valor total del inventario, movimientos recientes
- **Alertas**: Stock bajo, productos inmobilizados, vencimientos
- **Gráficos**: Productos más usados, distribución por categorías
- **Filtros**: Por fecha, categoría, sede

### Gestión de Inventario
- **Entrada de Productos**: Registrar nuevos productos con lotes y fechas
- **Salida de Productos**: Control de salidas con trazabilidad
- **Uso de Productos**: Registro de uso en tratamientos
- **Categorización**: Organización automática por tipo

### Reportes
- **Movimientos Recientes**: Historial de entradas/salidas
- **Productos Inmobilizados**: Items sin movimiento
- **Alertas de Stock**: Productos con stock bajo
- **Análisis de Uso**: Productos más utilizados

## 🔐 Autenticación y Seguridad

- **JWT Tokens**: Autenticación stateless
- **Roles de Usuario**: Diferentes niveles de acceso
- **Validación de Datos**: Zod schemas
- **CORS Configurado**: Seguridad en requests
- **Variables de Entorno**: Configuración segura

## 🚀 Despliegue

### Opciones de Despliegue

1. **Vercel** (Frontend Next.js)
2. **Railway** (Backend NestJS)
3. **Supabase** (Base de datos)
4. **Docker** (Contenedores)

### Variables de Entorno para Producción

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://tu-api.com"
```

## 🤝 Contribución

### Flujo de Trabajo

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crea** un Pull Request

### Estándares de Código

- **TypeScript** en todo el código
- **ESLint** y **Prettier** para formateo
- **Commits** descriptivos
- **Tests** para nuevas funcionalidades

## 📝 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil

### Dashboard
- `GET /dashboard` - Métricas principales

### Inventario
- `GET /inventory/products` - Listar productos
- `POST /inventory/entry` - Registrar entrada
- `POST /inventory/exit` - Registrar salida
- `POST /inventory/use` - Registrar uso

## 🔗 Integración con Módulo de Cobros

Este sistema está diseñado para integrarse con un módulo de cobros externo:

### Endpoints Esperados del Módulo de Cobros
- `POST /payments` - Crear pago
- `GET /payments/:id` - Consultar estado de pago
- `GET /payments` - Listar pagos

### Flujo de Integración
1. **Frontend** → **Backend NestJS** → **Módulo de Cobros**
2. **Autenticación JWT** compartida
3. **Validación** de pagos antes de liberar productos

## 📞 Soporte

Para soporte técnico o preguntas sobre la integración:

- **Desarrollador Principal**: [Tu nombre]
- **Colaborador**: [Nombre de tu compadre]
- **Email**: [tu-email@ejemplo.com]

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

---

**Desarrollado con ❤️ para la gestión eficiente de inventarios médicos** 