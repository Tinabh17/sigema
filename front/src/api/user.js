import axios from "./axios";

export const getUsersRequest = () => axios.get("/usuarios");

export const getUserRequest = (id_usuario) => axios.get(`/usuarios/${id_usuario}`);

export const createUserRequest = (usuario) => axios.post("/usuarios", usuario);

export const updateUserRequest = (id_usuario, usuario) => 
  axios.put(`/usuarios/${id_usuario}`, usuario);

export const deleteUserRequest = (id_usuario) => {
  console.log("Enviando solicitud para eliminar el ID:", id_usuario);
  return axios.delete(`/usuarios/${id_usuario}`);
};

// Descargar PDF
export const downloadUsersPDFRequest = async () => {
  try {
      const response = await axios.get("/usuarios/report/pdf", { responseType: "blob" });
      console.log("Respuesta completa del backend (PDF):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del PDF:", error);
      throw error;
  }
};

export const downloadUsersRolPDFRequest = async () => {
  try {
      const response = await axios.get("/usuarios/reportRol/pdf", { responseType: "blob" });
      console.log("Respuesta completa del backend (PDF):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del PDF:", error);
      throw error;
  }
};

// Descargar Excel
export const downloadUsersExcelRequest = async () => {
  try {
      const response = await axios.get("/usuarios/report/excel", { responseType: "blob" });
      console.log("Respuesta completa del backend (Excel):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del Excel:", error);
      throw error;
  }
};

export const downloadUsersExcelRolRequest = async () => {
  try {
      const response = await axios.get("/usuarios/reportRol/excel", { responseType: "blob" });
      console.log("Respuesta completa del backend (Excel):", response);
      return response;
  } catch (error) {
      console.error("Error en la solicitud del Excel:", error);
      throw error;
  }
};
