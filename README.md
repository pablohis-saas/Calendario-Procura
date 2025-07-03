# ProCura Integrated System

Sistema integrado para gestión de cobros, usuarios, consultorios e inventario.

---

## 🏗️ Estructura del Proyecto

```
modulo de cobros/
├── backend/             # API de cobros, usuarios, consultorios (Express + Prisma)
│   ├── controllers/    # Controladores de rutas
│   ├── routes/         # Endpoints de la API
│   ├── prisma/         # Configuración y migraciones de base de datos
│   └── index.ts        # Servidor principal (puerto 3002)
├── frontend/           # Frontend principal (React + Vite)
│   ├── src/            # Código fuente React
│   └── components/     # Componentes UI
├── inventory-module/   # Módulo de inventario (Next.js)
│   ├── app/            # Aplicación Next.js
│   ├── components/     # Componentes React
│   └── prisma/         # Configuración y migraciones de base de datos
├── shared/             # Código compartido (si aplica)
└── README.md           # Documentación principal
```

---

## 🚀 Instalación de dependencias

```sh
# Clona el repositorio
git clone https://github.com/Rodrigoespc03/procura-integrated-system.git
cd procura-integrated-system

# Instala dependencias en cada módulo
cd backend && npm install
cd ../frontend && npm install
cd ../inventory-module && npm install
```

---

## ▶️ Cómo correr el sistema localmente

Abre **tres terminales** (una para cada módulo):

```sh
# Backend (API de cobros, usuarios, consultorios, etc.)
cd backend
npm run dev
# Corre en http://localhost:3002

# Frontend (Vite/React)
cd frontend
npm run dev
# Corre en http://localhost:5173

# Inventario (Next.js)
cd inventory-module
npm run dev
# Corre en http://localhost:3000
```

---

## ⚙️ Variables de entorno

Copia el archivo `.env.example` a `.env` en cada módulo y configura las variables necesarias:

- **backend/.env**
  - `DATABASE_URL`: URL de conexión a PostgreSQL (Supabase o local)
  - `JWT_SECRET`: Clave secreta para JWT
  - `PORT`: Puerto del backend (por defecto 3002)

- **inventory-module/.env**
  - `DATABASE_URL`: URL de conexión a PostgreSQL
  - `JWT_SECRET`: Clave secreta para JWT
  - `PORT`: Puerto del inventario (por defecto 3000)

- **frontend/.env** (opcional)
  - `API_URL`: URL del backend si se usa proxy o variables de entorno

**IMPORTANTE:**
Si ambos sistemas usan JWT, acuerden el mismo `JWT_SECRET` para pruebas de integración.

---

## 🔑 Endpoints principales y autenticación

- **Login:**
  - `POST /api/login`
  - Body: `{ "email": "usuario@correo.com", "password": "123456" }`
  - Responde: `{ token, user }`

- **Usuarios, Consultorios, Cobros, etc.:**
  - Todos los endpoints principales están bajo `/api/` en el backend.

- **Autenticación:**
  - Usa JWT en el header:
    ```
    Authorization: Bearer <token>
    ```

---

## 🔗 Comunicación entre sistemas

- **Recomendado:**
  - El **frontend** consume ambos backends (cobros e inventario) por separado, pero pueden unificar APIs si lo desean.
- **CORS:**
  - Ambos backends permiten CORS para los puertos locales (`5173`, `3000`, etc.).
  - Si necesitas consumir APIs entre backends, asegúrate de permitir el origen correspondiente en la configuración de CORS.

---

## 🌐 Puertos

- **Backend cobros:** `http://localhost:3002`
- **Frontend:** `http://localhost:5173`
- **Inventario:** `http://localhost:3000`

---

## 🛠 Scripts útiles

- `npm run dev`         # Levanta el servidor en modo desarrollo
- `npm run build`       # Compila el proyecto para producción
- `npm run start`       # Inicia el servidor en modo producción
- `npm run test`        # Ejecuta los tests (si aplica)

---

## 🗄️ Migraciones y base de datos

- Para aplicar migraciones de Prisma:
  ```sh
  cd backend
  npx prisma migrate dev
  # o para producción
  npx prisma migrate deploy
  ```
- Los scripts de migración están en `backend/prisma/migrations/` y `inventory-module/prisma/migrations/`.

---

## 🧩 Troubleshooting

- Si tienes problemas con dependencias, ejecuta `npm install` en cada módulo.
- Si hay errores de puerto ocupado, cambia el puerto en el `.env` correspondiente.
- Si la base de datos no conecta, revisa la URL y credenciales en `.env`.
- Si tienes problemas con CORS, revisa la configuración en el backend.

---

## 🤝 Recomendaciones de colaboración

- Usa ramas (`git checkout -b feature/nueva-funcionalidad`) para trabajo paralelo.
- Haz pull requests para revisión de código.
- Documenta cambios importantes en el README o en la wiki del repo.
- Mantén actualizado tu fork o rama principal con `git pull`.

---

## 👥 Autores y contacto

- **Rodrigoespc03** (Cobros, integración)
- **[Tu compadre]** (Inventario)

¿Dudas? Contacta a Rodrigoespc03 o revisa la documentación interna de cada módulo. 