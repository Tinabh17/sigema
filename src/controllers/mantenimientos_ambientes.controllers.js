import { createMantenimientoAmbiente, getMantenimientoAmbienteById, getAllMantenimientosAmbientes, updateMantenimientoAmbiente, deleteMantenimientoAmbiente } from "../models/mantenimientos_ambientes.models.js";
import { createMantenimientoAmbienteSchema, updateMantenimientoAmbienteSchema } from "../schemas/mantenimientos_ambientes.schema.js";

// Controlador para crear un nuevo mantenimiento
export const createMantenimientoAmbienteController = async (req, res) => {
    try {
        console.log("Datos recibidos en req.body:", req.body);
        console.log("Archivo recibido en req.file:", req.file);
            
        const rawBody = {
            ...req.body,
            id_ambiente: req.body.id_ambiente ? parseInt(req.body.id_ambiente, 10) : undefined,
        };
            
        const validation = createMantenimientoAmbienteSchema.safeParse(rawBody);
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
            id_ambiente,
            fecha_programada,
            descripcion,
        } = validation.data;

        const mantenimiento_ambienteData = {
            id_ambiente,
            imagen: imagenUrl ?? null,
            fecha_programada: fecha_programada ?? null,
            descripcion: descripcion ?? null,
        };

        const mantenimiento_ambienteId = await createMantenimientoAmbiente(mantenimiento_ambienteData);
        res.status(201).json({
            message: "Mantenimiento creado exitosamente",
            id: mantenimiento_ambienteId,
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
export const getMantenimientoAmbienteByIdController = async (req, res) => {
    try {
        const id_mantenimiento = parseInt(req.params.id_mantenimiento, 10);
        if (isNaN(id_mantenimiento)) return res.status(400).json({ error: "ID inválido" });

        const mantenimientoAmbiente = await getMantenimientoAmbienteById(id_mantenimiento);
        if (!mantenimientoAmbiente) return res.status(404).json({ error: "Mantenimiento no encontrado" });

        res.status(200).json(mantenimientoAmbiente);
    } catch (error) {
        console.error( "Error al obtener el mantenimiento", error.message);
        res.status(500).json({ error: "Error al obtener el mantenimiento" });
    }
};

// Controlador para obtener todos los mantenimientos
export const getAllMantenimientosAmbientesController = async (req, res) => {
    try {
        const mantenimientosAmbientes = await getAllMantenimientosAmbientes();
        res.status(200).json(mantenimientosAmbientes);
    } catch (error) {
        console.error( "Error al obtener los mantenimientos", error.message);
        res.status(500).json({ error: "Error al obtener los mantenimientos" });
    }
};

// Controlador para actualizar un mantenimiento por ID
export const updateMantenimientoAmbienteController = async (req, res) => {
    try {
        const id_mantenimiento = parseInt(req.params.id_mantenimiento, 10);
        if (isNaN(id_mantenimiento)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        // Convertir valores numéricos solo para los campos permitidos
        const rawBody = {
            ...req.body,
            id_ambiente: req.body.id_ambiente !== undefined ? parseInt(req.body.id_ambiente, 10) : undefined,
        };

        const validation = updateMantenimientoAmbienteSchema.safeParse(rawBody);
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
        
        const updated = await updateMantenimientoAmbiente(id_mantenimiento, updatedData);
        if (!updated) {
            return res.status(404).json({ error: "Mantenimiento no encontrado" });
        }
            
        res.status(200).json({ message: "Mantenimiento actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar el mantenimiento:", error.message);
        res.status(500).json({ error: "Error al actualizar el mantenimiento" });
    }
};

// Controlador para eliminar un mantenimiento por ID
export const deleteMantenimientoAmbienteController = async (req, res) => {
    try {
        const id_mantenimiento = parseInt(req.params.id_mantenimiento, 10);
        if (isNaN(id_mantenimiento)) return res.status(400).json({ error: "ID inválido" });
        
        const deleted = await deleteMantenimientoAmbiente(id_mantenimiento);
        if (!deleted) return res.status(404).json({ error: "Mantenimiento no encontrado" });
                    
        res.status(200).json({ message: "Mantenimiento eliminado correctamente" });
    } catch (error) {
        console.error(" Error al eliminar el mantenimiento:", error.message);
        res.status(500).json({ error: "Error al eliminar el mantenimiento" });
    }
};
