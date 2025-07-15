import { BadRequestException } from '@nestjs/common';
import { InventoryExitDto, ProductUsageDto, TreatmentType, Subtype, UnitType } from '../dto/inventory-exit.dto';

// Constants for calculations
const FRASCO_FACTORS = [0.002, 0.005, 0.02, 0.05, 0.2, 0.5];
const ML_FRASCO_MADRE_FACTORS = [0.002, 0.005, 0.02, 0.05];

// More explicit type for GoogleFormResponse
interface GoogleFormResponse {
  'ID de la sede': string;
  'ID del usuario': string;
  'Tipo de tratamiento': string;
  'Alergenos'?: string[];
  'Dosis A'?: number | string;
  'Dosis B'?: number | string;
  'Dosis B.2'?: number | string;
  'Número de frascos'?: number | string;
  'Unidades'?: number | string;
  'Frasco factor'?: number | string;
  'Lista de alérgenos'?: string[];
  'Frasco madre'?: number | string;
  'Alérgenos sublingual'?: string[];
  'Vacuna Bacmune'?: number | string;
  'Prueba COVID'?: number | string;
  'Vacunas pediátricas'?: number | string;
  'Gammaglobulina'?: number | string;
  // Allow dynamic access for simple product fields
  [key: string]: string | number | string[] | undefined;
}

function validateNumber(value: number | string | undefined, fieldName: string): number {
  if (value === undefined) return 0;
  const num = Number(value);
  if (isNaN(num)) {
    throw new BadRequestException(`${fieldName} must be a valid number`);
  }
  return num;
}

// TODO: Implement a real mapping from allergen/product name to productId
function getProductIdFromName(name: string): string {
  // This should be replaced with a real lookup (e.g., from DB or a static map)
  return '';
}

export function mapGoogleFormToInventoryExitDto(form: GoogleFormResponse): InventoryExitDto {
  // Validate required common fields
  if (!form['ID de la sede']) throw new BadRequestException('ID de la sede is required');
  if (!form['ID del usuario']) throw new BadRequestException('ID del usuario is required');
  if (!form['Tipo de tratamiento']) throw new BadRequestException('Tipo de tratamiento is required');

  const productsUsed: ProductUsageDto[] = [];
  let treatmentType: TreatmentType;
  let subtype: Subtype | undefined;

  switch (form['Tipo de tratamiento']) {
    case 'Alxoid':
      treatmentType = TreatmentType.ALXOID;
      if (!form['Alergenos']?.length) throw new BadRequestException('Alergenos are required for Alxoid');
      const dosisA = validateNumber(form['Dosis A'], 'Dosis A');
      const dosisB = validateNumber(form['Dosis B'], 'Dosis B');
      const dosisB2 = validateNumber(form['Dosis B.2'], 'Dosis B.2');
      if (dosisA === 0 && dosisB === 0 && dosisB2 === 0) {
        throw new BadRequestException('At least one dose (A, B, or B.2) is required for Alxoid');
      }
      form['Alergenos'].forEach(allergen => {
        const productId = getProductIdFromName(allergen); // TODO: Map allergen name to productId
        if (dosisA > 0) {
          productsUsed.push({
            productId,
            productName: allergen,
            quantity: dosisA * 0.5,
            unitType: UnitType.ML,
          });
        }
        const totalDosisB = dosisB + dosisB2;
        if (totalDosisB > 0) {
          productsUsed.push({
            productId,
            productName: allergen,
            quantity: totalDosisB * 0.2,
            unitType: UnitType.ML,
          });
        }
      });
      break;
    case 'Glicerinado - En Frasco':
      treatmentType = TreatmentType.GLICERINADO;
      subtype = Subtype.EN_FRASCO;
      const numeroFrasco = validateNumber(form['Número de frascos'], 'Número de frascos');
      if (!form['Lista de alérgenos']?.length) throw new BadRequestException('Lista de alérgenos is required');
      const frascoIndex = numeroFrasco - 1;
      if (frascoIndex < 0 || frascoIndex >= FRASCO_FACTORS.length) {
        throw new BadRequestException('Invalid número de frascos');
      }
      form['Lista de alérgenos'].forEach(allergen => {
        const productId = getProductIdFromName(allergen); // TODO: Map allergen name to productId
        productsUsed.push({
          productId,
          productName: allergen,
          quantity: FRASCO_FACTORS[frascoIndex],
          unitType: UnitType.ML,
        });
      });
      break;
    case 'Glicerinado - Por Unidad':
      treatmentType = TreatmentType.GLICERINADO;
      subtype = Subtype.POR_UNIDAD;
      const unidades = validateNumber(form['Unidades'], 'Unidades');
      const frascoFactor = validateNumber(form['Frasco factor'], 'Frasco factor');
      if (!form['Lista de alérgenos']?.length) throw new BadRequestException('Lista de alérgenos is required');
      const quantity = (unidades / 10000) * frascoFactor;
      form['Lista de alérgenos'].forEach(allergen => {
        const productId = getProductIdFromName(allergen); // TODO: Map allergen name to productId
        productsUsed.push({
          productId,
          productName: allergen,
          quantity,
          unitType: UnitType.ML,
        });
      });
      break;
    case 'Sublingual':
      treatmentType = TreatmentType.SUBLINGUAL;
      const frascoMadre = validateNumber(form['Frasco madre'], 'Frasco madre');
      if (!form['Alérgenos sublingual']?.length) throw new BadRequestException('Alérgenos sublingual is required');
      const frascoMadreIndex = frascoMadre - 1;
      if (frascoMadreIndex < 0 || frascoMadreIndex >= ML_FRASCO_MADRE_FACTORS.length) {
        throw new BadRequestException('Invalid frasco madre');
      }
      form['Alérgenos sublingual'].forEach(allergen => {
        const productId = getProductIdFromName(allergen); // TODO: Map allergen name to productId
        productsUsed.push({
          productId,
          productName: allergen,
          quantity: ML_FRASCO_MADRE_FACTORS[frascoMadreIndex],
          unitType: UnitType.ML,
        });
      });
      break;
    default:
      treatmentType = TreatmentType.SIMPLE;
      const simpleProducts = [
        { field: 'Vacuna Bacmune', defaultQuantity: 1 },
        { field: 'Prueba COVID', defaultQuantity: 1 },
        { field: 'Vacunas pediátricas', defaultQuantity: 1 },
        { field: 'Gammaglobulina', defaultQuantity: 1 },
      ];
      let hasSimpleProduct = false;
      simpleProducts.forEach(({ field, defaultQuantity }) => {
        const quantity = validateNumber(form[field] as string | number | undefined, field);
        if (quantity > 0) {
          hasSimpleProduct = true;
          const productId = getProductIdFromName(field); // TODO: Map product name to productId
          productsUsed.push({
            productId,
            productName: field,
            quantity: quantity || defaultQuantity,
            unitType: UnitType.PIECE,
          });
        }
      });
      if (!hasSimpleProduct) {
        throw new BadRequestException('No simple product was selected');
      }
  }
  if (productsUsed.length === 0) {
    throw new BadRequestException('No products were calculated for the treatment');
  }
  return {
    productName: '', // Not used in this context, but required by DTO
    quantity: 0, // Not used in this context, but required by DTO
    unitType: UnitType.UNIT, // Not used in this context, but required by DTO
    userId: form['ID del usuario'],
    sedeId: form['ID de la sede'],
    treatmentType,
    subtype,
    productsUsed,
  };
} 