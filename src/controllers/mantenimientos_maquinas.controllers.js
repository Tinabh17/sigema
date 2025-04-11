import { createMantenimientoMaquina, getMantenimientoMaquinaById, getAllMantenimientosMaquinas, updateMantenimientoMaquina, deleteMantenimientoMaquina } from "../models/mantenimientos_maquinas.models.js";
import { createMantenimientoMaquinaSchema, updateMantenimientoMaquinaSchema } from "../schemas/mantenimientos_maquinas.schema.js";
import nodemailer from 'nodemailer';
import { getMaquinaById } from "../models/maquinas.models.js";
import dotenv from "dotenv";
dotenv.config();



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

export const notiMante = async (email, responsable, tipo, estado) => {
    const estados = {
        1: "Pendiente", 
        2: "En proceso",
        3: "Completado"
    };

    const tipoTexto = tipo === 1 ? "Preventivo" : "Correctivo";

    const mailOptions = {
        from: `"Gestión de Mantenimiento" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Nuevo mantenimiento asignado a ${responsable}`,
        html: `
            <h2>Hola ${responsable},</h2>
            <p>Se te ha asignado un mantenimiento <strong>${tipoTexto}</strong>.</p>
            <p>El estado actual del mantenimiento es: <strong>${estados[estado]}</strong></p>
            <p>Por favor dirigete al responsable de la máquina en cuestión para los detalles</p>
            <p>Atentamente,</p>
            <p><strong> SIGEMA </strong></p>
        `
    };

    await transporter.sendMail(mailOptions);
};
export const notiManteCuentadante = async (email, nombreCuentadante, responsable, tipo, estado) => {
    const estados = {
        1: "Pendiente", 
        2: "En proceso",
        3: "Completado"
    };

    const tipoTexto = tipo === 1 ? "Preventivo" : "Correctivo";

    const mailOptions = {
        from: `"Gestión de Mantenimiento" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Nuevo mantenimiento asignado a ${responsable}`,
        html: `
            <h2>Hola ${nombreCuentadante},</h2>
            <p>Se le ha asignado el mantenimiento de una máquina a su cargo, a ${responsable}, de tipo <strong>${tipoTexto}</strong>.</p>
            <p>El estado actual del mantenimiento es: <strong>${estados[estado]}</strong></p>
            <p>Por favor diríjase al responsable del mantenimiento para más detalles.</p>
            <p>Atentamente,</p>
            <p><strong>SIGEMA</strong></p>
        `
    };

    await transporter.sendMail(mailOptions);
};



// Controlador para crear un nuevo mantenimiento
export const createMantenimientoMaquinaController = async (req, res) => {
    try {
        console.log("Datos recibidos en req.body:", req.body);
        console.log("Archivo recibido en req.file:", req.file);

        const rawBody = {
            ...req.body,
            id_maquina: req.body.id_maquina ? parseInt(req.body.id_maquina, 10) : undefined,
            tipo_mantenimiento: req.body.tipo_mantenimiento ? parseInt(req.body.tipo_mantenimiento, 10) : undefined,
            estado: req.body.estado ? parseInt(req.body.estado, 10) : undefined,
        };
        
        const validation = createMantenimientoMaquinaSchema.safeParse(rawBody);
        if (!validation.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                detalles: validation.error.errors,
            });
        }
        
        const imagenUrl = req.file
            ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
            : null;
        
        const {
            id_maquina,
            fecha_programada,
            responsable,
            email,
            tipo_mantenimiento,
            estado,
            descripcion,
        } = validation.data;


        const mantenimiento_maquinaData = {
            id_maquina,
            imagen: imagenUrl ?? null,
            fecha_programada: fecha_programada ?? null,
            responsable: responsable ?? null,
            email: email ?? null,
            tipo_mantenimiento,
            estado,
            descripcion: descripcion ?? null,
        };


        const maquina = await getMaquinaById(id_maquina);

        if (!maquina) {
         return res.status(404).json({ error: "Máquina no encontrada" });
        }

        const emailCuentadante = maquina.email;
        const nombreCuentadante = maquina.cuentadante;


        const mantenimiento_maquinaId = await createMantenimientoMaquina(mantenimiento_maquinaData);

        await notiMante(email, responsable, tipo_mantenimiento, estado);

        if (emailCuentadante) {
            await notiManteCuentadante(emailCuentadante, nombreCuentadante, responsable, tipo_mantenimiento, estado);
        }

        res.status(201).json({
            message: "Mantenimiento creado exitosamente",
            id: mantenimiento_maquinaId,
        });
    } catch (error) {
        console.error("Error al crear el mantenimiento:", error.message);
        res.status(500).json({
            error: "Error al crear el mantenimiento",
            detalles: error.message,
        });
    }
};

