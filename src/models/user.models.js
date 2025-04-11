import { db } from '../config/db.js';

// Función para crear un nuevo usuario
export const createUser = async (userData) => {
    try {
        const { tipo_documento, numero_documento, nombre, apellido, email, telefono, direccion, password, rol} = userData;

        const [result] = await db.execute(
            'INSERT INTO usuarios (tipo_documento, numero_documento, nombre, apellido, email, telefono, direccion, password, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [tipo_documento, numero_documento, nombre, apellido, email, telefono, direccion, password, rol]
        );

        return result.insertId;
    } catch (error) {
        console.error('Error al crear usuario:', error.message);
        throw error;
    }
};

// Obtener usuario por documento
export const getUserByDocumento = async (numero_documento) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM usuarios WHERE numero_documento = ?', 
            [numero_documento]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error al obtener usuario por número de documento', error);
        throw error;
    }
};

// Obtener un usuario por ID
export const getUserById = async (id_usuario) => {
    try {
        const [rows] = await db.execute(
            `SELECT u.*, r.rol AS nombre_rol 
            FROM usuarios u 
            JOIN roles r ON u.rol = r.id_rol
            WHERE u.id_usuario = ?`,
            [id_usuario]
        );
        return rows[0] || null;
    } catch (error) {
        console.error("Error al obtener usuario:", error.message);
        throw error;
    }
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
    try {
        const [rows] = await db.execute(
            `SELECT u.*, 
             r.rol AS nombre_rol, 
             d.tipo_documento AS nombre_documento
             FROM usuarios u 
             JOIN roles r ON u.rol = r.id_rol 
             JOIN documentos d ON u.tipo_documento = d.id_documento`
        );
        return rows;
    } catch (error) {
        console.error("Error al obtener usuarios:", error.message);
        throw error;
    }
};

// Actualizar usuario
export const updateUser = async (id, updatedData) => {
    try {
        const { tipo_documento, numero_documento, email, telefono, direccion, password, rol } = updatedData;

        const [result] = await db.execute(
            `UPDATE usuarios 
             SET tipo_documento = ?, numero_documento = ?, email = ?, telefono = ?, direccion = ?, password = ?, rol = ? 
             WHERE id_usuario = ?`,
            [tipo_documento, numero_documento, email, telefono, direccion, password, rol, id]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al actualizar usuario:", error.message);
        throw error;
    }
};

// Eliminar usuario por ID
export const deleteUser = async (id_usuario) => {
    try {
        const [result] = await db.execute(
            `DELETE FROM usuarios WHERE id_usuario = ?`,
            [id_usuario]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al eliminar usuario:", error.message);
        throw error;
    }
};

export const getUserByEmail = async (email) => {
    try {
        const [rows] = await db.execute(
            `SELECT id_usuario, nombre, email FROM usuarios WHERE email = ?`,
            [email]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error al obtener usuario por email:', error);
        throw error;
    }
};


// Actualizar nueva contraseña 
export const updatePassword = async (id_usuario, userData) =>{
    try {
        const {password} = userData;
        const [result] = await db.execute(
            'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
            [password, id_usuario]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
}