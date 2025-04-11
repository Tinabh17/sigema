import { createMaquina, getMaquinaById, getAllMaquinas, updateMaquina, deleteMaquina } from "../models/maquinas.models.js";
import { createMaquinaSchema, updateMaquinaSchema } from "../schemas/maquinas.schema.js";

// Controlador para crear una nueva máquina
export const createMaquinaController = async (req, res) => {
    try {
        console.log("Datos recibidos en req.body:", req.body);
        console.log("Archivo recibido en req.file:", req.file);

        const rawBody = {
            ...req.body,
            ambiente: req.body.ambiente ? parseInt(req.body.ambiente, 10) : undefined,
            cedula: req.body.cedula ? parseInt(req.body.cedula, 10) : undefined,
            estado: req.body.estado ? parseInt(req.body.estado, 10) : undefined,
        };

        const validation = createMaquinaSchema.safeParse(rawBody);
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
            serie,
            marca,
            nombre,
            ambiente,
            descripcion,
            fecha_adquisicion,
            cedula,
            cuentadante,
            email,
            estado,
            observaciones,
        } = validation.data;

        const maquinaData = {
            serie,
            marca,
            nombre,
            imagen: imagenUrl ?? null,
            ambiente: ambiente ?? null,
            descripcion: descripcion ?? null,
            fecha_adquisicion: fecha_adquisicion ?? null,
            cedula: cedula ?? null,
            cuentadante: cuentadante ?? null,
            email: email ?? null,
            estado,
            observaciones: observaciones ?? null,
        };

        const maquinaId = await createMaquina(maquinaData);
        res.status(201).json({
            message: "Máquina creada exitosamente",
            id: maquinaId,
        });
    } catch (error) {
        console.error("Error al crear el máquina:", error.message);
        res.status(500).json({
            error: "Error al crear el máquina",
            detalles: error.message,
        });
    }
};

// Controlador para obtener una máquina por ID
export const getMaquinaByIdController = async (req, res) => {
    try {
        const id_maquina = parseInt(req.params.id_maquina, 10);
        if (isNaN(id_maquina)) return res.status(400).json({ error: "ID inválido" });
            
        const maquina = await getMaquinaById(id_maquina);
        if (!maquina) return res.status(404).json({ error: "Máquina no encontrada" });
            
        res.status(200).json(maquina);
    } catch (error) {
        console.error( "Error al obtener la máquina", error.message);
        res.status(500).json({ error: "Error al obtener la máquina" });
    }
};

// Controlador para obtener todas las máquinas
export const getAllMaquinasController = async (req, res) => {
    try {
        const maquinas = await getAllMaquinas();
        res.status(200).json(maquinas);
    } catch (error) {
        console.error( "Error al obtener las máquinas", error.message);
        res.status(500).json({ error: "Error al obtener las máquinas" });
    }
};

// Controlador para actualizar una máquina por ID
export const updateMaquinaController = async (req, res) => {
    try {
        const id_maquina = parseInt(req.params.id_maquina, 10);
        if (isNaN(id_maquina)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        // Convertir campos numéricos antes de validar
        const rawBody = {
            ...req.body,
            ambiente: req.body.ambiente !== undefined ? parseInt(req.body.ambiente, 10) : undefined,
            cedula: req.body.cedula !== undefined ? parseInt(req.body.cedula, 10) : undefined,
            estado: req.body.estado !== undefined ? parseInt(req.body.estado, 10) : undefined,
        };

        const validation = updateMaquinaSchema.safeParse(rawBody);
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

        const updated = await updateMaquina(id_maquina, updatedData);
        if (!updated) {
            return res.status(404).json({ error: "Máquina no encontrada" });
        }

        res.status(200).json({ message: "Máquina actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar la máquina:", error.message);
        res.status(500).json({ error: "Error al actualizar la máquina" });
    }
};

// Controlador para eliminar una máquina por ID
export const deleteMaquinaController = async (req, res) => {
    try {
        const id_maquina = parseInt(req.params.id_maquina, 10);
        if (isNaN(id_maquina)) return res.status(400).json({ error: "ID inválido" });

        const deleted = await deleteMaquina(id_maquina);
        if (!deleted) return res.status(404).json({ error: "Máquina no encontrado" });
            
        res.status(200).json({ message: "Máquina eliminada correctamente" });
    } catch (error) {
        console.error(" Error al eliminar la máquina:", error.message);
        res.status(500).json({ error: "Error al eliminar la Máquina" });
    }
};
