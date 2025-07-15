import { z } from 'zod';
declare const inventoryUsageDetailSchema: z.ZodObject<{
    subtipo: z.ZodString;
    nombreProducto: z.ZodString;
    cantidad: z.ZodNumber;
    frasco: z.ZodOptional<z.ZodString>;
    alergenos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    subtipo: string;
    nombreProducto: string;
    cantidad: number;
    frasco?: string | undefined;
    alergenos?: string[] | undefined;
}, {
    subtipo: string;
    nombreProducto: string;
    cantidad: number;
    frasco?: string | undefined;
    alergenos?: string[] | undefined;
}>;
export declare const inventoryUsageSchema: z.ZodEffects<z.ZodObject<{
    nombrePaciente: z.ZodString;
    tipoTratamiento: z.ZodNativeEnum<{
        INMUNOTERAPIA: "INMUNOTERAPIA";
        PRUEBAS: "PRUEBAS";
        GAMMAGLOBULINA: "GAMMAGLOBULINA";
        VACUNAS_PEDIATRICAS: "VACUNAS_PEDIATRICAS";
        MEDICAMENTOS_EXTRAS: "MEDICAMENTOS_EXTRAS";
        CONSULTA: "CONSULTA";
    }>;
    observaciones: z.ZodOptional<z.ZodString>;
    tuvoReaccion: z.ZodBoolean;
    descripcionReaccion: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        subtipo: z.ZodString;
        nombreProducto: z.ZodString;
        cantidad: z.ZodNumber;
        frasco: z.ZodOptional<z.ZodString>;
        alergenos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        subtipo: string;
        nombreProducto: string;
        cantidad: number;
        frasco?: string | undefined;
        alergenos?: string[] | undefined;
    }, {
        subtipo: string;
        nombreProducto: string;
        cantidad: number;
        frasco?: string | undefined;
        alergenos?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        subtipo: string;
        nombreProducto: string;
        cantidad: number;
        frasco?: string | undefined;
        alergenos?: string[] | undefined;
    }[];
    nombrePaciente: string;
    tipoTratamiento: "INMUNOTERAPIA" | "PRUEBAS" | "GAMMAGLOBULINA" | "VACUNAS_PEDIATRICAS" | "MEDICAMENTOS_EXTRAS" | "CONSULTA";
    tuvoReaccion: boolean;
    observaciones?: string | undefined;
    descripcionReaccion?: string | undefined;
}, {
    items: {
        subtipo: string;
        nombreProducto: string;
        cantidad: number;
        frasco?: string | undefined;
        alergenos?: string[] | undefined;
    }[];
    nombrePaciente: string;
    tipoTratamiento: "INMUNOTERAPIA" | "PRUEBAS" | "GAMMAGLOBULINA" | "VACUNAS_PEDIATRICAS" | "MEDICAMENTOS_EXTRAS" | "CONSULTA";
    tuvoReaccion: boolean;
    observaciones?: string | undefined;
    descripcionReaccion?: string | undefined;
}>, {
    items: {
        subtipo: string;
        nombreProducto: string;
        cantidad: number;
        frasco?: string | undefined;
        alergenos?: string[] | undefined;
    }[];
    nombrePaciente: string;
    tipoTratamiento: "INMUNOTERAPIA" | "PRUEBAS" | "GAMMAGLOBULINA" | "VACUNAS_PEDIATRICAS" | "MEDICAMENTOS_EXTRAS" | "CONSULTA";
    tuvoReaccion: boolean;
    observaciones?: string | undefined;
    descripcionReaccion?: string | undefined;
}, {
    items: {
        subtipo: string;
        nombreProducto: string;
        cantidad: number;
        frasco?: string | undefined;
        alergenos?: string[] | undefined;
    }[];
    nombrePaciente: string;
    tipoTratamiento: "INMUNOTERAPIA" | "PRUEBAS" | "GAMMAGLOBULINA" | "VACUNAS_PEDIATRICAS" | "MEDICAMENTOS_EXTRAS" | "CONSULTA";
    tuvoReaccion: boolean;
    observaciones?: string | undefined;
    descripcionReaccion?: string | undefined;
}>;
export type InventoryUsageInput = z.infer<typeof inventoryUsageSchema>;
export type InventoryUsageDetailInput = z.infer<typeof inventoryUsageDetailSchema>;
export {};
