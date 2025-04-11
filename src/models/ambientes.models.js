import { db } from "../config/db.js";
import fs from "fs";
import path from "path"; 

// Función para insertar un nuevo ambiente
export const createAmbiente = async (ambienteData) => {
    try {
        const { numero_ambiente, nombre_ambiente, tipo_ambiente, ubicacion, capacidad, imagen, estado } = ambienteData;
        
        const [result] = await db.execute(
            `INSERT INTO ambientes (numero_ambiente, nombre_ambiente, tipo_ambiente, ubicacion, capacidad, imagen, estado) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [numero_ambiente, nombre_ambiente, tipo_ambiente, ubicacion, capacidad, imagen, estado]
        );

        return result.insertId; // Retorna el ID generado automáticamente
    } catch (error) {
        console.error("Error al crear ambiente:", error.message);
        throw error;
    }
};

// Obtener un ambiente por ID
export const getAmbienteById = async (id_ambiente) => {
    try {
        const [rows] = await db.execute(
            `SELECT a.*,
             e.estado AS nombre_estado, t.tipo 
             AS nombre_tipo_ambiente 
             FROM ambientes a 
             JOIN estados e ON a.estado = e.id_estado
             JOIN tipos_ambientes t ON a.tipo_ambiente = t.id_tipo_ambiente
             WHERE a.id_ambiente = ?`,
            [id_ambiente]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error al obtener el ambiente:", error.message);
        throw error;
    }
};

// Obtener todos los ambientes
export const getAllAmbientes = async () => {
    try {
        const [rows] = await db.execute(
            `SELECT a.*,
            e.estado AS nombre_estado, t.tipo AS nombre_tipo_ambiente 
            FROM ambientes a
            JOIN estados e ON a.estado = e.id_estado
            JOIN tipos_ambientes t ON a.tipo_ambiente = t.id_tipo_ambiente`
        );
        return rows;
    } catch (error) {
        console.error("Error al obtener los ambientes:", error.message);
        throw error;
    }
};

// Actualizar un ambiente
export const updateAmbiente = async (id_ambiente, updatedData) => {
    try {
        const ambiente = await getAmbienteById(id_ambiente);
        if (!ambiente) {
            throw new Error("Ambiente no encontrado");
        }

        const updates = [];
        const params = [];

        if (updatedData.nombre_ambiente) {
            updates.push("nombre_ambiente = ?");
            params.push(updatedData.nombre_ambiente);
        }
        if (updatedData.tipo_ambiente) {
            updates.push("tipo_ambiente = ?");
            params.push(updatedData.tipo_ambiente);
        }
        if (updatedData.capacidad !== undefined) {
            updates.push("capacidad = ?");
            params.push(updatedData.capacidad);
        }
        if (updatedData.imagen) {
            // Eliminar la imagen anterior si hay una nueva
            if (ambiente.imagen) {
                const oldImagePath = path.join("uploads", path.basename(ambiente.imagen));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Borra la imagen antigua
                }
            }
            updates.push("imagen = ?");
            params.push(updatedData.imagen);
        }
        if (updatedData.estado) {
            updates.push("estado = ?");
            params.push(updatedData.estado);
        }

        if (updates.length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        params.push(id_ambiente);
        const query = `UPDATE ambientes SET ${updates.join(", ")} WHERE id_ambiente = ?`;
        const [result] = await db.execute(query, params);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al actualizar el ambiente:", error.message);
        throw error;
    }
};

// Eliminar un ambiente
export const deleteAmbiente = async (id_ambiente) => {
    try {
        // Obtener el ambiente para verificar si tiene imagen
        const ambiente = await getAmbienteById(id_ambiente);
        if (!ambiente) {
            throw new Error("Ambiente no encontrado");
        }

        // Eliminar la imagen del servidor si existe
        if (ambiente.imagen) {
            const imagePath = path.join("uploads", path.basename(ambiente.imagen));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Borra la imagen
            }
        }

        // Eliminar el ambiente de la base de datos
        const [result] = await db.execute(
            `DELETE FROM ambientes WHERE id_ambiente = ?`,
            [id_ambiente]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al eliminar el ambiente:", error.message);
        throw error;
    }
};
