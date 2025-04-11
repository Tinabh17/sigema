import { z } from "zod";

export const createMaquinaSchema = z.object({
    serie: z.string({
        required_error: "La serie es obligatoria",
    }).max(255, { message: "La serie no puede superar los 255 caracteres" }),

    marca: z.string({
        required_error: "La marca es obligatoria",
    }).max(100, { message: "La marca no puede superar los 100 caracteres" }),

    nombre: z.string({
        required_error: "El nombre es obligatorio",
    }).max(255, { message: "El nombre no puede superar los 255 caracteres" }),

    imagen: z.string().nullable().optional(),

    ambiente: z.number({
        required_error: "El ambiente es obligatorio",
    }).int().positive().nullable(),

    descripcion: z.string().nullable().optional(),

    fecha_adquisicion: z.string()
        .regex(/^(\d{4})-(\d{2})-(\d{2})$/, { message: "Formato de fecha inválido (YYYY-MM-DD)" }).nullable(),

    cedula: z.number().int().positive().nullable().optional(),

    cuentadante: z.string().max(255, { message: "El cuentadante no puede superar los 255 caracteres" }).nullable().optional(),

    email: z.string().email().nullable().optional(),

    estado: z.number({
        required_error: "El estado es obligatorio",
    }).int().positive(),

    observaciones: z.string().nullable().optional(),
});

export const updateMaquinaSchema = createMaquinaSchema.partial();
