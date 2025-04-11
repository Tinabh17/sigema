import axios from "./axios";

export const getAllMantenimientosAmbientesRequest = () => axios.get("/mantenimientos/ambientes");

export const getMantenimientoAmbienteRequest = (id_mantenimiento) => axios.get(`/mantenimientos/ambientes/${id_mantenimiento}`);

export const createMantenimientoAmbienteRequest = (mantenimiento_ambiente) => {
  if (mantenimiento_ambiente.imagen instanceof File) {
    const formData = new FormData();
    
    Object.keys(mantenimiento_ambiente).forEach((key) => {
      if (key === "imagen") {
        formData.append(key, mantenimiento_ambiente[key]); // Mantener la imagen como está
      } else {
        formData.append(key, String(mantenimiento_ambiente[key])); // Convertir todo a string
      }
    });

    return axios.post("/mantenimientos/ambientes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return axios.post("/mantenimientos/ambientes", mantenimiento_ambiente, {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const updateMantenimientoAmbienteRequest = (mantenimiento_ambiente) => {
  if (mantenimiento_ambiente.imagen instanceof File) { // Solo si hay un archivo
    const formData = new FormData();
    Object.keys(mantenimiento_ambiente).forEach((key) => {
      formData.append(key, mantenimiento_ambiente[key]);
    });
    return axios.put(`/mantenimientos/ambientes/${mantenimiento_ambiente.id_mantenimiento}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return axios.put(`/mantenimientos/ambientes/${mantenimiento_ambiente.id_mantenimiento}`, mantenimiento_ambiente, {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const deleteMantenimientoAmbienteRequest = (id_mantenimiento) => {
  console.log("Enviando solicitud para eliminar el ID:", id_mantenimiento);
  return axios.delete(`/mantenimientos/ambiente/${id_mantenimiento}`);
};

// Descargar PDF
export const downloadMantenimientosAmbientesPDFRequest = async () => {
  try {
      const response = await axios.get("/mantenimientos/ambientes/report/pdf", { responseType: "blob" });
      console.log("Respuesta completa del backend (PDF):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del PDF:", error);
      throw error;
  }
};

// Descargar Excel
export const downloadMantenimientosAmbientesExcelRequest = async () => {
  try {
      const response = await axios.get("/mantenimientos/ambientes/report/excel", { responseType: "blob" });
      console.log("Respuesta completa del backend (Excel):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del Excel:", error);
      throw error;
  }
};