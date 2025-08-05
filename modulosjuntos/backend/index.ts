import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pacienteRoutes from './routes/pacienteRoutes';
import cobroRoutes from './routes/cobroRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import consultorioRoutes from './routes/consultorioRoutes';
import precioConsultorioRoutes from './routes/precioConsultorioRoutes';
import cobroConceptoRoutes from './routes/cobroConceptoRoutes';
import historialCobroRoutes from './routes/historialCobroRoutes';
import servicioRoutes from './routes/servicioRoutes';
import organizacionRoutes from './routes/organizacionRoutes';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { inventoryRoutes } from './routes/inventoryRoutes';
import citaRoutes from './routes/citaRoutes';
import disponibilidadMedicoRoutes from './routes/disponibilidadMedicoRoutes'
import bloqueoMedicoRoutes from './routes/bloqueoMedicoRoutes'
import googleAuthRoutes from './routes/googleAuthRoutes'
import whatsappRoutes from './routes/whatsappRoutes'
import { authenticateMultiTenant } from './middleware/tenantMiddleware'
import prisma from './prisma'
import monitoringService from './services/monitoringService'
dotenv.config();

console.log("Iniciando backend optimizado para producción...");

// Manejo global de errores no capturados
process.on('uncaughtException', function (err: Error) {
  console.error('🚨 Excepción no capturada:', err);
  // En producción, podrías enviar esto a un servicio de monitoreo
});

process.on('unhandledRejection', function (err: any) {
  console.error('🚨 Promesa no manejada:', err);
  // En producción, podrías enviar esto a un servicio de monitoreo
});

const app: Application = express();

// SECURIDAD: Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// COMPRESIÓN: Comprimir todas las respuestas
app.use(compression());

// RATE LIMITING: Proteger contra ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Más permisivo en desarrollo
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // Más permisivo en desarrollo
  message: {
    error: 'Demasiados intentos de login, intenta de nuevo en 15 minutos'
  },
  skipSuccessfulRequests: true,
});

// SOLUCIÓN SIMPLIFICADA: Aplicar rate limiting solo a rutas específicas
app.use('/api/pacientes', limiter);
app.use('/api/usuarios', limiter);
app.use('/api/consultorios', limiter);
app.use('/api/servicios', limiter);
app.use('/api/citas', limiter);
app.use('/api/cobros', limiter);
app.use('/api/precios-consultorio', limiter);
app.use('/api/cobro-conceptos', limiter);
app.use('/api/historial-cobros', limiter);
app.use('/api/organizaciones', limiter);
app.use('/api/inventory', limiter);
app.use('/api/disponibilidad-medico', limiter);
app.use('/api/bloqueo-medico', limiter);

// Función para limpiar rate limiting (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/reset-rate-limit', (req, res) => {
    // Reset rate limiting counters
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    limiter.resetKey(clientIP);
    authLimiter.resetKey(clientIP);
    res.json({ message: 'Rate limiting reset for this IP' });
  });
}

// Log global de todas las peticiones entrantes (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log('📥 PETICIÓN:', req.method, req.url, new Date().toISOString());
    next();
  });
}

// Middleware de autenticación JWT básico (para rutas que no necesitan multi-tenant)
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

// RUTAS DE AUTENTICACIÓN (deben ir primero)
app.use('/api', authRoutes);

// RUTA DIRECTA DE AUTENTICACIÓN (solución definitiva)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email y contraseña requeridos' });
      return;
    }
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }
    // Para pruebas, password fijo
    if (password !== '123456') {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }
    // Obtener la organización del usuario
    const userWithOrg = await prisma.$queryRaw`
      SELECT u.*, o.id as organizacion_id, o.nombre as organizacion_nombre
      FROM usuarios u
      JOIN organizaciones o ON u.organizacion_id = o.id
      WHERE u.id = ${user.id}::text
    `;
    
    const userData = (userWithOrg as any[])[0];
    
    // Obtener el sedeId del usuario de inventario
    const inventoryUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { sedeId: true }
    });
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol,
        organizacion_id: userData.organizacion_id,
        organizacion_nombre: userData.organizacion_nombre
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    
    // Incluir sedeId en la respuesta del usuario
    const userResponse = {
      ...user,
      sedeId: inventoryUser?.sedeId || 'sede-tecamachalco'
    };
    
    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check endpoint para monitoring
app.get('/health', (req: Request, res: Response) => {
  const health = monitoringService.getHealthCheck();
  res.json(health);
});

// Endpoint para métricas de performance (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.get('/metrics', (req: Request, res: Response) => {
    res.json({
      performance: monitoringService.getPerformanceStats(),
      errors: monitoringService.getErrorStats()
    });
  });
}

// Rutas con autenticación multi-tenant (filtrado por organización/consultorio)
app.use('/api/pacientes', authenticateMultiTenant, pacienteRoutes);
app.use('/api/usuarios', authenticateMultiTenant, usuarioRoutes);
app.use('/api/consultorios', authenticateMultiTenant, consultorioRoutes);
app.use('/api/servicios', authenticateMultiTenant, servicioRoutes);
app.use('/api/citas', authenticateMultiTenant, citaRoutes);

// Rutas de conceptos de cobro con autenticación multi-tenant (ANTES de cobros para evitar conflictos)
app.use('/api/cobro-conceptos', authenticateMultiTenant, cobroConceptoRoutes);

// Rutas de cobros con autenticación multi-tenant
app.use('/api/cobros', authenticateMultiTenant, cobroRoutes);

// Rutas con autenticación JWT básico (no necesitan filtrado)
app.use('/api/precios-consultorio', precioConsultorioRoutes);
app.use('/api/historial-cobros', historialCobroRoutes);
app.use('/api/organizaciones', organizacionRoutes);

// Rutas de inventario con autenticación multi-tenant (más específicas)
app.use('/api/inventory', authenticateMultiTenant, inventoryRoutes);
app.use('/api/disponibilidad-medico', disponibilidadMedicoRoutes)
app.use('/api/bloqueo-medico', bloqueoMedicoRoutes)

// Ruta específica para status de Google Calendar con autenticación multi-tenant
app.get('/api/google/status', authenticateMultiTenant, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
        googleCalendarId: true
      }
    })

    if (!usuario?.googleAccessToken) {
      return res.json({ 
        connected: false, 
        message: 'No conectado a Google Calendar' 
      })
    }

    // Verificar si el token ha expirado
    const isExpired = usuario.googleTokenExpiry && 
                     new Date() > usuario.googleTokenExpiry

    return res.json({
      connected: true,
      hasRefreshToken: !!usuario.googleRefreshToken,
      isExpired,
      calendarId: usuario.googleCalendarId
    })

  } catch (error) {
    console.error('Error verificando estado:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
});

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