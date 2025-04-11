import { createContext, useContext, useState, useEffect } from "react";
import { getAllMantenimientosAmbientesRequest, getMantenimientoAmbienteRequest, createMantenimientoAmbienteRequest, updateMantenimientoAmbienteRequest, deleteMantenimientoAmbienteRequest, downloadMantenimientosAmbientesPDFRequest, downloadMantenimientosAmbientesExcelRequest } from "../api/mantenimientos_ambientes.js";

const MantenimientosAmbientesContext = createContext();

export const useMantenimientosAmbientes = () => {
    const context = useContext(MantenimientosAmbientesContext);
    if (!context) {
        throw new Error("useMantenimientoAmbientes debe usarse dentro de un MantenimientosAmbientesProvider");
    }
    return context;
};

export const MantenimientosAmbientesProvider = ({ children }) => {
    const [mantenimientos_ambientes, setMantenimientosAmbientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchMantenimientosAmbientes = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getAllMantenimientosAmbientesRequest();
                if (isMounted) setMantenimientosAmbientes(res.data); // Accede correctamente a los datos
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || err.message);
                console.error("Error al obtener los mantenimientos:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMantenimientosAmbientes();

        return () => { isMounted = false; };
    }, []);

    // Crear un mantenimiento
    const createMantenimientoAmbiente = async (mantenimiento_ambiente) => {
        try {
            setError(null);
            console.log("Enviando mantenimiento:", mantenimiento_ambiente); 
            await createMantenimientoAmbienteRequest(mantenimiento_ambiente); 
            const res = await getAllMantenimientosAmbientesRequest(); 
            setMantenimientosAmbientes(res.data); 
        } catch (error) {
            console.error("Error al crear el máquina:", error.response?.data || error.message);
        }
    };
    
    // Actualizar un mantenimiento
    const updateMantenimientoAmbiente = async (id_mantenimiento, updatedData) => {
        try {
            setError(null);
                      
            await updateMantenimientoAmbienteRequest({ id_mantenimiento, ...updatedData });
                  
            const res = await getMantenimientoAmbienteRequest(id_mantenimiento);
                  
            setMantenimientosAmbientes((prev) =>
                prev.map((mantenimiento_ambiente) =>
                    mantenimiento_ambiente.id_mantenimiento === id_mantenimiento ? res.data : mantenimiento_ambiente
                )
            );
                    
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            console.error("Error al actualizar el mantenimiento:", error);
        }
    };

    // Eliminar un mantenimiento
    const deleteMantenimientoAmbiente = async (id_mantenimiento) => {
        try {
            setError(null);
            await deleteMantenimientoAmbienteRequest(id_mantenimiento);
            setMantenimientosAmbiente((prev) => prev.filter(mantenimientos_ambientes => mantenimientos_ambientes.id_mantenimiento !== id_mantenimiento));
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            console.error("Error al eliminar el mantenimiento:", error);
        }
    };

    // Descargar reporte en Pdf
    const downloadPDF = async () => {
        try {
            const response = await downloadMantenimientosAmbientesPDFRequest();
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: "application/pdf" });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute("download", "reporte_mantenimientos_ambientes.pdf");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            setError(error.message || "Error desconocido");
            console.error("Error al descargar el PDF:", error);
        }
    };

    // Descargar reporte en Excel
    const downloadExcel = async () => {
        try {
            const response = await downloadMantenimientosAmbientesExcelRequest();
            if (!response || !response.data) {
                console.error("La respuesta del Excel está vacía:", response);
                throw new Error("La respuesta está vacía");
            }
          
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "reporte_mantenimientos_ambientes.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            setError(error.message || "Error desconocido");
            console.error("Error al descargar el Excel:", error);
        }
    };

    return (
        <MantenimientosAmbientesContext.Provider value={{ 
            mantenimientos_ambientes, 
            loading, 
            error, 
            createMantenimientoAmbiente, 
            updateMantenimientoAmbiente, 
            deleteMantenimientoAmbiente,
            downloadPDF,
            downloadExcel
        }}>
            {children}
        </MantenimientosAmbientesContext.Provider>
    );
};
