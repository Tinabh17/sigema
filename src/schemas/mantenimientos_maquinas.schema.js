import { z } from "zod";

export const createMantenimientoMaquinaSchema = z.object({
    id_maquina: z.number({
        required_error: "El ID de la máquina es obligatorio",
    }).int().positive(),

    imagen: z.string().nullable().optional(),

    fecha_programada: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato de fecha inválido (YYYY-MM-DD)" })
        .optional(),

    responsable: z.string().max(255).nullable().optional(),

    email: z.string().email().nullable().optional(),

    tipo_mantenimiento: z.number({
        required_error: "El tipo de mantenimiento es obligatorio",
    }).int().positive(),

    estado: z.number({
        required_error: "El estado es obligatorio",
    }).int().positive(),
    
    descripcion: z.string().nullable().optional(),
});

export const updateMantenimientoMaquinaSchema = createMantenimientoMaquinaSchema.partial();