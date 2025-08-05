import { Request, Response } from 'express';
import prisma from '../prisma';
import { asyncHandler } from '../utils/asyncHandler';
import CacheService from '../services/cacheService';

// Instancia global del servicio de caché
const cacheService = new CacheService(prisma);

console.log("INICIANDO CONTROLADOR COBROS!!!");
process.on('uncaughtException', function (err) {
  console.error('Excepción no capturada en controlador:', err);
});
process.on('unhandledRejection', function (err) {
  console.error('Promesa no manejada en controlador:', err);
});
console.log("Antes de crear PrismaClient");

export const getAllCobros = asyncHandler(async (req: Request, res: Response) => {
  console.log("Entrando a getAllCobros");
  
  // Obtener organizacion_id del usuario autenticado si está disponible
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  
  let cobros: any[];
  if (organizacionId) {
    // TEMPORALMENTE DESHABILITADO EL CACHÉ PARA DEBUGGING
    // const cachedCobros = await cacheService.getCobrosByOrganizacion(organizacionId);
    // if (cachedCobros) {
    //   console.log("📦 Datos obtenidos del caché");
    //   return res.json(cachedCobros);
    // }
    console.log("🔄 Obteniendo datos frescos de la base de datos");
    // Optimización: Obtener todos los datos en una sola consulta usando JOINs
    const cobrosIds = await prisma.$queryRaw`
      SELECT c.id
      FROM cobros c
      JOIN pacientes p ON c.paciente_id = p.id
      WHERE p.organizacion_id = ${organizacionId}::uuid
      ORDER BY c.fecha_cobro DESC
    ` as any[];
    
    if (cobrosIds.length === 0) {
      return res.json([]);
    }
    
    const ids = cobrosIds.map((c: any) => c.id);
    
    // Obtener todos los datos relacionados en consultas paralelas
    const [cobrosData, conceptosData, historialData, metodosPagoData] = await Promise.all([
      // Datos principales de cobros con pacientes y usuarios
      prisma.$queryRaw`
        SELECT c.*, 
               p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.telefono as paciente_telefono, p.email as paciente_email,
               u.nombre as usuario_nombre, u.apellido as usuario_apellido, u.email as usuario_email
        FROM cobros c
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = ANY(${ids})
        ORDER BY c.fecha_cobro DESC
      `,
      
      // Todos los conceptos de una vez
      prisma.$queryRaw`
        SELECT cc.*, s.nombre as servicio_nombre, s.precio_base, cc.cobro_id
        FROM cobro_conceptos cc
        JOIN servicios s ON cc.servicio_id = s.id
        WHERE cc.cobro_id = ANY(${ids})
      `,
      
      // Todo el historial de una vez
      prisma.$queryRaw`
        SELECT *, cobro_id
        FROM historial_cobros
        WHERE cobro_id = ANY(${ids})
        ORDER BY created_at DESC
      `,
      
      // Todos los métodos de pago de una vez
      prisma.$queryRaw`
        SELECT *, cobro_id
        FROM metodos_pago_cobro
        WHERE cobro_id = ANY(${ids})
      `
    ]) as [any[], any[], any[], any[]];
    
    // Crear mapas para acceso rápido
    const conceptosMap = new Map();
    const historialMap = new Map();
    const metodosPagoMap = new Map();
    
    conceptosData.forEach((concepto: any) => {
      if (!conceptosMap.has(concepto.cobro_id)) {
        conceptosMap.set(concepto.cobro_id, []);
      }
      conceptosMap.get(concepto.cobro_id).push({
        ...concepto,
        servicio: {
          id: concepto.servicio_id,
          nombre: concepto.servicio_nombre,
          precio_base: concepto.precio_base
        }
      });
    });
    
    historialData.forEach((historial: any) => {
      if (!historialMap.has(historial.cobro_id)) {
        historialMap.set(historial.cobro_id, []);
      }
      historialMap.get(historial.cobro_id).push(historial);
    });
    
    metodosPagoData.forEach((metodo: any) => {
      if (!metodosPagoMap.has(metodo.cobro_id)) {
        metodosPagoMap.set(metodo.cobro_id, []);
      }
      metodosPagoMap.get(metodo.cobro_id).push(metodo);
    });
    
    // Transformar los datos para que coincidan con la estructura esperada por el frontend
    cobros = cobrosData.map(cobro => ({
      ...cobro,
      paciente: {
        id: cobro.paciente_id,
        nombre: cobro.paciente_nombre,
        apellido: cobro.paciente_apellido,
        telefono: cobro.paciente_telefono,
        email: cobro.paciente_email
      },
      usuario: {
        id: cobro.usuario_id,
        nombre: cobro.usuario_nombre,
        apellido: cobro.usuario_apellido,
        email: cobro.usuario_email
      },
      conceptos: conceptosMap.get(cobro.id) || [],
      historial: historialMap.get(cobro.id) || [],
      metodos_pago: metodosPagoMap.get(cobro.id) || []
    }));
  } else {
    // Sin filtro de organización (comportamiento original)
    cobros = await prisma.cobro.findMany({
      include: {
        paciente: true,
        usuario: true,
        conceptos: { 
          include: { 
            servicio: true 
          } 
        },
        historial: true,
        metodos_pago: true,
      },
    });
  }
  
  // TEMPORALMENTE DESHABILITADO EL CACHÉ PARA DEBUGGING
  // Guardar en caché si hay organizacionId
  // if (organizacionId) {
  //   cacheService.setCobrosByOrganizacion(organizacionId, cobros);
  // }
  
  res.json(cobros);
});

