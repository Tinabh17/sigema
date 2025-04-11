import { getRoles, getDocumentos, getEstados, getTiposAmbientes, getEstadoMantenimiento, getTiposMantenimientos } from "../models/tablas.models.js";

export const getAllRoles = async (req, res) => {
    try {
        const roles = await getRoles();
        res.json(roles);
    } catch(error) {
        res.status(500).json({ error: "Error al obtener los Roles" })
    }
}

export const getAllDocumentos = async (req, res) => {
    try {
        const documentos = await getDocumentos();
        res.json(documentos);
    } catch(error) {
        res.status(500).json({ error: "Error al obtener los Tipos de Documentos" })
    }
}

export const getAllEstados = async (req, res) => {
    try {
        const estados = await getEstados();
        res.json(estados);
    } catch(error) {
        res.status(500).json({ error: "Error al obtener los Estados" })
    }
}

export const getAllTiposAmbientes = async (req, res) => {
    try {
        const tipos_ambientes = await getTiposAmbientes();
        res.json(tipos_ambientes);
    } catch(error) {
        res.status(500).json({ error: "Error al obtener los Tipos de Ambientes" })
    }
}

export const getAllEstadoMantenimiento = async (req, res) => {
    try {
        const estados = await getEstadoMantenimiento();
        res.json(estados);
    } catch(error) {
        res.status(500).json({ error: "Error al obtener los Estados de mantenimiento" })
    }
}

export const getAllTiposMantenimientos = async (req, res) => {
    try {
        const estados = await getTiposMantenimientos();
        res.json(estados);
    } catch(error) {
        res.status(500).json({ error: "Error al obtener los Tipos de Mantenimiento" })
    }
}