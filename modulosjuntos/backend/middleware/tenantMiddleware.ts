import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

interface AuthenticatedRequest extends Request {
  user?: any;
  organizacion?: any;
  tenantFilter?: any;
}

/**
 * Middleware para autenticar usuarios y obtener información de la organización
 */
export function authenticateMultiTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  console.log("🔍 Debug - authenticateMultiTenant ejecutándose");
  console.log("🔍 Debug - URL:", req.url);
  console.log("🔍 Debug - Method:", req.method);
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log("❌ Error - Token no proporcionado");
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    
    try {
      // Obtener usuario con información de la organización
      const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        include: { 
          organizacion: true,
          consultorio: true
        }
      });
      
      if (!usuario) {
        return res.status(403).json({ error: 'Usuario no encontrado' });
      }
      
      if (!usuario.organizacion) {
        return res.status(403).json({ error: 'Usuario no tiene organización asignada' });
      }
      
      // Agregar información al request
      req.user = usuario;
      req.organizacion = usuario.organizacion;
      req.tenantFilter = { organizacion_id: usuario.organizacion.id };
      
      console.log("🔍 Debug - tenantFilter establecido:", req.tenantFilter);
      console.log("🔍 Debug - organizacion_id:", usuario.organizacion.id);
      
      next();
    } catch (error) {
      console.error('Error en autenticación multi-tenant:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
}

/**
 * Middleware para rutas que no requieren autenticación pero sí filtrado por organización
 * (ej: webhooks, endpoints públicos)
 */
export function filterByOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const organizacionId = req.headers['x-organizacion-id'] as string;
  
  if (!organizacionId) {
    return res.status(400).json({ error: 'ID de organización requerido' });
  }
  
  req.tenantFilter = { organizacion_id: organizacionId };
  next();
}

/**
 * Middleware para verificar que el usuario pertenece a la organización correcta
 */
export function verifyOrganizationAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = req.user;
  const organizacionId = req.params.organizacionId || req.body.organizacion_id;
  
  if (!user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  
  if (organizacionId && user.organizacion_id !== organizacionId) {
    return res.status(403).json({ error: 'Acceso denegado a esta organización' });
  }
  
  next();
}

/**
 * Función helper para aplicar filtros de tenant a consultas Prisma
 */
export function applyTenantFilter(baseWhere: any = {}, tenantFilter: any) {
  return {
    ...baseWhere,
    ...tenantFilter
  };
}

/**
 * Función helper para validar que un recurso pertenece a la organización del usuario
 */
export async function validateResourceOwnership(
  model: any, 
  resourceId: string, 
  organizacionId: string
): Promise<boolean> {
  const resource = await model.findFirst({
    where: {
      id: resourceId,
      organizacion_id: organizacionId
    }
  });
  
  return !!resource;
} 