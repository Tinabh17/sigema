import { createContext, useContext, useState, useEffect } from "react";
import { getUsersRequest, createUserRequest, updateUserRequest, deleteUserRequest, downloadUsersPDFRequest, downloadUsersExcelRequest, downloadUsersRolPDFRequest, downloadUsersExcelRolRequest } from "../api/user.js";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);


  const loadUsers = async () => {
    try {
      const res = await getUsersRequest();
      setUsers(res.data);
    } catch (error) {
      setError("No se pudieron cargar los usuarios");
      console.error("Error al cargar usuarios", error);
    }
  };

  const createUser = async (user) => {
    try {
      await createUserRequest(user);
      loadUsers();
    } catch (error) {
      setError("Error al crear usuario");
      console.error("Error al crear usuario", error);
    }
  };

  const updateUser = async (id, user) => {
    try {
      await updateUserRequest(id, user);
      loadUsers();
    } catch (error) {
      setError("Error al actualizar usuario");
      console.error("Error al actualizar usuario", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserRequest(id);
      loadUsers();
    } catch (error) {
      setError("Error al eliminar usuario");
      console.error("Error al eliminar usuario", error);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await downloadUsersPDFRequest();
      if (!response || !response.data) {
        console.error("La respuesta del PDF está vacía:", response);
        throw new Error("La respuesta está vacía");
      }
  
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_usuarios.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError(error.message || "Error desconocido");
      console.error("Error al descargar el PDF:", error);
    }
  };

  const downloadRolPDF = async () => {
    try {
      const response = await downloadUsersRolPDFRequest();
      if (!response || !response.data) {
        console.error("La respuesta del PDF está vacía:", response);
        throw new Error("La respuesta está vacía");
      }
  
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_usuarios_rol.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError(error.message || "Error desconocido");
      console.error("Error al descargar el PDF:", error);
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await downloadUsersExcelRequest();
      if (!response || !response.data) {
        console.error("La respuesta del Excel está vacía:", response);
        throw new Error("La respuesta está vacía");
      }

      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_usuarios.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError(error.message || "Error desconocido");
      console.error("Error al descargar el Excel:", error);
    }
  };

  const downloadRolExcel = async () => {
    try {
      const response = await downloadUsersExcelRolRequest();
      if (!response || !response.data) {
        console.error("La respuesta del Excel está vacía:", response);
        throw new Error("La respuesta está vacía");
      }

      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_usuarios_rol.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError(error.message || "Error desconocido");
      console.error("Error al descargar el Excel:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      users, 
      error, 
      createUser, 
      updateUser, 
      deleteUser, 
      loadUsers,
      downloadPDF,
      downloadExcel,
      downloadRolPDF,
      downloadRolExcel
    }}>
      {children}
    </UserContext.Provider>
  );
};
