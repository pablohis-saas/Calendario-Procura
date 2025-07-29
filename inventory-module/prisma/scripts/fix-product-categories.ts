import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categoryMap: Record<string, string> = {
  // Alérgenos Alxoid
  'Cupressus Arizónica': 'Alérgenos Alxoid',
  'Fresno': 'Alérgenos Alxoid',
  'Gramínea con sinodon': 'Alérgenos Alxoid',
  'Sinodon': 'Alérgenos Alxoid',
  '6 Gramíneas': 'Alérgenos Alxoid',
  'Ambrosía A': 'Alérgenos Alxoid',
  'Ácaros A': 'Alérgenos Alxoid',
  'Encino A': 'Alérgenos Alxoid',
  'Gato A': 'Alérgenos Alxoid',
  'Perro A': 'Alérgenos Alxoid',
  'Cupressus Arizónica B': 'Alérgenos Alxoid',
  'Fresno B': 'Alérgenos Alxoid',
  'Gramínea con sinodon B': 'Alérgenos Alxoid',
  'Sinodon B': 'Alérgenos Alxoid',
  '6 Gramíneas B': 'Alérgenos Alxoid',
  'Ambrosía B': 'Alérgenos Alxoid',
  'Ácaros B': 'Alérgenos Alxoid',
  'Encino B': 'Alérgenos Alxoid',
  'Gato B': 'Alérgenos Alxoid',
  'Perro B': 'Alérgenos Alxoid',
  // Alérgenos
  'Abedul': 'Alérgenos',
  'Ácaros': 'Alérgenos',
  'Álamo del este': 'Alérgenos',
  'Alheña': 'Alérgenos',
  'Ambrosía': 'Alérgenos',
  'Caballo': 'Alérgenos',
  'Camarón': 'Alérgenos',
  'Ciprés de Arizona': 'Alérgenos',
  'Encino': 'Alérgenos',
  'Fresno blanco': 'Alérgenos',
  'Gato': 'Alérgenos',
  'Manzana': 'Alérgenos',
  'Mezcla cucarachas': 'Alérgenos',
  'Mezcla pastos': 'Alérgenos',
  'Mezquite': 'Alérgenos',
  'Perro': 'Alérgenos',
  'Pescado varios': 'Alérgenos',
  'Pino blanco': 'Alérgenos',
  'Pistache': 'Alérgenos',
  'Sweet gum': 'Alérgenos',
  'Trueno': 'Alérgenos',
  // Vacunas Pediátricas
  'Adacel Boost': 'Vacunas Pediátricas',
  'Gardasil': 'Vacunas Pediátricas',
  'Gardasil 9': 'Vacunas Pediátricas',
  'Hepatitis A y B': 'Vacunas Pediátricas',
  'Fiebre Amarilla': 'Vacunas Pediátricas',
  'Herpes Zóster': 'Vacunas Pediátricas',
  'Hexacima': 'Vacunas Pediátricas',
  'Influenza': 'Vacunas Pediátricas',
  'Menactra': 'Vacunas Pediátricas',
  'MMR': 'Vacunas Pediátricas',
  'Prevenar 13 V': 'Vacunas Pediátricas',
  'Proquad': 'Vacunas Pediátricas',
  'Pulmovax': 'Vacunas Pediátricas',
  'Rota Teq': 'Vacunas Pediátricas',
  'Vaqta': 'Vacunas Pediátricas',
  'Varivax': 'Vacunas Pediátricas',
  'Varicela': 'Vacunas Pediátricas',
  // Medicamentos
  'Bacmune': 'Medicamentos',
  'Transferón': 'Medicamentos',
  'Diprospán': 'Medicamentos',
  'Nebulización': 'Medicamentos',
  // Gammaglobulina
  'Hizentra 4GR': 'Gammaglobulina',
  'Hizentra 2GR': 'Gammaglobulina',
  'TENGELINE 10% 5G/50ML': 'Gammaglobulina',
  'TENGELINE 10G/100ML': 'Gammaglobulina',
  'HIGLOBIN 10GR': 'Gammaglobulina',
  // Otros ejemplos (agrega más según tu catálogo real)
  'ALEX Molecular': 'Pruebas',
  'Pruebas con Alimentos': 'Pruebas',
  'Consulta': 'Servicios',
  'Evans': 'Pruebas',
  'Phadiatop': 'Pruebas',
  'Influenza A y B / Sincitial / Adenovirus': 'Pruebas',
  'VITS': 'Pruebas',
  'Prick to Prick': 'Pruebas',
};

async function main() {
  for (const [name, category] of Object.entries(categoryMap)) {
    const result = await prisma.product.updateMany({
      where: {
        name,
        OR: [
          { category: null },
          { category: '' },
          { category: 'Sin categoría' }
        ]
      },
      data: { category }
    });
    if (result.count > 0) {
      console.log(`Producto "${name}" actualizado a categoría "${category}" (${result.count} registros)`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 