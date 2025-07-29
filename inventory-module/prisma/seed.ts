import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. CREAR SEDES
  console.log('\n🏥 Creando sedes...');
  const sedeTecamachalco = await prisma.sede.upsert({
    where: { id: 'sede-tecamachalco' },
    update: {},
    create: {
      id: 'sede-tecamachalco',
      name: 'Clínica Tecamachalco',
      address: 'Av. Tecamachalco 123, Ciudad de México'
    }
  });

  const sedeAngeles = await prisma.sede.upsert({
    where: { id: 'sede-angeles' },
    update: {},
    create: {
      id: 'sede-angeles',
      name: 'Hospital Ángeles Lomas',
      address: 'Av. Lomas 456, Ciudad de México'
    }
  });

  // 2. CREAR USUARIOS
  console.log('\n👥 Creando usuarios...');
    
    // Doctor (acceso a ambas sedes)
    const doctor = await prisma.user.upsert({
      where: { email: 'dr.garcia@clinica.com' },
      update: {},
      create: {
        email: 'dr.garcia@clinica.com',
        name: 'Dr. Carlos García',
        role: 'DOCTOR',
        sedeId: sedeTecamachalco.id
      }
    });

    // Enfermeras en Tecamachalco
    const enfermeraTecamachalco = await prisma.user.upsert({
      where: { email: 'enfermera.tecamachalco@clinica.com' },
      update: {},
      create: {
        email: 'enfermera.tecamachalco@clinica.com',
        name: 'Enfermera Ana López',
        role: 'NURSE',
        sedeId: sedeTecamachalco.id
      }
    });

    // Enfermeras en Ángeles
    const enfermeraAngeles1 = await prisma.user.upsert({
      where: { email: 'enfermera1.angeles@clinica.com' },
      update: {},
      create: {
        email: 'enfermera1.angeles@clinica.com',
        name: 'Enfermera María Rodríguez',
        role: 'NURSE',
        sedeId: sedeAngeles.id
      }
    });

    const enfermeraAngeles2 = await prisma.user.upsert({
      where: { email: 'enfermera2.angeles@clinica.com' },
      update: {},
      create: {
        email: 'enfermera2.angeles@clinica.com',
        name: 'Enfermera Carmen Martínez',
        role: 'NURSE',
        sedeId: sedeAngeles.id
      }
    });

    // Secretarias
    const secretariaTecamachalco = await prisma.user.upsert({
      where: { email: 'secretaria.tecamachalco@clinica.com' },
      update: {},
      create: {
        email: 'secretaria.tecamachalco@clinica.com',
        name: 'Secretaria Laura Sánchez',
        role: 'SECRETARY',
        sedeId: sedeTecamachalco.id
      }
    });

    const secretariaAngeles = await prisma.user.upsert({
      where: { email: 'secretaria.angeles@clinica.com' },
      update: {},
      create: {
        email: 'secretaria.angeles@clinica.com',
        name: 'Secretaria Patricia Torres',
        role: 'SECRETARY',
        sedeId: sedeAngeles.id
      }
    });

    // 3. CREAR ALÉRGENOS
    console.log('\n🌿 Creando alérgenos...');
    
    // Alérgenos para Glicerinado (no exclusivos de Alxoid)
    const alergenosGlicerinado = [
      'Abedul', 'Ácaros', 'Álamo del este', 'Ambrosía', 'Caballo', 'Camarón',
      'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Cucaracha',
      'Mezcla pastos', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Trueno'
    ];

    // Alérgenos para Sublingual (no exclusivos de Alxoid)
    const alergenosSublingual = [
      'Abedul', 'Ácaros', 'Álamo del este', 'Alheña', 'Ambrosía', 'Caballo',
      'Camarón', 'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana',
      'Mezcla cucarachas', 'Mezcla pastos', 'Mezquite', 'Perro', 'Pescado varios',
      'Pino blanco', 'Pistache', 'Sweet gum', 'Trueno'
    ];

    // Alérgenos exclusivos para Alxoid (diferentes de los otros tratamientos)
    const alergenosAlxoidExclusivos = [
      'Cupressus Arizónica', 'Fresno', 'Gramínea con sinodon', 'Sinodon', '6 Gramíneas'
    ];

    // Alérgenos compartidos que necesitan versión exclusiva para Alxoid
    const alergenosCompartidos = [
      'Ambrosía', 'Ácaros', 'Encino', 'Gato', 'Perro'
    ];

    // Crear alérgenos no exclusivos (para Glicerinado y Sublingual)
    const todosAlergenosNoExclusivos = Array.from(new Set([
      ...alergenosGlicerinado, 
      ...alergenosSublingual
    ])).filter(alergeno => !alergenosAlxoidExclusivos.includes(alergeno)); // Excluir alérgenos exclusivos de Alxoid
    
    for (const nombreAlergeno of todosAlergenosNoExclusivos) {
      const existing = await prisma.allergen.findFirst({ where: { name: nombreAlergeno } });
      if (!existing) {
        await prisma.allergen.create({ 
          data: { 
            name: nombreAlergeno,
            isAlxoidExclusive: false,
            alxoidType: null
          } 
        });
        console.log(`✅ Creado alérgeno no exclusivo: ${nombreAlergeno}`);
      }
    }

    // Crear alérgenos exclusivos de Alxoid Tipo A
    const alergenosAlxoidA = [
      ...alergenosAlxoidExclusivos, // Alérgenos exclusivos para Tipo A
      ...alergenosCompartidos.map(nombre => `${nombre} A`)
    ];

    for (const nombreAlergeno of alergenosAlxoidA) {
      const existing = await prisma.allergen.findFirst({ where: { name: nombreAlergeno } });
      if (!existing) {
        await prisma.allergen.create({ 
          data: { 
            name: nombreAlergeno,
            isAlxoidExclusive: true,
            alxoidType: 'A'
          } 
        });
        console.log(`✅ Creado alérgeno Alxoid Tipo A: ${nombreAlergeno}`);
      }
    }

    // Crear alérgenos exclusivos de Alxoid Tipo B
    const alergenosAlxoidB = [
      ...alergenosAlxoidExclusivos.map(nombre => `${nombre} B`), // Alérgenos exclusivos para Tipo B (con sufijo B)
      ...alergenosCompartidos.map(nombre => `${nombre} B`)
    ];

    for (const nombreAlergeno of alergenosAlxoidB) {
      const existing = await prisma.allergen.findFirst({ where: { name: nombreAlergeno } });
      if (!existing) {
        await prisma.allergen.create({ 
          data: { 
            name: nombreAlergeno,
            isAlxoidExclusive: true,
            alxoidType: 'B'
          } 
        });
        console.log(`✅ Creado alérgeno Alxoid Tipo B: ${nombreAlergeno}`);
      }
    }

    // 4. CREAR PRODUCTOS
    console.log('\n💊 Creando productos...');

    // Productos de Inmunoterapia - Glicerinado
    const productosGlicerinado = [
      { name: 'Glicerinado Frasco #1', cost: 150.00 },
      { name: 'Glicerinado Frasco #2', cost: 150.00 },
      { name: 'Glicerinado Frasco #3', cost: 150.00 },
      { name: 'Glicerinado Frasco #4', cost: 150.00 },
      { name: 'Glicerinado Frasco #5', cost: 150.00 },
      { name: 'Glicerinado Frasco #6', cost: 150.00 },
      { name: 'Glicerinado Bacteriana', cost: 200.00 }
    ];

    for (const producto of productosGlicerinado) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'COMPLEX',
            unit: 'ML',
            description: 'Producto glicerinado para inmunoterapia',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 10
      }
    });
        console.log(`✅ Creado producto: ${producto.name}`);
      }
    }

    // Productos de Inmunoterapia - Alxoid
    const productosAlxoid = [
      { name: 'Alxoid Tipo A', cost: 300.00 },
      { name: 'Alxoid Tipo B', cost: 300.00 },
      { name: 'Alxoid Tipo B.2', cost: 300.00 }
    ];

    for (const producto of productosAlxoid) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'COMPLEX',
            unit: 'ML',
            description: 'Producto Alxoid para inmunoterapia',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 5
          }
        });
        console.log(`✅ Creado producto: ${producto.name}`);
      }
    }

    // Productos de Inmunoterapia - Sublingual
    const productosSublingual = [
      { name: 'Sublingual Frasco 1', cost: 250.00 },
      { name: 'Sublingual Frasco 2', cost: 250.00 },
      { name: 'Sublingual Frasco 3', cost: 250.00 },
      { name: 'Sublingual Frasco 4', cost: 250.00 }
    ];

    for (const producto of productosSublingual) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'COMPLEX',
            unit: 'ML',
            description: 'Producto sublingual para inmunoterapia',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 8
          }
        });
        console.log(`✅ Creado producto: ${producto.name}`);
      }
    }

    // Productos de Pruebas
    const productosPruebas = [
      { name: 'ALEX Molecular', cost: 500.00 },
      { name: 'Phadiatop', cost: 400.00 },
      { name: 'Prick', cost: 300.00 },
      { name: 'Prick to Prick', cost: 350.00 },
      { name: 'Pruebas con Alimentos', cost: 450.00 },
      { name: 'Suero', cost: 200.00 },
      { name: 'FeNO', cost: 600.00 },
      { name: 'COVID/Influenza', cost: 400.00 },
      { name: 'Estreptococo B', cost: 350.00 },
      { name: 'Influenza A y B / Sincitial / Adenovirus', cost: 500.00 }
    ];

    for (const producto of productosPruebas) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'SIMPLE',
            unit: 'PIECE',
            description: 'Prueba de diagnóstico',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 20
          }
        });
        console.log(`✅ Creado producto: ${producto.name}`);
      }
    }

    // Productos de Gammaglobulina
    const productosGammaglobulina = [
      { name: 'Hizentra 4GR', cost: 8000.00 },
      { name: 'Hizentra 2GR', cost: 4000.00 },
      { name: 'TENGELINE 10% 5G/50ML', cost: 6000.00 },
      { name: 'TENGELINE 10G/100ML', cost: 12000.00 },
      { name: 'HIGLOBIN 10GR', cost: 10000.00 }
    ];

    for (const producto of productosGammaglobulina) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'SIMPLE',
            unit: 'PIECE',
            description: 'Gammaglobulina',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 5
          }
        });
        console.log(`✅ Creado producto: ${producto.name}`);
      }
    }

    // Productos de Vacunas Pediátricas
    const productosVacunas = [
      { name: 'Adacel Boost', cost: 800.00 },
      { name: 'Gardasil', cost: 1200.00 },
      { name: 'Gardasil 9', cost: 1500.00 },
      { name: 'Hepatitis A y B', cost: 600.00 },
      { name: 'Fiebre Amarilla', cost: 400.00 },
      { name: 'Herpes Zóster', cost: 2000.00 },
      { name: 'Hexacima', cost: 1000.00 },
      { name: 'Influenza', cost: 300.00 },
      { name: 'Menactra', cost: 1200.00 },
      { name: 'MMR', cost: 500.00 },
      { name: 'Prevenar 13 V', cost: 1800.00 },
      { name: 'Proquad', cost: 1600.00 },
      { name: 'Pulmovax', cost: 700.00 },
      { name: 'Rota Teq', cost: 900.00 },
      { name: 'Vaqta', cost: 400.00 },
      { name: 'Varivax', cost: 600.00 }
    ];

    for (const producto of productosVacunas) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'SIMPLE',
            unit: 'PIECE',
            description: 'Vacuna pediátrica',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 15
          }
        });
        console.log(`✅ Creado producto: ${producto.name}`);
      }
    }

    // Productos de Medicamentos Extras
    const productosMedicamentos = [
      { name: 'Bacmune', cost: 150.00 },
      { name: 'Transferón', cost: 200.00 },
      { name: 'Diprospán', cost: 100.00 },
      { name: 'Nebulización', cost: 80.00 }
    ];

    for (const producto of productosMedicamentos) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'SIMPLE',
            unit: 'PIECE',
            description: 'Medicamento extra',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 25
          }
  });
        console.log(`✅ Creado producto: ${producto.name}`);
      }
    }

    // Producto de Consulta
    const productosConsulta = [
      { name: 'Consulta', cost: 500.00 }
    ];

    for (const producto of productosConsulta) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'SIMPLE',
            unit: 'PIECE',
            description: 'Consulta médica',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 30
          }
        });
        console.log(`✅ Creado producto: ${producto.name}`);
      }
    }

    // Productos Diluyentes para Inmunoterapia
    const productosDiluyentes = [
      { name: 'Bacteriana', cost: 50.00 },
      { name: 'Evans', cost: 30.00 },
      { name: 'VITS', cost: 40.00 }
    ];

    for (const producto of productosDiluyentes) {
      const existing = await prisma.product.findFirst({ where: { name: producto.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: producto.name,
            type: 'SIMPLE',
            unit: 'ML',
            description: 'Diluyente para inmunoterapia',
            costPerUnit: new Decimal(producto.cost),
            minStockLevel: 100
          }
        });
        console.log(`✅ Creado diluyente: ${producto.name}`);
      }
    }

    // Productos individuales para cada alérgeno
    console.log('\n🌿 Creando productos individuales para alérgenos...');
    const todosAlergenosDB = await prisma.allergen.findMany();
    
    for (const alergeno of todosAlergenosDB) {
      const existing = await prisma.product.findFirst({ where: { name: alergeno.name } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: alergeno.name,
            type: 'SIMPLE',
            unit: 'ML',
            description: `Alérgeno: ${alergeno.name}`,
            costPerUnit: new Decimal(25.00), // Costo base por alérgeno
            minStockLevel: 50
          }
        });
        console.log(`✅ Creado producto para alérgeno: ${alergeno.name}`);
      }
    }

    // 5. CREAR PROVEEDORES
    console.log('\n🏢 Creando proveedores...');
    const proveedores = [
      'DIEMSA',
      'Farmacias Especializadas', 
      'Solutesa',
      'Inmunotek',
      'ABBOTT',
      'Bio Tec Vacunas'
    ];

    for (const nombreProveedor of proveedores) {
      const existing = await prisma.supplier.findFirst({ where: { name: nombreProveedor } });
      if (!existing) {
        await prisma.supplier.create({
          data: {
            name: nombreProveedor,
            invoiceNumber: `INV-${nombreProveedor.toUpperCase().replace(/\s+/g, '')}-001`,
            amountSupplied: new Decimal(10000.00)
          }
        });
        console.log(`✅ Creado proveedor: ${nombreProveedor}`);
      }
    }

    // 6. CREAR STOCK INICIAL
    console.log('\n📦 Creando stock inicial...');
    
    // Obtener todos los productos
    const todosProductos = await prisma.product.findMany();
    
    // Crear stock para cada producto en ambas sedes
    for (const producto of todosProductos) {
      // Stock en Tecamachalco
      await prisma.stockBySede.upsert({
      where: {
        productId_sedeId: {
            productId: producto.id,
            sedeId: sedeTecamachalco.id
          }
      },
        update: {},
        create: {
          productId: producto.id,
          sedeId: sedeTecamachalco.id,
          quantity: new Decimal(50) // Stock inicial de 50 unidades
        }
      });

      // Stock en Ángeles
      await prisma.stockBySede.upsert({
        where: {
          productId_sedeId: {
            productId: producto.id,
            sedeId: sedeAngeles.id
          }
        },
        update: {},
      create: {
          productId: producto.id,
          sedeId: sedeAngeles.id,
          quantity: new Decimal(50) // Stock inicial de 50 unidades
        }
      });

      // Crear expiración para cada producto (ejemplo: 1 año)
      const fechaExpiracion = new Date();
      fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1);

      const existingExpirationTecamachalco = await prisma.productExpiration.findFirst({
        where: {
          productId: producto.id,
          sedeId: sedeTecamachalco.id,
          batchNumber: `BATCH-${producto.id.substring(0, 8)}`
        }
      });

      if (!existingExpirationTecamachalco) {
        await prisma.productExpiration.create({
          data: {
            productId: producto.id,
            sedeId: sedeTecamachalco.id,
            batchNumber: `BATCH-${producto.id.substring(0, 8)}`,
            expiryDate: fechaExpiracion,
            quantity: 50
          }
        });
      }

      const existingExpirationAngeles = await prisma.productExpiration.findFirst({
        where: {
          productId: producto.id,
          sedeId: sedeAngeles.id,
          batchNumber: `BATCH-${producto.id.substring(0, 8)}`
        }
      });

      if (!existingExpirationAngeles) {
        await prisma.productExpiration.create({
          data: {
            productId: producto.id,
            sedeId: sedeAngeles.id,
            batchNumber: `BATCH-${producto.id.substring(0, 8)}`,
            expiryDate: fechaExpiracion,
            quantity: 50
      }
    });
  }
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    const totalAlergenos = await prisma.allergen.count();
    console.log(`- ${2} sedes creadas`);
    console.log(`- ${6} usuarios creados`);
    console.log(`- ${totalAlergenos} alérgenos creados`);
    console.log(`- ${todosProductos.length} productos creados`);
    console.log(`- ${proveedores.length} proveedores creados`);
    console.log(`- Stock inicial configurado para todas las sedes`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 