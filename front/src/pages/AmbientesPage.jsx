import { useEffect, useState } from "react";
import { useAmbientes } from "../context/AmbientesContext.jsx";
import { getEstados, getTiposAmbientes } from "../api/tablas.js";
import { FaEdit, FaSearch } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { FaDownload } from "react-icons/fa";

const AmbientesPage = () => {
  const { ambientes, createAmbiente, updateAmbiente, deleteAmbiente, loading, error, downloadPDF, downloadExcel } = useAmbientes();
  const [estados, setEstados] = useState([]);
  const [tiposAmbientes, setTiposAmbientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    numero_ambiente: "",
    nombre_ambiente: "",
    tipo_ambiente: "",
    ubicacion: "",
    capacidad: "",
    imagen: "",
    estado: "",
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
      numero_ambiente: "",
      nombre_ambiente: "",
      tipo_ambiente: "",
      ubicacion: "",
      capacidad: "",
      imagen: "",
      estado: "",
    });
    setEditingId(null);
  };

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const data = await getEstados();
        setEstados(data);
      } catch (error) {
        console.error("Error al obtener los Estados", error);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    const fetchTiposAmbientes = async () => {
      try {
        const data = await getTiposAmbientes();
        setTiposAmbientes(data);
      } catch (error) {
        console.error("Error al obtener los Tipos de Ambientes", error);
      }
    };
    fetchTiposAmbientes();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
        console.log("Archivo seleccionado:", files[0]);
        setFormData({ ...formData, imagen: files[0] }); 
    } else {
        const parsedValue = ["numero_ambiente", "capacidad", "estado", "tipo_ambiente"].includes(name) ? Number(value) || "" : value;
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
            await updateAmbiente(editingId, finalData);
            setEditingId(null);
        } else {
            await createAmbiente(finalData);
        }
        toggleForm();
    } catch (error) {
        console.error("Error al guardar el ambiente:", error);
    }
  };
  
  const handleEdit = (ambiente) => {
    setEditingId(ambiente.id_ambiente);
    setFormData({
        numero_ambiente: ambiente.numero_ambiente || "",
        nombre_ambiente: ambiente.nombre_ambiente || "",
        tipo_ambiente: ambiente.tipo_ambiente || "",
        ubicacion: ambiente.ubicacion || "",
        capacidad: ambiente.capacidad || "",
        imagen: ambiente.imagen?.startsWith("http") ? ambiente.imagen : "",
        estado: ambiente.estado || "",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (confirmDelete.id) {
      try {
        await deleteAmbiente(confirmDelete.id);
        setSuccessMessage("ManteAmbienteimiento eliminado correctamente.");
      } catch (error) {
        console.error("Error al eliminar el ambiente:", error);
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

  const filteredAmbientes = ambientes.filter((ambiente) => {
    const tipoTexto = tiposAmbientes.find(tipo => tipo.id_tipo_ambiente === ambiente.tipo_ambiente)?.tipo?.toLowerCase() || "";
    const estadoTexto = estados.find(estado => estado.id_estado === ambiente.estado)?.estado?.toLowerCase() || "";
    
    return (
      ambiente.nombre_ambiente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambiente.numero_ambiente.toString().includes(searchTerm) ||
      tipoTexto.includes(searchTerm.toLowerCase()) ||
      estadoTexto.includes(searchTerm.toLowerCase())
    );
  });

  
  
  return (
    <div className="container mx-auto p-6 text-gray-900">
      <div className="border-b border-gray-400 flex justify-between items-center w-full pb-4">
        <h2 className="text-3xl font-bold text-black">Gestión de Ambientes</h2>
        <FaLocationDot size={30} />
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
          <input type="text" placeholder="Buscar por nombre o ubicación..." className="w-full pl-10 p-2 border border-gray-300 rounded" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
        {showForm ? "Cancelar" : editingId ? "Editar Ambiente" : "Crear Ambiente"}
      </button>
      

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="numero_ambiente" placeholder="Número" value={formData.numero_ambiente} onChange={handleChange} required className="w-full p-2 border rounded" disabled={editingId !== null}/>
            <input type="text" name="nombre_ambiente" placeholder="Nombre" value={formData.nombre_ambiente} onChange={handleChange} className="w-full p-2 border rounded" />
            <select name="tipo_ambiente" value={formData.tipo_ambiente} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Seleccione Tipo de Ambiente</option>
              {tiposAmbientes.map((tipo) => (
                <option key={tipo.id_tipo_ambiente} value={tipo.id_tipo_ambiente}>
                  {tipo.tipo}
                </option>
              ))}
            </select>
            <input type="text" name="ubicacion" placeholder="Ubicación" value={formData.ubicacion} onChange={handleChange} required className="w-full p-2 border rounded" disabled={editingId !== null}  />
            <input type="number" name="capacidad" placeholder="Capacidad" value={formData.capacidad} onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="file" name="imagen" placeholder="imagen" onChange={handleChange} className="w-full p-2 border rounded" />
            <select name="estado" value={formData.estado} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Seleccione un Estado</option>
              {estados.map((estado) => (
                <option key={estado.id_estado} value={estado.id_estado}>
                  {estado.estado}
                </option>
              ))}
            </select>
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
            <th className="p-2 border border-gray-300">Número</th>
            <th className="p-2 border border-gray-300">Nombre</th>
            <th className="p-2 border border-gray-300">Tipo</th>
            <th className="p-2 border border-gray-300">Ubicación</th>
            <th className="p-2 border border-gray-300">Capacidad</th>
            <th className="p-2 border border-gray-300">Estado</th>
            <th className="p-2 border border-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredAmbientes
          .sort((a, b) => a.numero_ambiente - b.numero_ambiente)
          .map((ambiente, index) => (

            <tr key={ambiente.id_ambiente || index} className="border">

              <td className="p-2 text-center border">{ambiente.imagen && (
                <img src={ambiente.imagen} alt="Ambiente" className="size-12 rounded-full mb-2" />
                )}
              </td>
              <td className="p-2 text-center border">{ambiente.numero_ambiente}</td>
              <td className="p-2 text-center border">{ambiente.nombre_ambiente}</td>
              <td className="p-2 text-center border">{tiposAmbientes.find((tipo) => tipo.id_tipo_ambiente === ambiente.tipo_ambiente)?.tipo || "N/A"}</td>
              <td className="p-2 text-center border">{ambiente.ubicacion}</td>
              <td className="p-2 text-center border">{ambiente.capacidad}</td>
              <td className="p-2 text-center border">{estados.find((estado) => estado.id_estado === ambiente.estado)?.estado || "N/A"}</td>
              <td className="p-2 text-center border">
                <button className="text-yellow-500 px-2" onClick={() => handleEdit(ambiente)}>
                  <FaEdit size={20} />
                </button>
                <button className="text-red-500 px-2" onClick={() => setConfirmDelete({ isOpen: true, id: ambiente.id_ambiente })} >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabla en dispositivos móviles */}
      <div className="lg:hidden w-full overflow-x-auto mt-6">
        <table className="w-full border-collapse  text-black">
          <thead className="bg-[#008e00] text-white">
            <tr>
              <th className="px-3 py-2 border border-black">Imagen</th>
              <th className="px-3 py-2 border border-black">Info</th>
              <th className="px-3 py-2 border border-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAmbientes.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-3 px-4 text-center text-black">No hay ambientes disponibles</td>
              </tr>
            ) : (
              filteredAmbientes
              .sort((a, b) => a.numero_ambiente - b.numero_ambiente)
              .map((ambiente) => (
                <tr key={ambiente.id_ambiente} className="border-b border-black">

                  <td className="max-w-screen-sm border border-black text-center">
                    {ambiente.imagen && (
                      <img src={ambiente.imagen} alt="Ambiente" className="size-12 rounded-full mb-2" />
                    )}
                  </td>
                  <td className="max-w-screen-sm text-left text-black">
                    <p className="py-2 px-4 border-b"><strong>Número:</strong> {ambiente.numero_ambiente}</p>
                    <p className="py-2 px-4 border-b"><strong>Nombre:</strong> {ambiente.nombre_ambiente}</p>
                    <p className="py-2 px-4 border-b"><strong>Tipo:</strong> {tiposAmbientes.find(t => t.id_tipo_ambiente === ambiente.tipo_ambiente)?.tipo || "N/A"}</p>
                    <p className="py-2 px-4 border-b"><strong>Ubicación:</strong> {ambiente.ubicacion}</p>
                    <p className="py-2 px-4 border-b"><strong>Capacidad:</strong> {ambiente.capacidad}</p>
                    <p className="py-2 px-4 border-black"><strong>Estado:</strong> {estados.find(e => e.id_estado === ambiente.estado)?.estado || "N/A"}</p>
                  </td>

                  {/* Columna de Acciones */}
                  <td className="py-3 px-4 border border-black">
                    <button className="text-yellow-400 hover:text-yellow-600 block mb-2" onClick={() => handleEdit(ambiente)}>
                      <FaEdit size={24} />
                    </button>
                    <button className="text-red-400 hover:text-red-600" onClick={() => handleDelete(ambiente.id_ambiente)}>
                      <MdDelete size={22} />
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

export default AmbientesPage;
