import { db } from "../config/db.js";
import fs from "fs";
import path from "path"; 

// Función para insertar una nueva máquina
export const createMaquina = async (maquinaData) => {
    try {
        const { serie, marca, nombre, imagen, ambiente, descripcion, fecha_adquisicion, cedula, cuentadante, email, estado, observaciones } = maquinaData;
        
        const [result] = await db.execute(
            `INSERT INTO maquinas (serie, marca, nombre, imagen, ambiente, descripcion, fecha_adquisicion, cedula, cuentadante, email, estado, observaciones) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [serie, marca, nombre, imagen, ambiente, descripcion, fecha_adquisicion, cedula, cuentadante, email, estado, observaciones]
        );

        return result.insertId; // Retorna el ID generado automáticamente
    } catch (error) {
        console.error("Error al crear máquina:", error.message);
        throw error;
    }
};

// Obtener una máquina por ID
export const getMaquinaById = async (id_maquina) => {
    try {
        const [rows] = await db.execute(
            `SELECT maq.*,
             a.nombre_ambiente AS ambiente_nombre, e.estado 
             AS estado_nombre
             FROM maquinas maq 
             LEFT JOIN ambientes a ON maq.ambiente = a.id_ambiente 
             LEFT JOIN estados e ON maq.estado = e.id_estado
             WHERE maq.id_maquina = ?`,
            [id_maquina]
        );
        return rows[0] || null;
    } catch (error) {
        console.error("Error al obtener la máquina:", error.message);
        throw error;
    }
};

// Obtener todas las máquinas
export const getAllMaquinas = async () => {
    try {
        const [rows] = await db.execute(
            `SELECT maq.*, a.numero_ambiente AS ambiente_numero, e.estado AS estado_nombre 
             FROM maquinas maq 
             LEFT JOIN ambientes a ON maq.ambiente = a.id_ambiente
             LEFT JOIN estados e ON maq.estado = e.id_estado`
        );
        return rows;
    } catch (error) {
        console.error("Error al obtener las máquinas:", error.message);
        throw error;
    }
};

export const updateMaquina = async (id_maquina, updatedData) => {
    try {
        const maquina = await getMaquinaById(id_maquina);
        if (!maquina) {
            throw new Error("Máquina no encontrada");
        }

        const updates = [];
        const params = [];

        if (updatedData.imagen) {
            if (maquina.imagen) {
                const oldImagePath = path.join("uploads", path.basename(maquina.imagen));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updates.push("imagen = ?");
            params.push(updatedData.imagen);
        }

        const campos = ["ambiente", "descripcion", "cedula", "cuentadante", "email", "estado", "observaciones"];
        campos.forEach((campo) => {
            if (updatedData.hasOwnProperty(campo)) {
                updates.push(`${campo} = ?`);
                params.push(updatedData[campo]);
            }
        });

        if (updates.length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        params.push(id_maquina);
        const query = `UPDATE maquinas SET ${updates.join(", ")} WHERE id_maquina = ?`;
        const [result] = await db.execute(query, params);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al actualizar la máquina:", error.message);
        throw error;
    }
};

// Eliminar una máquina por ID
export const deleteMaquina = async (id_maquina) => {
    try {
        // Obtener la maáquina para verificar si tiene imagen
        const maquina = await getMaquinaById(id_maquina);
        if (!maquina) {
            throw new Error("Máquina no encontrada");
        }

        // Eliminar la imagen del servidor si existe
        if (maquina.imagen) {
            const imagePath = path.join("uploads", path.basename(maquina.imagen));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Borra la imagen
            }
        }

        // Eliminar la máquina de la base de datos
        const [result] = await db.execute(
            `DELETE FROM maquinas WHERE id_maquina = ?`,
            [id_maquina]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al eliminar la máquina:", error.message);
        throw error;
    }
};