export const getCobroById = asyncHandler(async (req: Request, res: Response) => {
  console.log("Entrando a getCobroById");
  const { id } = req.params;
  const cobro = await prisma.cobro.findUnique({
    where: { id },
    include: {
      paciente: true,
      usuario: true,
      conceptos: { 
        include: { 
          servicio: true 
        } 
      },
      historial: true,
      metodos_pago: true,
    },
  });
  if (!cobro) return res.status(404).json({ error: 'Cobro no encontrado' });
  res.json(cobro);
});

export const createCobro = asyncHandler(async (req: Request, res: Response) => {
  console.log("Entrando a createCobro");
  console.log("Body recibido en createCobro:", JSON.stringify(req.body, null, 2));
  
  const { paciente_id, usuario_id, fecha_cobro, monto_total, estado, notas, pagos } = req.body;
  console.log("Pagos recibidos:", pagos);
  
  // Validar campos requeridos
  if (!paciente_id || !usuario_id || !fecha_cobro || monto_total === undefined || !estado) {
    console.log("Faltan campos requeridos");
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  // Validar estado
  const estadosValidos = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];
  if (!estadosValidos.includes(estado)) {
    console.log("Estado inválido:", estado);
    return res.status(400).json({ error: 'Estado inválido' });
  }
  
  // Validar array de pagos
  if (!Array.isArray(pagos) || pagos.length === 0) {
    console.log("Pagos no es array o está vacío:", pagos);
    return res.status(400).json({ error: 'Debes especificar al menos un método de pago' });
  }
  
  // Validar que la suma de los montos sea igual al monto_total
  const sumaPagos = pagos.reduce((acc: number, p: any) => acc + parseFloat(p.monto), 0);
  console.log("Suma de pagos:", sumaPagos, "Monto total:", monto_total);
  if (Math.abs(sumaPagos - parseFloat(monto_total)) > 0.01) {
    console.log("La suma de los métodos de pago no coincide con el total");
    return res.status(400).json({ error: 'La suma de los métodos de pago no coincide con el total' });
  }
  
  // Crear el cobro (sin metodo_pago único)
  const cobro = await prisma.cobro.create({
    data: {
      paciente_id,
      usuario_id,
      fecha_cobro: new Date(fecha_cobro),
      monto_total: parseFloat(monto_total),
      estado,
      notas: notas || null,
    },
  });
  
  // Crear los métodos de pago asociados
  for (const pago of pagos) {
    console.log("Creando metodoPagoCobro:", pago);
    await prisma.metodoPagoCobro.create({
      data: {
        cobro_id: cobro.id,
        metodo_pago: pago.metodo,
        monto: parseFloat(pago.monto),
      },
    });
  }
  
  // Buscar el cobro completo con métodos de pago
  const cobroCompleto = await prisma.cobro.findUnique({
    where: { id: cobro.id },
    include: {
      paciente: true,
      usuario: true,
      conceptos: { include: { servicio: true } },
      historial: true,
      metodos_pago: true,
    },
  });
  
  // Invalidar caché de cobros para esta organización
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  console.log("🔍 Debug - tenantFilter:", (req as any).tenantFilter);
  console.log("🔍 Debug - organizacionId:", organizacionId);
  if (organizacionId) {
    cacheService.invalidateCobros(organizacionId);
    console.log("🔄 Caché de cobros invalidado para organización:", organizacionId);
  } else {
    console.log("⚠️ No se pudo obtener organizacionId para invalidar caché");
  }
  
  console.log("Cobro completo después de crear:", JSON.stringify(cobroCompleto, null, 2));
  res.json(cobroCompleto);
});

