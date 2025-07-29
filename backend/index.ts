import express, { Application, Request, Response } from 'express';
import cors from 'cors';
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
dotenv.config();

console.log("Iniciando backend...");

process.on('uncaughtException', function (err: Error) {
  console.error('Excepción no capturada:', err);
});

process.on('unhandledRejection', function (err: any) {
  console.error('Promesa no manejada:', err);
});

const app: Application = express();

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

const PORT: number = parseInt(process.env.PORT || '3002', 10);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app; 