import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma'

const router = Router();

router.post('/login', async (req, res) => {
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

export default router; 