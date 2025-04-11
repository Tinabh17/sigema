import { createContext, useContext, useState, useEffect } from "react";
import { getAllMantenimientosMaquinasRequest, getMantenimientoMaquinaRequest, createMantenimientoMaquinaRequest, updateMantenimientoMaquinaRequest, deleteMantenimientoMaquinaRequest, downloadMantenimientosMaquinasPDFRequest, downloadMantenimientosMaquinasExcelRequest } from "../api/mantenimientos_maquinas.js";

const MantenimientosMaquinasContext = createContext();

export const useMantenimientosMaquinas = () => {
    const context = useContext(MantenimientosMaquinasContext);
    if (!context) {
        throw new Error("useMantenimientosMaquinas debe usarse dentro de un MantenimientosMaquinasProvider");
    }
    return context;
};

export const MantenimientosMaquinasProvider = ({ children }) => {
    const [mantenimientos_maquinas, setMantenimientosMaquinas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchMantenimientosMaquinas = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getAllMantenimientosMaquinasRequest();
                if (isMounted) setMantenimientosMaquinas(res.data); // Accede correctamente a los datos
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || err.message);
                console.error("Error al obtener los mantenimientos:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMantenimientosMaquinas();

        return () => { isMounted = false; };
    }, []);

    // Crear un mantenimiento
    const createMantenimientoMaquina = async (mantenimiento_maquina) => {
        try {
            setError(null);
            console.log("Enviando mantenimiento:", mantenimiento_maquina); 
            await createMantenimientoMaquinaRequest(mantenimiento_maquina); 
            const res = await getAllMantenimientosMaquinasRequest(); 
            setMantenimientosMaquinas(res.data); 
        } catch (error) {
            console.error("Error al crear el mantenimiento:", error.response?.data || error.message);
        }
    };
    
    // Actualizar un mantenimiento
    const updateMantenimientoMaquina = async (id_mantenimiento, updatedData) => {
        try {
            setError(null);
                      
            await updateMantenimientoMaquinaRequest({ id_mantenimiento, ...updatedData });
                  
            const res = await getMantenimientoMaquinaRequest(id_mantenimiento);
                  
            setMantenimientosMaquinas((prev) =>
                prev.map((mantenimiento_maquina) =>
                    mantenimiento_maquina.id_mantenimiento === id_mantenimiento ? res.data : mantenimiento_maquina
                )
            );
                    
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            console.error("Error al actualizar el mantenimiento:", error);
        }
    };

    // Eliminar un mantenimiento
    const deleteMantenimientoMaquina = async (id_mantenimiento) => {
        try {
            setError(null);
            await deleteMantenimientoMaquinaRequest(id_mantenimiento);
            setMantenimientosMaquinas((prev) => prev.filter(mantenimiento_maquina => mantenimiento_maquina.id_mantenimiento !== id_mantenimiento));
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            console.error("Error al eliminar el mantenimiento:", error);
        }
    };

    // Descargar reporte en Pdf
    const downloadPDF = async () => {
        try {
            const response = await downloadMantenimientosMaquinasPDFRequest();
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: "application/pdf" });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute("download", "reporte_mantenimientos_maquinas.pdf");
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
            const response = await downloadMantenimientosMaquinasExcelRequest();
            if (!response || !response.data) {
                console.error("La respuesta del Excel está vacía:", response);
                throw new Error("La respuesta está vacía");
            }
          
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "reporte_mantenimientos_maquinas.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            setError(error.message || "Error desconocido");
            console.error("Error al descargar el Excel:", error);
        }
    };

    return (
        <MantenimientosMaquinasContext.Provider value={{ 
            mantenimientos_maquinas, 
            loading, 
            error, 
            createMantenimientoMaquina, 
            updateMantenimientoMaquina, 
            deleteMantenimientoMaquina,
            downloadPDF,
            downloadExcel
        }}>
            {children}
        </MantenimientosMaquinasContext.Provider>
    );
};
