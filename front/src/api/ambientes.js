import axios from "./axios";

export const getAllAmbientesRequest = () => axios.get("/ambientes");

export const getAmbienteRequest = (id_ambiente) => axios.get(`/ambientes/${id_ambiente}`);

export const createAmbienteRequest = (ambiente) => {
  if (ambiente.imagen instanceof File) {
    const formData = new FormData();
    
    Object.keys(ambiente).forEach((key) => {
      if (key === "imagen") {
        formData.append(key, ambiente[key]); // Mantener la imagen como está
      } else {
        formData.append(key, String(ambiente[key])); // Convertir todo a string
      }
    });

    return axios.post("/ambientes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return axios.post("/ambientes", ambiente, {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const updateAmbienteRequest = (ambiente) => {
  if (ambiente.imagen instanceof File) { // Solo si hay un archivo
    const formData = new FormData();
    Object.keys(ambiente).forEach((key) => {
      formData.append(key, ambiente[key]);
    });
    return axios.put(`/ambientes/${ambiente.id_ambiente}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return axios.put(`/ambientes/${ambiente.id_ambiente}`, ambiente, {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const deleteAmbienteRequest = (id_ambiente) => {
  console.log("Enviando solicitud para eliminar el ID:", id_ambiente);
  return axios.delete(`/ambientes/${id_ambiente}`);
};

// Descargar PDF
export const downloadAmbientesPDFRequest = async () => {
  try {
      const response = await axios.get("/ambientes/report/pdf", { responseType: "blob" });
      console.log("Respuesta completa del backend (PDF):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del PDF:", error);
      throw error;
  }
};

// Descargar Excel
export const downloadAmbientesExcelRequest = async () => {
  try {
      const response = await axios.get("/ambientes/report/excel", { responseType: "blob" });
      console.log("Respuesta completa del backend (Excel):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del Excel:", error);
      throw error;
  }
};
