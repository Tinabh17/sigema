import { useEffect, useState } from "react";
import { useMantenimientosAmbientes } from "../context/MantenimientosAmbientesContext.jsx";
import { getAmbientes } from "../api/tablas.js";
import { FaEdit, FaSearch } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { GrVmMaintenance } from "react-icons/gr";
import { FaDownload } from "react-icons/fa";

const MantenimientosAmbientesPage = () => {
  const { mantenimientos_ambientes, createMantenimientoAmbiente, updateMantenimientoAmbiente, deleteMantenimientoAmbiente, loading, error, downloadPDF, downloadExcel } = useMantenimientosAmbientes();
  const [ambientes, setAmbientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    id_ambiente: "",
    imagen: "",
    fecha_programada: "",
    descripcion: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [successMessage, setSuccessMessage] = useState("");
  const [showDownloadErrorModal, setShowDownloadErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");
  
  const toggleForm = () => {
    setShowForm(!showForm);
    setFormData({
      id_ambiente: "",
      imagen: "",
      fecha_programada: "",
      descripcion: "",
    });
    setEditingId(null);
  };
  
  useEffect(() => {
    const fetchAmbientes = async () => {
      try {
        const data = await getAmbientes();
        setAmbientes(data);
      } catch (error) {
        console.error("Error al obtener las máquinas", error);
      }
    };
    fetchAmbientes();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
        console.log("Archivo seleccionado:", files[0]);
        setFormData({ ...formData, imagen: files[0] }); 
    } else {
        const parsedValue = ["id_ambiente"].includes(name) ? Number(value) || "" : value;
        setFormData({ ...formData, [name]: parsedValue });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalData = { ...formData };
    if (!finalData.imagen) delete finalData.imagen; // Si imagen está vacío, eliminarlo

    console.log("Datos a enviar:", finalData);
    
    try {
      if (editingId) {
          await updateMantenimientoAmbiente(editingId, finalData);
          setSuccessMessage("Mantenimiento actualizado exitosamente.");
      } else {
          await createMantenimientoAmbiente(finalData);
          setSuccessMessage("Mantenimiento creado exitosamente.");
      }

      // Ocultar el mensaje de éxito después de 4 segundos
      setTimeout(() => setSuccessMessage(""), 4000);
      toggleForm(); // cerrar el formulario

    } catch (error) {
      console.error("Error al guardar el mantenimiento:", error);
      setErrorMessage("Ocurrió un error al guardar el mantenimiento.");
      // Ocultar el mensaje de error después de 4 segundos
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };
  
  const handleEdit = (mantenimiento_ambiente) => {
    setEditingId(mantenimiento_ambiente.id_mantenimiento);
    setFormData({
      id_ambiente: mantenimiento_ambiente.id_ambiente || "",
      imagen: mantenimiento_ambiente.imagen?.startsWith("http") ? mantenimiento_ambiente.imagen : "",
      fecha_programada: mantenimiento_ambiente.fecha_programada ? new Date(mantenimiento_ambiente.fecha_programada).toISOString().split("T")[0] : "",
      descripcion: mantenimiento_ambiente.descripcion || "",
    });
    setShowForm(true);
  };
  
  const handleDelete = async () => {
    if (confirmDelete.id) {
      try {
        await deleteMantenimientoAmbiente(confirmDelete.id);
        setSuccessMessage("Mantenimiento eliminado correctamente.");
      } catch (error) {
        console.error("Error al eliminar el mantenimiento:", error);
      } finally {
        setConfirmDelete({ isOpen: false, id: null });
        setTimeout(() => setSuccessMessage(""), 3000); // Ocultar mensaje luego de 3 segundos
      }
    }
  };

  const handleDownload = () => {
    if (!selectedOption) {
      setShowDownloadErrorModal(true);
      return;
    }
  
    switch (selectedOption) {
      case "downloadPDF":
        downloadPDF();
        break;
      case "downloadExcel":
        downloadExcel();
        break;
    }
  
    setDownloadMessage("Descarga realizada exitosamente.");
    setTimeout(() => setDownloadMessage(""), 3000);
  };

  const filteredMantenimientosAmbientes = mantenimientos_ambientes.filter((mantenimiento_ambiente) => {
    const ambienteTexto = ambientes.find((ambiente) => ambiente.id_ambiente === mantenimiento_ambiente.id_ambiente)?.ambiente?.toLowerCase() || "";
    const fechaTexto = mantenimiento_ambiente.fecha_programada?.toLowerCase() || "";
    return ambienteTexto.includes(searchTerm.toLowerCase()) || fechaTexto.includes(searchTerm.toLowerCase());
  });  
  
  
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2); // solo los últimos 2 dígitos
    return `${day}/${month}/${year}`;
  };
  

  return (
    <div className="container mx-auto p-6 text-gray-900">
      <div className="border-b border-gray-400 flex justify-between items-center w-full pb-4">
        <h2 className="text-3xl font-bold text-black"> Gestión del Mantenimiento de los Ambientes</h2>
        <GrVmMaintenance size={30} />
      </div>
      <br />

      {successMessage && (
        <div className="mb-4 bg-[#00af00] text-white font-semibold px-4 py-2 rounded shadow text-center animate-fade-in">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-500 text-white font-semibold px-4 py-2 rounded shadow text-center animate-fade-in">
         {errorMessage}
        </div>
      )}

      {downloadMessage && (
        <div className="mb-4 bg-[#00af00] text-white font-semibold px-4 py-2 rounded shadow text-center animate-fade-in">
          {downloadMessage}
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-green-500">Cargando...</p>}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por ambiente, fecha de mantenimiento..." className="w-full pl-10 p-2 border border-gray-300 rounded" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="flex gap-4">
          <select className="border border-gray-300 rounded px-4 py-2" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)} >
            <option value="">Seleccionar tipo de archivo</option>
            <option value="downloadPDF">Exportar como PDF</option>
            <option value="downloadExcel">Exportar como Excel</option>
          </select>
          
          <button onClick={handleDownload} className="bg-[#00af00] text-white px-4 py-2 rounded hover:bg-[#008e00] transition" >
            <FaDownload size={20} />
          </button>
        </div>
      </div>
      
      <button className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4" onClick={toggleForm}>
        {showForm ? "Cancelar" : editingId ? "Editar Mantenimiento" : "Crear Mantenimiento"}
      </button>


      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <select name="id_ambiente" value={formData.id_ambiente} onChange={handleChange} required className="w-full p-2 border rounded" disabled={editingId !== null}>
              <option value="">Seleccione el ambiente</option>
              {ambientes.map((ambiente) => (
                <option key={ambiente.id_ambiente} value={ambiente.id_ambiente}>
                  {ambiente.numero_ambiente}
                </option>
              ))}
            </select>
            <input type="file" name="imagen" placeholder="Imagen" onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="date" name="fecha_programada" value={formData.fecha_programada} onChange={handleChange} required className="w-full p-2 border rounded" />
            <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg w-full mt-4">
            {editingId ? "Actualizar" : "Guardar"}
          </button>
        </form>
      )}

      <table className="hidden lg:table w-full bg-white shadow-md rounded-lg border border-gray-300">
        <thead className="bg-[#008e00] text-white">
          <tr>
            <th className="p-2 border border-gray-300">Imagen</th>
            <th className="p-2 border border-gray-300">Ambiente</th>
            <th className="p-2 border border-gray-300">Fecha Programada para el Mantenimiento</th>
            <th className="p-2 border border-gray-300">Descripción</th>
            <th className="p-2 border border-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredMantenimientosAmbientes
          .map((mantenimiento_ambiente, index) => (
            <tr key={mantenimiento_ambiente.id_mantenimiento || index} className="border">
              <td className="p-2 text-center border">{mantenimiento_ambiente.imagen && (
                <img src={mantenimiento_ambiente.imagen} alt="Ambiente" className="size-12 rounded-full mb-2" />
                )}
              </td>
              <td className="p-2 text-center border">
                {ambientes.find((ambiente) => ambiente.id_ambiente === mantenimiento_ambiente.id_ambiente)?.numero_ambiente || "No encontrado"}
              </td>
              <td className="p-2 text-center border">{formatDate(mantenimiento_ambiente.fecha_programada)}</td>
              <td className="p-2 text-center border">{mantenimiento_ambiente.descripcion}</td>
              <td className="p-2 text-center border">
                <button className="text-yellow-500 px-2" onClick={() => handleEdit(mantenimiento_ambiente)}>
                  <FaEdit size={20} />
                </button>
                <button className="text-red-500 px-2" onClick={() => setConfirmDelete({ isOpen: true, id: mantenimiento_ambiente.id_mantenimiento
                
                 })} >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabla en dispositivos móviles */}
      <div className="lg:hidden w-full overflow-x-auto mt-6">
        <table className="w-full border-collapse text-black">
          <thead className="bg-[#008e00] text-white">
            <tr>
              <th className="px-3 py-2 border border-black">Imagen</th>
              <th className="px-3 py-2 border border-black">Info</th>
              <th className="px-3 py-2 border border-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMantenimientosAmbientes.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-3 px-4 text-center text-black">No hay mantenimientos disponibles</td>
              </tr>
            ) : (
                filteredMantenimientosAmbientes
                .map((mantenimiento_ambiente) => (
                <tr key={mantenimiento_ambiente.id_mantenimiento} className="border-b border-black">

                  <td className="max-w-screen-sm border border-black text-center">
                    {mantenimiento_ambiente.imagen && (
                      <img src={mantenimiento_ambiente.imagen} alt="Mantenimiento" className="size-12 rounded-full mb-2" />
                    )}
                  </td>

                  <td className="max-w-screen-sm text-left text-black">
                    <p className="py-2 px-4 border-b"><strong>Ambiente:</strong> {ambientes.find(ambiente => ambiente.id_ambiente === mantenimiento_ambiente.id_ambiente)?.numero_ambiente || "N/A"}</p>
                    <p className="py-2 px-4 border-b"><strong>Fecha Programada:</strong> {formatDate(mantenimiento_ambiente.fecha_programada)}</p>
                    <p className="py-2 px-4 border-b"><strong>Descripción:</strong> {mantenimiento_ambiente.descripcion}</p>
                  </td>

                  {/* Columna de Acciones */}
                  <td className="py-3 px-4 border border-black">
                    <button className="text-yellow-400 hover:text-yellow-600 block mb-2" onClick={() => handleEdit(mantenimiento_ambiente)}>
                      <FaEdit size={24} />
                    </button>
                    <button className="text-red-500 px-2" onClick={() => setConfirmDelete({ isOpen: true, id: mantenimiento_ambiente.id_mantenimiento })} >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center border border-green-700">
            <h2 className="text-xl font-semibold mb-4">¿Estás seguro?</h2>
            <p className="mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete({ isOpen: false, id: null })}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDownloadErrorModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#00af00] max-w-sm w-full">
            <h3 className="text-xl font-bold text-[#00af00] mb-4 text-center">Atención</h3>
            <p className="text-gray-700 mb-6 text-center">
              Por favor selecciona un tipo de archivo para descargar.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowDownloadErrorModal(false)}
                className="px-4 py-2 bg-[#00af00] text-white rounded hover:bg-[#008e00] transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MantenimientosAmbientesPage;