# Bravo - Sistema de Gestión Médica

Sistema completo de gestión médica con integración de Google Calendar y sistema de recordatorios WhatsApp.

## 🚀 Características Principales

### 📅 Integración Google Calendar
- ✅ Sincronización bidireccional con Google Calendar
- ✅ Autenticación OAuth2 segura
- ✅ Gestión de citas recurrentes
- ✅ Manejo de excepciones en series de citas
- ✅ Sincronización automática de cambios

### 💬 Sistema de Recordatorios WhatsApp
- ✅ Recordatorios automáticos de citas
- ✅ Botones interactivos (Confirmar/Cancelar/Reagendar)
- ✅ Respuestas automáticas de pacientes
- ✅ Notificaciones a consultorios
- ✅ Recordatorios para tratamientos semanales

### 🏥 Gestión Médica Completa
- ✅ Gestión de pacientes
- ✅ Gestión de consultorios
- ✅ Gestión de usuarios/doctores
- ✅ Sistema de cobros y conceptos
- ✅ Inventario médico
- ✅ Disponibilidad y bloqueos médicos

## 🛠️ Tecnologías

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **Prisma ORM** (PostgreSQL)
- **Google Calendar API**
- **WhatsApp Business API**

### Frontend
- **React** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Shadcn UI**

## 📁 Estructura del Proyecto

```
Bravo/
├── modulosjuntos/
│   ├── backend/                 # API REST
│   │   ├── controllers/         # Controladores
│   │   ├── routes/             # Rutas API
│   │   ├── services/           # Servicios de negocio
│   │   ├── prisma/             # Esquemas y migraciones
│   │   └── utils/              # Utilidades
│   └── frontend/               # Aplicación React
│       ├── src/
│       │   ├── components/     # Componentes React
│       │   ├── pages/          # Páginas
│       │   ├── services/       # Servicios frontend
│       │   └── types/          # Tipos TypeScript
│       └── public/             # Archivos estáticos
├── backups/                    # Respaldos automáticos
└── tests/                      # Pruebas
```

## 🚀 Inicio Rápido

### Opción 1: Un solo comando (Recomendado)
```bash
npm start
```

### Opción 2: Modo desarrollo
```bash
npm run dev
```

### Opción 3: Manual (si hay problemas)
```bash
# Terminal 1 - Backend de cobros
cd modulosjuntos/backend
npm start

# Terminal 2 - Frontend
cd modulosjuntos/frontend
npm run dev
```

## 🛠️ Configuración

### Base de Datos
- **Cobros**: PostgreSQL (Supabase)
- **Inventario**: PostgreSQL (configurado en `inventory-module`)

### Variables de Entorno
```bash
# .env (raíz del proyecto)
DATABASE_URL=postgresql://...
NODE_ENV=development
JWT_SECRET=supersecreto123

# Google Calendar
GOOGLE_CLIENT_ID="tu_client_id"
GOOGLE_CLIENT_SECRET="tu_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:3002/api/auth/google/callback"

# WhatsApp (opcional)
WHATSAPP_PHONE_NUMBER_ID="tu_phone_number_id"
WHATSAPP_ACCESS_TOKEN="tu_access_token"
```

## 📊 Puertos por Defecto

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3002

## 🔧 Comandos Útiles

```bash
# Instalar todas las dependencias
npm run install:all

# Compilar todo
npm run build

# Ejecutar tests
npm test

# Insertar datos de prueba (cobros)
cd modulosjuntos/backend
npm run seed
npm run seed-services
```

## 🔧 Configuración Google Calendar

### 1. Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita la API de Google Calendar

### 2. Configurar OAuth2
1. Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
2. Configura las URIs de redirección:
   - `http://localhost:3002/api/auth/google/callback` (desarrollo)
   - `https://tu-dominio.com/api/auth/google/callback` (producción)

### 3. Actualizar variables de entorno
```env
GOOGLE_CLIENT_ID="tu_client_id"
GOOGLE_CLIENT_SECRET="tu_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:3002/api/auth/google/callback"
```

## 📱 Configuración WhatsApp (Opcional)

### Opción 1: WhatsApp Business API (Recomendado)
1. Crear cuenta en [Meta for Developers](https://developers.facebook.com/)
2. Crear una app de WhatsApp Business
3. Obtener Phone Number ID y Access Token
4. Configurar webhook en `https://tu-dominio.com/api/whatsapp/webhook`

### Opción 2: Twilio (Más fácil pero más caro)
1. Crear cuenta en [Twilio](https://www.twilio.com/)
2. Obtener Account SID, Auth Token y número de WhatsApp
3. Configurar variables de entorno

## 📊 API Endpoints

### Google Calendar
- `GET /api/auth/google` - Iniciar autenticación
- `GET /api/auth/google/callback` - Callback de autenticación
- `GET /api/calendar/events` - Obtener eventos
- `POST /api/calendar/events` - Crear evento
- `PUT /api/calendar/events/:id` - Actualizar evento
- `DELETE /api/calendar/events/:id` - Eliminar evento

### WhatsApp
- `POST /api/whatsapp/webhook` - Webhook para mensajes
- `POST /api/whatsapp/reminder/:citaId` - Enviar recordatorio
- `POST /api/whatsapp/treatment-reminder/:pacienteId/:treatmentType` - Recordatorio de tratamiento

### Citas
- `GET /api/citas` - Obtener citas
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Eliminar cita

## 🔄 Respaldos Automáticos

El sistema incluye respaldos automáticos configurados con cron:

```bash
# Verificar respaldos
ls -la backups/

# Configurar respaldo automático (cada día a las 2 AM)
crontab -e
# Agregar: 0 2 * * * /Users/paul/Bravo/backup-script.sh
```

## 🧪 Pruebas

```bash
# Probar sistema sin WhatsApp
cd modulosjuntos/backend
node test-system.js

# Probar webhook
curl http://localhost:3002/api/whatsapp/webhook

# Probar envío de recordatorio
curl -X POST http://localhost:3002/api/whatsapp/reminder/CITA_ID
```

## 🎯 Para la Demo

1. Ejecuta `npm start` desde la raíz
2. Abre http://localhost:5173 en el navegador
3. Usa las credenciales de demo:
   - Email: `demo@procura.com`
   - Contraseña: (verificar en el código)

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
cd modulosjuntos/backend
npm run build
```

### Error: "Missing script: start"
El frontend usa `npm run dev`, no `npm start`

### Error de base de datos
```bash
cd modulosjuntos/backend
npx prisma db push
npm run seed
```

## 📝 Notas de Desarrollo

### Cambios Recientes
- ✅ Integración completa de Google Calendar
- ✅ Sistema de recordatorios WhatsApp
- ✅ Base de datos actualizada con esquemas de citas
- ✅ Frontend con componentes de calendario
- ✅ Sistema de respaldos automáticos

### Próximas Mejoras
- [ ] Dashboard de analytics
- [ ] Reportes de citas
- [ ] Integración con más calendarios
- [ ] Sistema de notificaciones push
- [ ] App móvil

## 📝 Notas

- El módulo de inventario usa NestJS y PostgreSQL
- El backend de cobros usa Express y PostgreSQL
- Ambos módulos funcionan independientemente
- El frontend se conecta a ambos backends

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Desarrollador Colaborador**: [Nombre del Colaborador]

---

**Última actualización**: Julio 2025
**Versión**: 1.0.0
