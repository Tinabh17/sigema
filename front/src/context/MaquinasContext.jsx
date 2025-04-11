import { createContext, useContext, useState, useEffect } from "react";
import { getAllMaquinasRequest, getMaquinaRequest, createMaquinaRequest, updateMaquinaRequest, deleteMaquinaRequest, downloadMaquinasPDFRequest, downloadMaquinasExcelRequest } from "../api/maquinas.js";

const MaquinasContext = createContext();

export const useMaquinas = () => {
    const context = useContext(MaquinasContext);
    if (!context) {
        throw new Error("useMaquinas debe usarse dentro de un MaquinasProvider");
    }
    return context;
};

export const MaquinasProvider = ({ children }) => {
    const [maquinas, setMaquinas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchMaquinas = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getAllMaquinasRequest();
                if (isMounted) setMaquinas(res.data); // Accede correctamente a los datos
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || err.message);
                console.error("Error al obtener las máquinas:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMaquinas();

        return () => { isMounted = false; };
    }, []);

    // Crear una máquina
    const createMaquina = async (maquina) => {
        try {
            setError(null);
            console.log("Enviando máquina:", maquina); 
            await createMaquinaRequest(maquina); 
            const res = await getAllMaquinasRequest(); 
            setMaquinas(res.data); 
        } catch (error) {
            console.error("Error al crear el máquina:", error.response?.data || error.message);
        }
    };
    
    // Actualizar una máquina
    const updateMaquina = async (id_maquina, updatedData) => {
        try {
            setError(null);
                  
            await updateMaquinaRequest({ id_maquina, ...updatedData });
              
            const res = await getMaquinaRequest(id_maquina);
              
            setMaquinas((prev) =>
                prev.map((maquina) =>
                    maquina.id_maquina === id_maquina ? res.data : maquina
                )
            );
                
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            console.error("Error al actualizar la máquina:", error);
        }
    };

    // Eliminar una máquina
    const deleteMaquina = async (id_maquina) => {
        try {
            setError(null);
            await deleteMaquinaRequest(id_maquina);
            setMaquinas((prev) => prev.filter(maquina => maquina.id_maquina !== id_maquina));
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            console.error("Error al eliminar la máquina:", error);
        }
    };

    // Descargar reporte en Pdf
    const downloadPDF = async () => {
        try {
            const response = await downloadMaquinasPDFRequest();
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: "application/pdf" });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute("download", "reporte_maquinas.pdf");
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
            const response = await downloadMaquinasExcelRequest();
            if (!response || !response.data) {
                console.error("La respuesta del Excel está vacía:", response);
                throw new Error("La respuesta está vacía");
            }
      
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "reporte_maquinas.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            setError(error.message || "Error desconocido");
            console.error("Error al descargar el Excel:", error);
        }
    };

    return (
        <MaquinasContext.Provider value={{ 
            maquinas, 
            loading, 
            error, 
            createMaquina, 
            updateMaquina, 
            deleteMaquina,
            downloadPDF,
            downloadExcel,
        }}>
            {children}
        </MaquinasContext.Provider>
    );
};