export const updateCobro = asyncHandler(async (req: Request, res: Response) => {
  console.log("Entrando a updateCobro");
  const { id } = req.params;
  const { paciente_id, usuario_id, fecha_cobro, monto_total, estado, metodo_pago, notas, pagos } = req.body;

  console.log("Body recibido en updateCobro:", JSON.stringify(req.body, null, 2));

  const updateData: any = {};
  if (paciente_id) updateData.paciente_id = paciente_id;
  if (usuario_id) updateData.usuario_id = usuario_id;
  if (fecha_cobro) updateData.fecha_cobro = new Date(fecha_cobro);
  if (monto_total) updateData.monto_total = parseFloat(monto_total);
  if (estado) {
    const estadosValidos = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];
    if (!estadosValidos.includes(estado)) {
      console.log("Estado inválido:", estado);
      return res.status(400).json({ error: 'Estado inválido' });
    }
    updateData.estado = estado;
  }
  if (metodo_pago) {
    const metodosValidos = ['EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'OTRO'];
    if (!metodosValidos.includes(metodo_pago)) {
      console.log("Método de pago inválido:", metodo_pago);
      return res.status(400).json({ error: 'Método de pago inválido' });
    }
    updateData.metodo_pago = metodo_pago;
  }
  if (notas !== undefined) updateData.notas = notas;

  // Si se envía pagos, validar y actualizar métodos de pago
  if (pagos !== undefined) {
    console.log("Pagos recibidos en updateCobro:", pagos);
    if (!Array.isArray(pagos) || pagos.length === 0) {
      console.log("Pagos no es array o está vacío:", pagos);
      return res.status(400).json({ error: 'Debes especificar al menos un método de pago' });
    }
    const sumaPagos = pagos.reduce((acc: number, p: any) => acc + parseFloat(p.monto), 0);
    console.log("Suma de pagos:", sumaPagos, "Monto total:", monto_total);
    if (Math.abs(sumaPagos - parseFloat(monto_total)) > 0.01) {
      console.log("La suma de los métodos de pago no coincide con el total");
      return res.status(400).json({ error: 'La suma de los métodos de pago no coincide con el total' });
    }
  }

  // Actualizar el cobro
  const cobro = await prisma.cobro.update({
    where: { id },
    data: updateData,
  });

  // Si se envía pagos, borrar los métodos de pago existentes y crear los nuevos
  if (pagos !== undefined) {
    await prisma.metodoPagoCobro.deleteMany({ where: { cobro_id: id } });
    for (const pago of pagos) {
      await prisma.metodoPagoCobro.create({
        data: {
          cobro_id: id,
          metodo_pago: pago.metodo,
          monto: parseFloat(pago.monto),
        },
      });
    }
  }

  // Buscar el cobro completo actualizado
  const cobroCompleto = await prisma.cobro.findUnique({
    where: { id: cobro.id },
    include: {
      paciente: true,
      usuario: true,
      conceptos: { include: { servicio: true } },
      historial: true,
      metodos_pago: true,
    },
  });
  
  // Invalidar caché de cobros para esta organización
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  if (organizacionId) {
    cacheService.invalidateCobros(organizacionId);
    console.log("🔄 Caché de cobros invalidado después de actualizar cobro para organización:", organizacionId);
  }
  
  res.json(cobroCompleto);
});

