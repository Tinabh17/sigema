import { createContext, useContext, useState, useEffect } from "react";
import { getAllAmbientesRequest, getAmbienteRequest, createAmbienteRequest, updateAmbienteRequest, deleteAmbienteRequest, downloadAmbientesPDFRequest, downloadAmbientesExcelRequest } from "../api/ambientes.js";

const AmbientesContext = createContext();

export const useAmbientes = () => {
    const context = useContext(AmbientesContext);
    if (!context) {
        throw new Error("useAmbientes debe usarse dentro de un AmbientesProvider");
    }
    return context;
};

export const AmbientesProvider = ({ children }) => {
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAmbientes = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getAllAmbientesRequest();
                if (isMounted) setAmbientes(res.data); // Accede correctamente a los datos
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || err.message);
                console.error("Error al obtener los ambientes:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAmbientes();

        return () => { isMounted = false; };
    }, []);

    // Crear un ambiente
    const createAmbiente = async (ambiente) => {
        try {
            setError(null);
            console.log("Enviando ambiente:", ambiente); 
            await createAmbienteRequest(ambiente); 
            const res = await getAllAmbientesRequest(); 
            setAmbientes(res.data); 
        } catch (error) {
            console.error("Error al crear el ambiente:", error.response?.data || error.message);
        }
    };
    
    // Actualizar un ambiente
    const updateAmbiente = async (id_ambiente, updatedData) => {
        try {
            setError(null);
          
            await updateAmbienteRequest({ id_ambiente, ...updatedData });
      
            const res = await getAmbienteRequest(id_ambiente);
      
            setAmbientes((prev) =>
                prev.map((ambiente) =>
                    ambiente.id_ambiente === id_ambiente ? res.data : ambiente
                )
            );
        
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            console.error("Error al actualizar el ambiente:", error);
        }
    };      

    // Eliminar un ambiente
    const deleteAmbiente = async (id_ambiente) => {
        try {
            setError(null);
            await deleteAmbienteRequest(id_ambiente);
            setAmbientes((prev) => prev.filter(ambiente => ambiente.id_ambiente !== id_ambiente));
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            console.error("Error al eliminar el ambiente:", error);
        }
    };
    
    // Descargar reporte en Pdf
    const downloadPDF = async () => {
        try {
            const response = await downloadAmbientesPDFRequest();
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: "application/pdf" });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute("download", "reporte_ambientes.pdf");
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
            const response = await downloadAmbientesExcelRequest();
            if (!response || !response.data) {
                console.error("La respuesta del Excel está vacía:", response);
                throw new Error("La respuesta está vacía");
            }
          
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "reporte_ambientes.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            setError(error.message || "Error desconocido");
            console.error("Error al descargar el Excel:", error);
        }
    };

    return (
        <AmbientesContext.Provider value={{ 
            ambientes, 
            loading, 
            error, 
            createAmbiente, 
            updateAmbiente, 
            deleteAmbiente,
            downloadPDF,
            downloadExcel
        }}>
            {children}
        </AmbientesContext.Provider>
    );
};
