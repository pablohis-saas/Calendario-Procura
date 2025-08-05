const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createNewDoctor() {
  console.log('👨‍⚕️ Creando nuevo médico y organización...');
  
  try {
    // 1. Crear nueva organización
    console.log('📋 Creando nueva organización...');
    const nuevaOrganizacion = await prisma.$queryRaw`
      INSERT INTO organizaciones (nombre, email, telefono, color_primario, color_secundario)
      VALUES ('Clínica Dr. Martínez', 'dr.martinez@clinica.com', '555-5678', '#10B981', '#1F2937')
      RETURNING *
    `;
    
    const organizacion = nuevaOrganizacion[0];
    console.log(`✅ Organización creada: ${organizacion.nombre} (ID: ${organizacion.id})`);
    
    // 2. Crear consultorio para la organización
    console.log('🏥 Creando consultorio...');
    const consultorio = await prisma.$queryRaw`
      INSERT INTO consultorios (id, nombre, direccion, organizacion_id, updated_at)
      VALUES (gen_random_uuid(), 'Consultorio Principal', 'Av. Principal 123, Ciudad', ${organizacion.id}::uuid, NOW())
      RETURNING *
    `;
    
    console.log(`✅ Consultorio creado: ${consultorio[0].nombre}`);
    
    // 3. Crear usuario médico
    console.log('👨‍⚕️ Creando usuario médico...');
    
    const medico = await prisma.$queryRaw`
      INSERT INTO usuarios (id, nombre, apellido, email, telefono, rol, consultorio_id, organizacion_id, updated_at)
      VALUES (gen_random_uuid(), 'Roberto', 'Martínez', 'dr.martinez@clinica.com', '555-5678', 'DOCTOR', ${consultorio[0].id}::uuid, ${organizacion.id}::uuid, NOW())
      RETURNING id, nombre, apellido, email, rol, organizacion_id
    `;
    
    console.log(`✅ Médico creado: Dr. ${medico[0].nombre} ${medico[0].apellido}`);
    console.log(`   Email: ${medico[0].email}`);
    console.log(`   Password: 123456 (contraseña por defecto)`);
    console.log(`   Organización: ${organizacion.nombre}`);
    
    // 4. Crear algunos servicios básicos para la organización
    console.log('🩺 Creando servicios básicos...');
    const servicios = [
      { nombre: 'Consulta General', precio: 50 },
      { nombre: 'Consulta Especializada', precio: 80 },
      { nombre: 'Procedimiento Menor', precio: 120 }
    ];
    
    for (const servicio of servicios) {
      await prisma.$queryRaw`
        INSERT INTO servicios (id, nombre, precio_base, organizacion_id, updated_at)
        VALUES (gen_random_uuid(), ${servicio.nombre}, ${servicio.precio}, ${organizacion.id}::uuid, NOW())
      `;
    }
    
    console.log(`✅ ${servicios.length} servicios creados`);
    
    // 5. Mostrar resumen
    console.log('\n🎉 ¡Nuevo médico creado exitosamente!');
    console.log('=====================================');
    console.log(`Organización: ${organizacion.nombre}`);
    console.log(`Médico: Dr. ${medico[0].nombre} ${medico[0].apellido}`);
    console.log(`Email: ${medico[0].email}`);
    console.log(`Password: password123`);
    console.log(`Consultorio: ${consultorio[0].nombre}`);
    console.log(`Servicios: ${servicios.length} servicios básicos`);
    console.log('\n💡 Ahora puedes iniciar sesión con este médico y verás solo sus datos.');
    
  } catch (error) {
    console.error('❌ Error creando médico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para crear múltiples médicos
async function createMultipleDoctors() {
  console.log('👥 Creando múltiples médicos...');
  
  const doctors = [
    {
      nombre: 'Ana',
      apellido: 'López',
      email: 'dra.lopez@clinica.com',
      telefono: '555-5678',
      organizacion: 'Clínica Dra. López',
      color: '#8B5CF6'
    },
    {
      nombre: 'Miguel',
      apellido: 'Rodríguez',
      email: 'dr.rodriguez@clinica.com',
      telefono: '555-9012',
      organizacion: 'Clínica Dr. Rodríguez',
      color: '#F59E0B'
    }
  ];
  
  for (const doctor of doctors) {
    try {
      // Crear organización
      const organizacion = await prisma.$queryRaw`
        INSERT INTO organizaciones (nombre, email, telefono, color_primario)
        VALUES (${doctor.organizacion}, ${doctor.email}, ${doctor.telefono}, ${doctor.color})
        RETURNING *
      `;
      
      // Crear consultorio
      const consultorio = await prisma.$queryRaw`
        INSERT INTO consultorios (id, nombre, direccion, organizacion_id, updated_at)
        VALUES (gen_random_uuid(), 'Consultorio Principal', 'Dirección del consultorio', ${organizacion[0].id}::uuid, NOW())
        RETURNING *
      `;
      
      // Crear médico
      const medico = await prisma.$queryRaw`
        INSERT INTO usuarios (id, nombre, apellido, email, telefono, rol, consultorio_id, organizacion_id, updated_at)
        VALUES (gen_random_uuid(), ${doctor.nombre}, ${doctor.apellido}, ${doctor.email}, ${doctor.telefono}, 'DOCTOR', ${consultorio[0].id}::uuid, ${organizacion[0].id}::uuid, NOW())
        RETURNING *
      `;
      
      console.log(`✅ Dr. ${doctor.nombre} ${doctor.apellido} creado en ${doctor.organizacion}`);
      
    } catch (error) {
      console.error(`❌ Error creando Dr. ${doctor.nombre}:`, error);
    }
  }
  
  console.log('\n🎉 ¡Múltiples médicos creados!');
  console.log('Ahora puedes probar el multi-tenancy iniciando sesión con diferentes médicos.');
}

// Ejecutar según lo que necesites
const action = process.argv[2] || 'single';

if (action === 'multiple') {
  createMultipleDoctors();
} else {
  createNewDoctor();
} 