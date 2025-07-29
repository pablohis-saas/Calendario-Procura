import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import pacienteRoutes from './routes/pacienteRoutes';
import cobroRoutes from './routes/cobroRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import consultorioRoutes from './routes/consultorioRoutes';
import precioConsultorioRoutes from './routes/precioConsultorioRoutes';
import cobroConceptoRoutes from './routes/cobroConceptoRoutes';
import historialCobroRoutes from './routes/historialCobroRoutes';
import servicioRoutes from './routes/servicioRoutes';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { inventoryRoutes } from './routes/inventoryRoutes';
import citaRoutes from './routes/citaRoutes';
import disponibilidadMedicoRoutes from './routes/disponibilidadMedicoRoutes'
import bloqueoMedicoRoutes from './routes/bloqueoMedicoRoutes'
import googleAuthRoutes from './routes/googleAuthRoutes'
import whatsappRoutes from './routes/whatsappRoutes'
dotenv.config();

console.log("Iniciando backend...");

process.on('uncaughtException', function (err: Error) {
  console.error('Excepción no capturada:', err);
});

process.on('unhandledRejection', function (err: any) {
  console.error('Promesa no manejada:', err);
});

const app: Application = express();

// Log global de todas las peticiones entrantes
app.use((req, res, next) => {
  console.log('LLEGA PETICION:', req.method, req.url)
  next()
})

// Middleware de autenticación JWT
function authenticateJWT(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
      }
      (req as any).user = user;
      next();
    });
  } else {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
}

// CORS seguro (ajusta origins según tu necesidad)
app.use(cors({
  origin: [
    'http://localhost:5173', // frontend Vite
    'http://localhost:3000', // posible otro frontend
    'http://localhost:3001', // posible otro frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Permitir preflight OPTIONS para todas las rutas
app.options('*', cors());

app.use(express.json());

// Configurar middleware de sesiones
app.use(session({
  secret: process.env.JWT_SECRET || 'supersecreto123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // En desarrollo
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('API de ProCura Cobros funcionando');
});

app.use('/api/pacientes', pacienteRoutes);

// Rutas de cobros con autenticación JWT para operaciones de escritura
app.use('/api/cobros', (req, res, next) => {
  // Permitir GET sin autenticación
  if (req.method === 'GET') {
    return next();
  }
  // Requerir autenticación para POST, PUT, DELETE
  authenticateJWT(req, res, next);
}, cobroRoutes);

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/consultorios', consultorioRoutes);
app.use('/api/precios-consultorio', precioConsultorioRoutes);
app.use('/api/cobro-conceptos', cobroConceptoRoutes);
app.use('/api/historial-cobros', historialCobroRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api', authRoutes);
app.use('/api', inventoryRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/disponibilidad-medico', disponibilidadMedicoRoutes)
app.use('/api/bloqueo-medico', bloqueoMedicoRoutes)

// Rutas de Google Calendar (algunas requieren autenticación JWT)
app.use('/api', googleAuthRoutes);

// Rutas de WhatsApp (webhook no requiere autenticación)
app.use('/api/whatsapp', whatsappRoutes);

// Rutas para manejar callbacks de OAuth
app.get('/sincronizacion-exitosa', (req: Request, res: Response) => {
  res.send(`
    <html>
      <head><title>Sincronización Exitosa</title></head>
      <body>
        <h1>¡Sincronización con Google Calendar exitosa!</h1>
        <p>Tu cuenta ha sido conectada correctamente.</p>
        <script>
          setTimeout(() => {
            window.location.href = 'http://localhost:5173/usuarios';
          }, 3000);
        </script>
      </body>
    </html>
  `);
});

app.get('/sincronizacion-error', (req: Request, res: Response) => {
  const error = req.query.error as string;
  let errorMessage = 'Error desconocido';
  
  switch (error) {
    case 'google_denied':
      errorMessage = 'Google denegó la autorización';
      break;
    case 'missing_params':
      errorMessage = 'Faltan parámetros requeridos';
      break;
    case 'invalid_state':
      errorMessage = 'Error de seguridad (state inválido)';
      break;
    case 'no_token':
      errorMessage = 'No se recibió token de Google';
      break;
    case 'no_user':
      errorMessage = 'No se encontró usuario';
      break;
    case 'server_error':
      errorMessage = 'Error interno del servidor';
      break;
  }
  
  res.send(`
    <html>
      <head><title>Error de Sincronización</title></head>
      <body>
        <h1>Error en la sincronización</h1>
        <p>${errorMessage}</p>
        <script>
          setTimeout(() => {
            window.location.href = 'http://localhost:5173/usuarios';
          }, 5000);
        </script>
      </body>
    </html>
  `);
});

const PORT: number = parseInt(process.env.PORT || '3002', 10);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app; 