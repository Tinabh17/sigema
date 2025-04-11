import axios from "./axios";

export const getAllMaquinasRequest = () => axios.get("/maquinas");

export const getMaquinaRequest = (id_maquina) => axios.get(`/maquinas/${id_maquina}`);

export const createMaquinaRequest = (maquina) => {
  if (maquina.imagen instanceof File) {
    const formData = new FormData();
    
    Object.keys(maquina).forEach((key) => {
      if (key === "imagen") {
        formData.append(key, maquina[key]); // Mantener la imagen como está
      } else {
        formData.append(key, String(maquina[key])); // Convertir todo a string
      }
    });

    return axios.post("/maquinas", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return axios.post("/maquinas", maquina, {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const updateMaquinaRequest = (maquina) => {
  if (maquina.imagen instanceof File) { // Solo si hay un archivo
    const formData = new FormData();
    Object.keys(maquina).forEach((key) => {
      formData.append(key, maquina[key]);
    });
    return axios.put(`/maquinas/${maquina.id_maquina}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return axios.put(`/maquinas/${maquina.id_maquina}`, maquina, {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const deleteMaquinaRequest = (id_maquina) => {
  console.log("Enviando solicitud para eliminar el ID:", id_maquina);
  return axios.delete(`/maquinas/${id_maquina}`);
};

// Descargar PDF
export const downloadMaquinasPDFRequest = async () => {
  try {
      const response = await axios.get("/maquinas/report/pdf", { responseType: "blob" });
      console.log("Respuesta completa del backend (PDF):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del PDF:", error);
      throw error;
  }
};

// Descargar Excel
export const downloadMaquinasExcelRequest = async () => {
  try {
      const response = await axios.get("/maquinas/report/excel", { responseType: "blob" });
      console.log("Respuesta completa del backend (Excel):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del Excel:", error);
      throw error;
  }
};
