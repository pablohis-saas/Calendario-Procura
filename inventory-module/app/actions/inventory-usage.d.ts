export declare const processInventoryUsage: import("next-safe-action").SafeActionFn<string, import("zod").ZodEffects<import("zod").ZodObject<{
    nombrePaciente: import("zod").ZodString;
    tipoTratamiento: import("zod").ZodNativeEnum<{
        INMUNOTERAPIA: "INMUNOTERAPIA";
        PRUEBAS: "PRUEBAS";
        GAMMAGLOBULINA: "GAMMAGLOBULINA";
        VACUNAS_PEDIATRICAS: "VACUNAS_PEDIATRICAS";
        MEDICAMENTOS_EXTRAS: "MEDICAMENTOS_EXTRAS";
        CONSULTA: "CONSULTA";
    }>;
    observaciones: import("zod").ZodOptional<import("zod").ZodString>;
    tuvoReaccion: import("zod").ZodBoolean;
    descripcionReaccion: import("zod").ZodOptional<import("zod").ZodString>;
    items: import("zod").ZodArray<import("zod").ZodObject<{
        subtipo: import("zod").ZodString;
        nombreProducto: import("zod").ZodString;
        cantidad: import("zod").ZodNumber;
        frasco: import("zod").ZodOptional<import("zod").ZodString>;
        alergenos: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
    }, "strip", import("zod").ZodTypeAny, {
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
}, "strip", import("zod").ZodTypeAny, {
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
}>, readonly [], {
    _errors?: string[] | undefined;
} & {
    items?: {
        _errors?: string[];
    }[] | {
        _errors?: string[] | undefined;
    } | undefined;
    nombrePaciente?: {
        _errors?: string[] | undefined;
    } | undefined;
    tipoTratamiento?: {
        _errors?: string[] | undefined;
    } | undefined;
    tuvoReaccion?: {
        _errors?: string[] | undefined;
    } | undefined;
    observaciones?: {
        _errors?: string[] | undefined;
    } | undefined;
    descripcionReaccion?: {
        _errors?: string[] | undefined;
    } | undefined;
}, {
    failure: string;
    success?: undefined;
    usageId?: undefined;
} | {
    success: string;
    usageId: string;
    failure?: undefined;
}>;
