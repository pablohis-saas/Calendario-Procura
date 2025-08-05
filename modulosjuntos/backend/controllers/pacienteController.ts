import { Request, Response } from 'express';
import prisma from '../prisma';

export async function getAllPacientes(req: Request, res: Response) {
  try {
    // Obtener organizacion_id del usuario autenticado si está disponible
    const organizacionId = (req as any).tenantFilter?.organizacion_id;
    
    let pacientes;
    if (organizacionId) {
      // Filtrar por organización usando SQL directo
      pacientes = await prisma.$queryRaw`
        SELECT * FROM pacientes 
        WHERE organizacion_id = ${organizacionId}::uuid
        ORDER BY nombre ASC, apellido ASC
      `;
    } else {
      // Sin filtro de organización (comportamiento original)
      pacientes = await prisma.paciente.findMany({
        orderBy: [{ nombre: 'asc' }, { apellido: 'asc' }]
      });
    }
    
    res.json(pacientes);
  } catch (error: any) {
    console.error('Error en getAllPacientes:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getPacienteById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const paciente = await prisma.paciente.findUnique({ where: { id } });
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    // Traer historial de citas
    const citas = await prisma.citas.findMany({
      where: { paciente_id: id },
      orderBy: { fecha_inicio: 'desc' },
      include: {
        usuarios: { select: { id: true, nombre: true, apellido: true } },
        consultorios: { select: { id: true, nombre: true } },
      },
    });
    res.json({ ...paciente, citas });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createPaciente(req: Request, res: Response) {
  console.log('Body recibido en createPaciente:', req.body);
  try {
    const { nombre, apellido, fecha_nacimiento, genero, telefono, email } = req.body;
    // Validar campos requeridos
    if (!nombre || !apellido || !fecha_nacimiento || !genero || !telefono || !email) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar duplicados por email o teléfono
    const existing = await prisma.paciente.findFirst({
      where: {
        OR: [
          { email: email },
          { telefono: telefono }
        ]
      }
    });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un paciente con ese email o teléfono.' });
    }

    // Obtener organizacion_id del usuario autenticado
    const organizacionId = (req as any).tenantFilter?.organizacion_id;
    
    if (!organizacionId) {
      return res.status(400).json({ error: 'No se pudo determinar la organización del usuario' });
    }
    
    // Usar SQL directo para evitar problemas de tipos
    const result = await prisma.$queryRaw`
      INSERT INTO pacientes (id, nombre, apellido, fecha_nacimiento, genero, telefono, email, organizacion_id, created_at, updated_at)
      VALUES (gen_random_uuid(), ${nombre}, ${apellido}, ${new Date(fecha_nacimiento)}, ${genero}, ${telefono}, ${email}, ${organizacionId}::uuid, NOW(), NOW())
      RETURNING *
    `;
    const paciente = (result as any[])[0];
    res.json(paciente);
  } catch (error: any) {
    console.error('Error en createPaciente:', error);
    res.status(400).json({ error: error.message });
  }
}

export async function updatePaciente(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nombre, fecha_nacimiento, genero, direccion, telefono, email, documento_identidad } = req.body;
    
    const updateData: any = {};
    if (nombre) updateData.nombre = nombre;
    if (fecha_nacimiento) updateData.fecha_nacimiento = new Date(fecha_nacimiento);
    if (genero) updateData.genero = genero;
    if (direccion) updateData.direccion = direccion;
    if (telefono) updateData.telefono = telefono;
    if (email) updateData.email = email;
    if (documento_identidad) updateData.documento_identidad = documento_identidad;

    const paciente = await prisma.paciente.update({
      where: { id },
      data: updateData,
    });
    res.json(paciente);
  } catch (error: any) {
    res.status(404).json({ error: 'Paciente no encontrado' });
  }
}

export async function deletePaciente(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.paciente.delete({ where: { id } });
    res.json({ message: 'Paciente eliminado' });
  } catch (error: any) {
    res.status(404).json({ error: 'Paciente no encontrado' });
  }
} 

export async function searchPacientes(req: Request, res: Response) {
  try {
    const { q } = req.query;
    console.log('🔍 Búsqueda de pacientes - Query:', q);
    
    if (!q || typeof q !== 'string' || q.trim().length < 1) {
      return res.status(400).json({ error: 'Query demasiado corto' });
    }
    
    // Obtener organizacion_id del usuario autenticado si está disponible
    const organizacionId = (req as any).tenantFilter?.organizacion_id;
    console.log('🏢 Organización ID:', organizacionId);
    
    let pacientes;
    if (organizacionId) {
      console.log('🔍 Usando Prisma con filtro de organización');
      // Filtrar por organización usando Prisma
      pacientes = await prisma.paciente.findMany({
        where: {
          organizacion_id: organizacionId,
          OR: [
            { nombre: { startsWith: q, mode: 'insensitive' } },
            { apellido: { startsWith: q, mode: 'insensitive' } },
          ],
        },
        orderBy: [{ nombre: 'asc' }, { apellido: 'asc' }],
        take: 10,
      });
      console.log('📋 Resultados Prisma con organización:', pacientes);
    } else {
      console.log('🔍 Usando Prisma sin filtro de organización');
      // Sin filtro de organización (comportamiento original)
      pacientes = await prisma.paciente.findMany({
        where: {
          OR: [
            { nombre: { startsWith: q, mode: 'insensitive' } },
            { apellido: { startsWith: q, mode: 'insensitive' } },
          ],
        },
        orderBy: [{ nombre: 'asc' }, { apellido: 'asc' }],
        take: 10,
      });
      console.log('📋 Resultados Prisma:', pacientes);
    }
    
    res.json(pacientes);
  } catch (error: any) {
    console.error('Error en searchPacientes:', error);
    res.status(500).json({ error: error.message });
  }
} 