export const deleteCobro = asyncHandler(async (req: Request, res: Response) => {
  console.log("Entrando a deleteCobro");
  const { id } = req.params;
  // Eliminar conceptos relacionados
  await prisma.cobroConcepto.deleteMany({ where: { cobro_id: id } });
  // Eliminar métodos de pago relacionados
  await prisma.metodoPagoCobro.deleteMany({ where: { cobro_id: id } });
  // Eliminar historial relacionado
  await prisma.historialCobro.deleteMany({ where: { cobro_id: id } });
  // Finalmente, eliminar el cobro
  await prisma.cobro.delete({ where: { id } });
  
  // Invalidar caché de cobros para esta organización
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  if (organizacionId) {
    cacheService.invalidateCobros(organizacionId);
    console.log("🔄 Caché de cobros invalidado después de eliminar cobro para organización:", organizacionId);
  }
  
  res.json({ message: 'Cobro eliminado' });
});

export const addServicioToCobro = asyncHandler(async (req: Request, res: Response) => {
  console.log("Entrando a addServicioToCobro");
  const { id } = req.params;
  const { servicio_id, cantidad, precio_unitario, descripcion, consultorio_id } = req.body;
  
  // Validar campos requeridos
  if (!servicio_id || !cantidad || !precio_unitario || !consultorio_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  // Verificar que el cobro existe
  const cobro = await prisma.cobro.findUnique({ where: { id } });
  if (!cobro) {
    return res.status(404).json({ error: 'Cobro no encontrado' });
  }
  
  // Verificar que el servicio existe
  const servicio = await prisma.servicio.findUnique({ where: { id: servicio_id } });
  if (!servicio) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }
  
  // Crear el concepto de cobro
  const concepto = await prisma.cobroConcepto.create({
    data: {
      cobro_id: id,
      servicio_id,
      precio_unitario: parseFloat(precio_unitario),
      cantidad: parseInt(cantidad),
      subtotal: parseFloat(precio_unitario) * parseInt(cantidad),
      consultorio_id,
      // descripcion: descripcion || null, // Si tienes campo descripcion en el modelo
    },
  });
  
  // Actualizar el monto total del cobro
  const conceptos = await prisma.cobroConcepto.findMany({
    where: { cobro_id: id },
  });
  const nuevoMontoTotal = conceptos.reduce((total, concepto) => {
    return total + concepto.subtotal;
  }, 0);
  
  await prisma.cobro.update({
    where: { id },
    data: { monto_total: nuevoMontoTotal },
  });
  
  // Invalidar caché de cobros para esta organización
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  if (organizacionId) {
    cacheService.invalidateCobros(organizacionId);
    console.log("🔄 Caché de cobros invalidado después de agregar servicio a cobro para organización:", organizacionId);
  }
  
  res.json(concepto);
});

export const addConceptoToCobro = asyncHandler(async (req: Request, res: Response) => {
  console.log("Entrando a addConceptoToCobro");
  const { id } = req.params;
  const { servicio_id, cantidad, precio_unitario, consultorio_id } = req.body;
  
  // Validar campos requeridos
  if (!servicio_id || !cantidad || !precio_unitario || !consultorio_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  // Verificar que el cobro existe
  const cobro = await prisma.cobro.findUnique({ where: { id } });
  if (!cobro) {
    return res.status(404).json({ error: 'Cobro no encontrado' });
  }
  
  // Verificar que el servicio existe
  const servicio = await prisma.servicio.findUnique({ where: { id: servicio_id } });
  if (!servicio) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }
  
  // Crear el concepto de cobro
  const concepto = await prisma.cobroConcepto.create({
    data: {
      cobro_id: id,
      servicio_id,
      precio_unitario: parseFloat(precio_unitario),
      cantidad: parseInt(cantidad),
      subtotal: parseFloat(precio_unitario) * parseInt(cantidad),
      consultorio_id,
    },
  });
  
  // Actualizar el monto total del cobro
  const conceptos = await prisma.cobroConcepto.findMany({
    where: { cobro_id: id },
  });
  const nuevoMontoTotal = conceptos.reduce((total, concepto) => {
    return total + concepto.subtotal;
  }, 0);
  
  await prisma.cobro.update({
    where: { id },
    data: { monto_total: nuevoMontoTotal },
  });
  
  // Invalidar caché de cobros para esta organización
  const organizacionId = (req as any).tenantFilter?.organizacion_id;
  if (organizacionId) {
    cacheService.invalidateCobros(organizacionId);
    console.log("🔄 Caché de cobros invalidado después de agregar concepto a cobro para organización:", organizacionId);
  }
  
  res.json(concepto);
}); 