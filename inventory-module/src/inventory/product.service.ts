import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma-service/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '@prisma/client';

// Utilidad para quitar tildes y pasar a minúsculas
function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<{ id: string; name: string }[]> {
    return this.prisma.product.findMany({ 
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
  }

  async create(dto: CreateProductDto): Promise<Product> {
    // Verificar si el producto ya existe
    const existingProduct = await this.prisma.product.findFirst({
      where: { name: dto.name }
    });

    if (existingProduct) {
      throw new BadRequestException(`El producto "${dto.name}" ya existe`);
    }

    // Crear el nuevo producto
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        type: dto.type,
        unit: dto.unit,
        description: dto.description,
        costPerUnit: new Decimal(dto.costPerUnit),
        minStockLevel: dto.minStockLevel,
        category: dto.category ?? null,
      },
    });

    return product;
  }

  async findByCategory(categoryName: string): Promise<{ id: string; name: string }[]> {
    // Mapear categorías a productos específicos basado en los datos existentes
    const categoryProducts: Record<string, string[]> = {
      'Alérgenos Alxoid': [
        'Cupressus Arizónica', 'Fresno', 'Gramínea con sinodon', 'Sinodon', '6 Gramíneas',
        'Ambrosía A', 'Ácaros A', 'Encino A', 'Gato A', 'Perro A',
        'Cupressus Arizónica B', 'Fresno B', 'Gramínea con sinodon B', 'Sinodon B', '6 Gramíneas B',
        'Ambrosía B', 'Ácaros B', 'Encino B', 'Gato B', 'Perro B',
      ],
      'Alérgenos': [
        'Abedul', 'Ácaros', 'Álamo del este', 'Alheña', 'Ambrosía', 'Caballo', 'Camarón',
        'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Mezcla cucarachas',
        'Mezcla pastos', 'Mezquite', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Sweet gum', 'Trueno',
      ],
      'Vacunas Pediátricas': [
        'Adacel Boost', 'Gardasil', 'Gardasil 9', 'Hepatitis A y B', 'Fiebre Amarilla', 'Herpes Zóster',
        'Hexacima', 'Influenza', 'Menactra', 'MMR', 'Prevenar 13 V', 'Proquad', 'Pulmovax', 'Rota Teq', 'Vaqta', 'Varivax',
      ],
      'Medicamentos': [
        'Bacmune', 'Transferón', 'Diprospán', 'Nebulización',
      ],
      'Gammaglobulina': [
        'Hizentra 4GR', 'Hizentra 2GR', 'TENGELINE 10% 5G/50ML', 'TENGELINE 10G/100ML', 'HIGLOBIN 10GR',
      ],
    };

    // Normalizar el nombre de la categoría recibida
    const normalizedCategory = normalize(categoryName);

    // Buscar productos hardcodeados por categoría (también normalizando la clave)
    const productNames = Object.entries(categoryProducts).find(
      ([key]) => normalize(key) === normalizedCategory
    )?.[1] || [];

    // Si no hay productos hardcodeados para esta categoría, devolver todos los productos con esa categoría (insensible a mayúsculas/tildes)
    if (productNames.length === 0) {
      return this.prisma.product.findMany({
        where: {
          category: {
            equals: categoryName,
          },
        },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      });
    }

    // Para categorías con productos hardcodeados, devolver esos productos + cualquier producto nuevo con esa categoría (insensible a mayúsculas/tildes)
    return this.prisma.product.findMany({
      where: {
        OR: [
          { name: { in: productNames } },
          { category: { equals: categoryName } }
        ]
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
  }
} 