// Controlador para obtener un mantenimiento por ID
export const getMantenimientoMaquinaByIdController = async (req, res) => {
    try {
        const id_mantenimiento = parseInt(req.params.id_mantenimiento, 10);
        if (isNaN(id_mantenimiento)) return res.status(400).json({ error: "ID inválido" });
    
        const mantenimientoMaquina = await getMantenimientoMaquinaById(id_mantenimiento);
        if (!mantenimientoMaquina) return res.status(404).json({ error: "Mantenimiento no encontrado" });
    
        res.status(200).json(mantenimientoMaquina);
    } catch (error) {
        console.error( "Error al obtener el mantenimiento", error.message);
        res.status(500).json({ error: "Error al obtener el mantenimiento" });
    }
};

// Controlador para obtener todos los mantenimientos
export const getAllMantenimientosMaquinasController = async (req, res) => {
    try {
        const mantenimientosMaquinas = await getAllMantenimientosMaquinas();
        res.status(200).json(mantenimientosMaquinas);
    } catch (error) {
        console.error( "Error al obtener los mantenimientos", error.message);
        res.status(500).json({ error: "Error al obtener los mantenimientos" });
    }
};

// Controlador para actualizar un mantenimiento por ID
export const updateMantenimientoMaquinaController = async (req, res) => {
    try {
        const id_mantenimiento = parseInt(req.params.id_mantenimiento, 10);
        if (isNaN(id_mantenimiento)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        // Convertir valores numéricos solo para los campos permitidos
        const rawBody = {
            ...req.body,
            id_maquina: req.body.id_maquina !== undefined ? parseInt(req.body.id_maquina, 10) : undefined,
            tipo_mantenimiento: req.body.tipo_mantenimiento !== undefined ? parseInt(req.body.tipo_mantenimiento, 10) : undefined,
            estado: req.body.estado !== undefined ? parseInt(req.body.estado, 10) : undefined,
        };

        const validation = updateMantenimientoMaquinaSchema.safeParse(rawBody);
        if (!validation.success) {
            return res.status(400).json({ error: "Datos inválidos", detalles: validation.error.errors });
        }

        const data = validation.data;

        const updatedData = {
            ...data,
            imagen: req.file
                ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
                : undefined,
        };

        // Limpiar `undefined` para no enviar campos vacíos
        Object.keys(updatedData).forEach(
            key => updatedData[key] === undefined && delete updatedData[key]
        );

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ error: "No se proporcionaron campos válidos para actualizar" });
        }
        
        const updated = await updateMantenimientoMaquina(id_mantenimiento, updatedData);
        if (!updated) {
            return res.status(404).json({ error: "Máquina no encontrada" });
        }
        
        res.status(200).json({ message: "Mantenimiento actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar el mantenimiento:", error.message);
        res.status(500).json({ error: "Error al actualizar la mantenimiento" });
    }
};

// Controlador para eliminar un mantenimiento por ID
export const deleteMantenimientoMaquinaController = async (req, res) => {
    try {
        const id_mantenimiento = parseInt(req.params.id_mantenimiento, 10);
        if (isNaN(id_mantenimiento)) return res.status(400).json({ error: "ID inválido" });
    
        const deleted = await deleteMantenimientoMaquina(id_mantenimiento);
        if (!deleted) return res.status(404).json({ error: "Mantenimiento no encontrado" });
                
        res.status(200).json({ message: "Mantenimiento eliminado correctamente" });
    } catch (error) {
        console.error(" Error al eliminar el mantenimiento:", error.message);
        res.status(500).json({ error: "Error al eliminar el mantenimiento" });
    }
};
