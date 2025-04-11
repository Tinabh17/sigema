import { db } from "../config/db.js";
import fs from "fs";
import path from "path"; 

// Insertar un nuevo mantenimiento
export const createMantenimientoMaquina = async (mantenimientoData) => {
    try {
        const { id_maquina, imagen, fecha_programada, responsable, email, tipo_mantenimiento, estado, descripcion } = mantenimientoData;

        const [result] = await db.execute(
            `INSERT INTO mantenimientos_maquinas (id_maquina, imagen, fecha_programada, responsable, email, tipo_mantenimiento, estado, descripcion) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_maquina, imagen, fecha_programada, responsable, email, tipo_mantenimiento, estado, descripcion]
        );

        return result.insertId; // Retorna el ID generado
    } catch (error) {
        console.error("Error al crear mantenimiento:", error.message);
        throw error;
    }
};

// Obtener un mantenimiento por ID
export const getMantenimientoMaquinaById = async (id_mantenimiento) => {
    try {
        const [rows] = await db.execute(
            `SELECT mm.*, maq.nombre AS nombre_maquina, tm.tipo AS tipo_mantenimiento, em.estado_mantenimiento AS estado
             FROM mantenimientos_maquinas mm
             JOIN maquinas maq ON mm.id_maquina = maq.id_maquina
             JOIN tipos_mantenimientos tm ON mm.tipo_mantenimiento = tm.id_tipo_mantenimiento
             JOIN estado_mantenimiento em ON mm.estado = em.id_estado_mantenimiento
             WHERE mm.id_mantenimiento = ?`,
            [id_mantenimiento]
        );
        return rows[0] || null;
    } catch (error) {
        console.error("Error al obtener el mantenimiento:", error.message);
        throw error;
    }
};

// Obtener todos los mantenimientos
export const getAllMantenimientosMaquinas = async () => {
    try {
        const [rows] = await db.execute(
            `SELECT mm.*, maq.nombre AS nombre_maquina, maq.serie AS serie_maquina, tm.tipo AS tipo_mantenimiento, em.estado_mantenimiento AS estado
             FROM mantenimientos_maquinas mm
             JOIN maquinas maq ON mm.id_maquina = maq.id_maquina
             JOIN tipos_mantenimientos tm ON mm.tipo_mantenimiento = tm.id_tipo_mantenimiento
             JOIN estado_mantenimiento em ON mm.estado = em.id_estado_mantenimiento`
        );
        return rows;
    } catch (error) {
        console.error("Error al obtener los mantenimientos:", error.message);
        throw error;
    }
};

// Actualizar un mantenimiento por ID
export const updateMantenimientoMaquina = async (id_mantenimiento, updatedData) => {
    try {
        const mantenimiento_maquina = await getMantenimientoMaquinaById(id_mantenimiento);
        if (!mantenimiento_maquina) {
            throw new Error("Mantenimiento no encontrado");
        }
        
        const updates = [];
        const params = [];
        
        if (updatedData.imagen) {
        // Eliminar la imagen anterior si hay una nueva
            if (mantenimiento_maquina.imagen) {
                const oldImagePath = path.join("uploads", path.basename(mantenimiento_maquina.imagen));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Borra la imagen antigua
                }
            }
            updates.push("imagen = ?");
            params.push(updatedData.imagen);
        }

        const campos = ["fecha_programada", "responsable", "tipo_mantenimiento", "estado", "descripcion"];
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
        const query = `UPDATE mantenimientos_maquinas SET ${updates.join(", ")} WHERE id_mantenimiento = ?`;
        const [result] = await db.execute(query, params);

        return result.affectedRows > 0; // Retorna `true` si se actualizó
    } catch (error) {
        console.error("Error al actualizar mantenimiento:", error.message);
        throw error;
    }
};

// Eliminar un mantenimiento por ID
export const deleteMantenimientoMaquina = async (id_mantenimiento) => {
    try {
        // Obtener el mantenimiento para verificar si tiene imagen
        const mantenimiento_maquina = await getMantenimientoMaquinaById(id_mantenimiento);
        if (!mantenimiento_maquina) {
            throw new Error("Ambiente no encontrado");
        }
        
        // Eliminar la imagen del servidor si existe
        if (mantenimiento_maquina.imagen) {
            const imagePath = path.join("uploads", path.basename(mantenimiento_maquina.imagen));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Borra la imagen
            }
        }
                
        // Eliminar el ambiente de la base de datos
        const [result] = await db.execute(
            `DELETE FROM mantenimientos_maquinas WHERE id_mantenimiento = ?`,
            [id_mantenimiento]
        );
        return result.affectedRows > 0; // Retorna `true` si se eliminó
    } catch (error) {
        console.error("Error al eliminar mantenimiento:", error.message);
        throw error;
    }
};
