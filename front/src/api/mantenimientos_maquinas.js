import axios from "./axios";

export const getAllMantenimientosMaquinasRequest = () => axios.get("/mantenimientos/maquinas");

export const getMantenimientoMaquinaRequest = (id_mantenimiento) => axios.get(`/mantenimientos/maquinas/${id_mantenimiento}`);

export const createMantenimientoMaquinaRequest = (mantenimiento_maquina) => {
  if (mantenimiento_maquina.imagen instanceof File) {
    const formData = new FormData();
    
    Object.keys(mantenimiento_maquina).forEach((key) => {
      if (key === "imagen") {
        formData.append(key, mantenimiento_maquina[key]); // Mantener la imagen como está
      } else {
        formData.append(key, String(mantenimiento_maquina[key])); // Convertir todo a string
      }
    });

    return axios.post("/mantenimientos/maquinas", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return axios.post("/mantenimientos/maquinas", mantenimiento_maquina, {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const updateMantenimientoMaquinaRequest = (mantenimiento_maquina) => {
  if (mantenimiento_maquina.imagen instanceof File) { // Solo si hay un archivo
    const formData = new FormData();
    Object.keys(mantenimiento_maquina).forEach((key) => {
      formData.append(key, mantenimiento_maquina[key]);
    });
    return axios.put(`/mantenimientos/maquinas/${mantenimiento_maquina.id_mantenimiento}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return axios.put(`/mantenimientos/maquinas/${mantenimiento_maquina.id_mantenimiento}`, mantenimiento_maquina, {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const deleteMantenimientoMaquinaRequest = (id_mantenimiento) => {
  console.log("Enviando solicitud para eliminar el ID:", id_mantenimiento);
  return axios.delete(`/mantenimientos/maquinas/${id_mantenimiento}`);
};

// Descargar PDF
export const downloadMantenimientosMaquinasPDFRequest = async () => {
  try {
      const response = await axios.get("/mantenimientos/maquinas/report/pdf", { responseType: "blob" });
      console.log("Respuesta completa del backend (PDF):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del PDF:", error);
      throw error;
  }
};

// Descargar Excel
export const downloadMantenimientosMaquinasExcelRequest = async () => {
  try {
      const response = await axios.get("/mantenimientos/maquinas/report/excel", { responseType: "blob" });
      console.log("Respuesta completa del backend (Excel):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del Excel:", error);
      throw error;
  }
};
