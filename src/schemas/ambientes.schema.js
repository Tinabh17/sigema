import { z } from "zod";

export const createAmbienteSchema = z.object({
    numero_ambiente: z.number({
        required_error: "El número del ambiente es obligatorio",
    }).int().positive(),

    nombre_ambiente: z.string().max(255).optional(),

    tipo_ambiente: z.number({
        required_error: "El tipo de ambiente es obligatorio",
    }).int().positive(),

    ubicacion: z.string({
        required_error: "La ubicación es obligatoria",
    }).max(255, { message: "La ubicación no puede estar vacía" }),

    capacidad: z.number().int().nonnegative().optional(),

    imagen: z.string().nullable().optional(),

    estado: z.number({
        required_error: "El estado es obligatorio",
    }).int().positive(),

});

export const updateAmbienteSchema = createAmbienteSchema.partial();
