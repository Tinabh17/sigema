import { createAmbiente, getAmbienteById, getAllAmbientes, updateAmbiente, deleteAmbiente } from "../models/ambientes.models.js";
import { createAmbienteSchema, updateAmbienteSchema } from "../schemas/ambientes.schema.js";

// Controlador para crear un nuevo ambiente
export const createAmbienteController = async (req, res) => {
    try {
        console.log("Datos recibidos en req.body:", req.body);
        console.log("Archivo recibido en req.file:", req.file);

        // Convertir valores numéricos
        req.body.numero_ambiente = parseInt(req.body.numero_ambiente, 10);
        req.body.tipo_ambiente = parseInt(req.body.tipo_ambiente, 10);
        req.body.capacidad = req.body.capacidad ? parseInt(req.body.capacidad, 10) : null;
        req.body.estado = parseInt(req.body.estado, 10);

        const validation = createAmbienteSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: "Datos inválidos", detalles: validation.error.errors });
        }

        const imagenUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : null;
        const ambienteData = { ...req.body, imagen: imagenUrl };

        const ambienteId = await createAmbiente(ambienteData);
        res.status(201).json({ message: "Ambiente creado exitosamente", id: ambienteId });
    } catch (error) {
        console.error("Error al crear el ambiente:", error.message);
        res.status(500).json({ error: "Error al crear el ambiente", detalles: error.message });
    }
};

// Controlador para obtener un ambiente por ID
export const getAmbienteByIdController = async (req, res) => {
    try {
        const id_ambiente = parseInt(req.params.id_ambiente, 10);
        if (isNaN(id_ambiente)) return res.status(400).json({ error: "ID inválido" });
        
        const ambiente = await getAmbienteById(id_ambiente);
        if (!ambiente) return res.status(404).json({ error: "Ambiente no encontrado" });
        
        res.status(200).json(ambiente);
    } catch (error) {
        console.error( "Error al obtener el ambiente", error.message);
        res.status(500).json({ error: "Error al obtener el ambiente" });
    }
};

// Controlador para obtener todos los ambientes
export const getAllAmbientesController = async (req, res) => {
    try {
        const ambientes = await getAllAmbientes();
        res.status(200).json(ambientes);
    } catch (error) {
        console.error( "Error al obtener los ambientes", error.message);
        res.status(500).json({ error: "Error al obtener los ambientes" });
    }
};

// Controlador para actualizar un ambiente por ID
export const updateAmbienteController = async (req, res) => {
    try {
        const id_ambiente = parseInt(req.params.id_ambiente, 10);
        if (isNaN(id_ambiente)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const body = {
            nombre_ambiente: req.body.nombre_ambiente,
            numero_ambiente: req.body.numero_ambiente ? parseInt(req.body.numero_ambiente, 10) : undefined,
            tipo_ambiente: req.body.tipo_ambiente !== undefined ? parseInt(req.body.tipo_ambiente, 10) : undefined,
            capacidad: req.body.capacidad !== undefined ? parseInt(req.body.capacidad, 10) : undefined,
            estado: req.body.estado !== undefined ? parseInt(req.body.estado, 10) : undefined,
        };

        // Validar con Zod
        const validation = updateAmbienteSchema.safeParse(body);
        if (!validation.success) {
            return res.status(400).json({ error: "Datos inválidos", detalles: validation.error.errors });
        }

        // Filtrar solo los datos permitidos para actualizar
        const updatedData = {};

        if (body.nombre_ambiente) {
            updatedData.nombre_ambiente = body.nombre_ambiente;
        }

        if (body.tipo_ambiente !== undefined) {
            updatedData.tipo_ambiente = body.tipo_ambiente;
        }

        if (body.capacidad !== undefined) {
            updatedData.capacidad = body.capacidad;
        }

        if (body.estado !== undefined) {
            updatedData.estado = body.estado;
        }

        // Si se cargó una nueva imagen
        if (req.file) {
            updatedData.imagen = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        // Validar que hay al menos un campo permitido para actualizar
        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ error: "No se proporcionaron campos válidos para actualizar" });
        }

        const updated = await updateAmbiente(id_ambiente, updatedData);
        if (!updated) {
            return res.status(404).json({ error: "Ambiente no encontrado" });
        }

        res.status(200).json({ message: "Ambiente actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar el ambiente:", error.message);
        res.status(500).json({ error: "Error al actualizar el ambiente" });
    }
};

// Controlador para eliminar un ambiente por ID
export const deleteAmbienteController = async (req, res) => {
    try {
        const id_ambiente = parseInt(req.params.id_ambiente, 10);
        if (isNaN(id_ambiente)) return res.status(400).json({ error: "ID inválido" });
        
        const deleted = await deleteAmbiente(id_ambiente);
        if (!deleted) return res.status(404).json({ error: "Ambiente no encontrado" });
        
        res.status(200).json({ message: "Ambiente eliminado correctamente" });
    } catch (error) {
        console.error(" Error al eliminar el ambiente:", error.message);
        res.status(500).json({ error: "Error al eliminar el ambiente" });
    }
};
