import { db } from "../config/db.js";

export const getRoles = async () => {
    try {
        const [rows] = await db.execute('SELECT id_rol, rol FROM roles');
        return rows;
    } catch (error) {
        console.error('Error al obtener los roles:', error.message);
        throw error;
    }
};

export const getDocumentos = async () => {
    try {
        const [rows] = await db.execute('SELECT id_documento, tipo_documento FROM documentos');
        return rows;
    } catch (error) {
        console.error('Error al obtener los documentos:', error.message);
        throw error;
    }
};

export const getEstados = async () => {
    try {
        const [rows] = await db.execute('SELECT id_estado, estado FROM estados');
        return rows;
    } catch (error) {
        console.error('Error al obtener los estados:', error.message);
        throw error;
    }
};

export const getEstadoMantenimiento = async () => {
    try {
        const [rows] = await db.execute('SELECT id_estado_mantenimiento, estado_mantenimiento FROM estado_mantenimiento');
        return rows;
    } catch (error) {
        console.error('Error al obtener los estados de mantenimiento:', error.message);
        throw error;
    }
};

export const getTiposAmbientes = async () => {
    try {
        const [rows] = await db.execute('SELECT id_tipo_ambiente, tipo FROM tipos_ambientes');
        return rows;
    } catch (error) {
        console.error('Error al obtener los tipos de ambientes:', error.message);
        throw error;
    }
};

export const getTiposMantenimientos = async () => {
    try {
        const [rows] = await db.execute('SELECT id_tipo_mantenimiento, tipo FROM tipos_mantenimientos');
        return rows;
    } catch (error) {
        console.error('Error al obtener los tipos de mantenimiento:', error.message);
        throw error;
    }
};