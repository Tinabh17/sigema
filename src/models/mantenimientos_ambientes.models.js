import { db } from "../config/db.js";
import fs from "fs";
import path from "path"; 

// Insertar un nuevo mantenimiento
export const createMantenimientoAmbiente = async (mantenimientoData) => {
    try {
        const { id_ambiente, imagen, fecha_programada, descripcion } = mantenimientoData;

        const [result] = await db.execute(
            `INSERT INTO mantenimientos_ambientes (id_ambiente, imagen, fecha_programada, descripcion) 
             VALUES (?, ?, ?, ?)`,
            [id_ambiente, imagen, fecha_programada, descripcion]
        );

        return result.insertId; // Retorna el ID generado
    } catch (error) {
        console.error("Error al crear mantenimiento:", error.message);
        throw error;
    }
};

// Obtener un mantenimiento por ID
export const getMantenimientoAmbienteById = async (id_mantenimiento) => {
    try {
        const [rows] = await db.execute(
            `SELECT ma.*, a.nombre_ambiente AS nombre_ambiente 
             FROM mantenimientos_ambientes ma
             JOIN ambientes a ON ma.id_ambiente = a.id_ambiente
             WHERE ma.id_mantenimiento = ?`,
            [id_mantenimiento]
        );
        return rows[0] || null;
    } catch (error) {
        console.error("Error al obtener el mantenimiento:", error.message);
        throw error;
    }
};

// Obtener todos los mantenimientos
export const getAllMantenimientosAmbientes = async () => {
    try {
        const [rows] = await db.execute(
            `SELECT ma.*, a.nombre_ambiente AS nombre_ambiente, a.numero_ambiente AS numero_ambiente
             FROM mantenimientos_ambientes ma
             JOIN ambientes a ON ma.id_ambiente = a.id_ambiente`
        );
        return rows;
    } catch (error) {
        console.error("Error al obtener los mantenimientos de ambientes:", error.message);
        throw error;
    }
};

// Actualizar un mantenimiento por ID
export const updateMantenimientoAmbiente = async (id_mantenimiento, updatedData) => {
    try {
        const mantenimiento_ambiente = await getMantenimientoAmbienteById(id_mantenimiento);
        if (!mantenimiento_ambiente) {
            throw new Error("Mantenimiento no encontrado");
        }
    
        const updates = [];
        const params = [];

        if (updatedData.imagen) {
            // Eliminar la imagen anterior si hay una nueva
            if (mantenimiento_ambiente.imagen) {
                const oldImagePath = path.join("uploads", path.basename(mantenimiento_ambiente.imagen));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Borra la imagen antigua
                }
            }
            updates.push("imagen = ?");
            params.push(updatedData.imagen);
        }
        
        const campos = ["fecha_programada", "descripcion"];
        campos.forEach((campo) => {
            if (updatedData.hasOwnProperty(campo)) {
                updates.push(`${campo} = ?`);
                params.push(updatedData[campo]);
            }
        });
    
        if (updates.length === 0) {
            throw new Error("No hay campos para actualizar");
        }
    
        params.push(id_mantenimiento);
        const query = `UPDATE mantenimientos_ambientes SET ${updates.join(", ")} WHERE id_mantenimiento = ?`;
        const [result] = await db.execute(query, params);
    
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al actualizar el mantenimiento:", error.message);
        throw error;
    }
};

// Eliminar un mantenimiento por ID
export const deleteMantenimientoAmbiente = async (id_mantenimiento) => {
    try {
        // Obtener el mantenimiento para verificar si tiene imagen
        const mantenimiento_ambiente = await getMantenimientoAmbienteById(id_mantenimiento);
        if (!mantenimiento_ambiente) {
            throw new Error("Mantenimiento no encontrado");
        }

        // Eliminar la imagen del servidor si existe
        if (mantenimiento_ambiente.imagen) {
            const imagePath = path.join("uploads", path.basename(mantenimiento_ambiente.imagen));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Borra la imagen
            }
        }
        
        // Eliminar el ambiente de la base de datos
        const [result] = await db.execute(
            `DELETE FROM mantenimientos_ambientes WHERE id_mantenimiento = ?`,
            [id_mantenimiento]
        );
        return result.affectedRows > 0; // Retorna `true` si se eliminó
    } catch (error) {
        console.error("Error al eliminar el mantenimiento:", error.message);
        throw error;
    }
};
