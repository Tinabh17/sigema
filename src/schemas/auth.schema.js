import { z } from "zod";

export const registerSchema = z.object({
    tipo_documento: z.number({
        required_error: "El tipo de documento es obligatorio",
    }).int().positive(),

    numero_documento: z.number({
        required_error: "El número de documento es obligatorio",
    }).int().positive(),

    nombre: z.string({
        required_error: "El nombre es obligatorio"
    }).min(2, { message: "El nombre debe tener al menos 2 caracteres" }).trim(),

    apellido: z.string({
        required_error: "El apellido es obligatorio"
    }).min(2, { message: "El apellido debe tener al menos 3 caracteres" }).trim(),

    email: z.string({
        required_error: "El email es obligatorio"
    }).email({ message: "Debe ser un correo válido" }).trim(),

    telefono: z.string().min(7, { message: "El teléfono debe tener al menos 7 dígitos" }).regex(/^\d+$/, { message: "El teléfono solo debe contener números" })
    .optional(),

    direccion: z.string().optional(),

    password: z.string({
        required_error: "La contraseña es obligatoria"
    }).min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),

    rol: z.number({
        required_error: "El rol es obligatorio",
    }).int().positive()
});

export const loginSchema = z.object({
    tipo_documento: z.number({
        required_error: "El tipo de documento es obligatorio",
    }).int().positive(),

    numero_documento: z.number({
        required_error: "El número de documento es obligatorio",
    }).int().positive(),

    password: z.string({
        required_error: "La contraseña es obligatoria"
    }).min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

