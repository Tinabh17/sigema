import { z } from "zod";

export const createMantenimientoAmbienteSchema = z.object({
    id_ambiente: z.number({
        required_error: "El ID del ambiente es obligatorio",
    }).int().positive(),

    imagen: z.string().nullable().optional(),

    fecha_programada: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato de fecha inválido (YYYY-MM-DD)" })
        .optional(),

    descripcion: z.string().max(900, { message: "La descripción no puede superar los 900 caracteres" }).optional()
});

export const updateMantenimientoAmbienteSchema = createMantenimientoAmbienteSchema.partial();
