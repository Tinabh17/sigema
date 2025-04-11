import axios from "./axios";

export const getRoles = async () => {
    const response = await axios.get(`/getRol`);
    return response.data;
};

export const getDocumentos = async () => {
    const response = await axios.get(`/getDoc`);
    return response.data;
};

export const getEstados = async () => {
    const response = await axios.get(`/getEst`);
    return response.data;
};

export const getTiposAmbientes = async () => {
    const response = await axios.get(`/getTipoA`);
    return response.data;
};

export const getAmbientes = async () => {
    const response = await axios.get('/ambientes');
    return response.data;
}

export const getMaquinas = async () => {
    const response = await axios.get('/maquinas');
    return response.data;
}

export const getEstadoMantenimiento = async () => {
    const response = await axios.get(`/getEstM`);
    return response.data;
};

export const getTiposMantenimientos = async () => {
    const response = await axios.get(`/getTipoM`);
    return response.data;
};