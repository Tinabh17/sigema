import { useEffect, useState } from "react";
import { useMantenimientosMaquinas } from "../context/MantenimientosMaquinasContext.jsx";
import { getMaquinas } from "../api/tablas.js";
import { getTiposMantenimientos, getEstadoMantenimiento } from "../api/tablas.js";
import { FaEdit, FaSearch } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { LuFolderCog } from "react-icons/lu";
import { FaDownload } from "react-icons/fa";

const MantenimientosMaquinasPage = () => {
  const { mantenimientos_maquinas, createMantenimientoMaquina, updateMantenimientoMaquina, deleteMantenimientoMaquina, loading, error, downloadPDF, downloadExcel } = useMantenimientosMaquinas();
  const [maquinas, setMaquinas] = useState([]);
  const [tipos_mantenimientos, setTiposMantenimientos] = useState([]);
  const [estado_mantenimiento, setEstadoMantenimiento] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedResponsable, setSelectedResponsable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    id_maquina: "",
    imagen: "",
    fecha_programada: "",
    responsable: "",
    email: "",
    tipo_mantenimiento: "",
    estado: "",
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
      id_maquina: "",
      imagen: "",
      fecha_programada: "",
      responsable: "",
      email: "",
      tipo_mantenimiento: "",
      estado: "",
      descripcion: "",
    });
    setEditingId(null);
  };
  
  useEffect(() => {
    const fetchMaquinas = async () => {
      try {
        const data = await getMaquinas();
        setMaquinas(data);
      } catch (error) {
        console.error("Error al obtener las máquinas", error);
      }
    };
    fetchMaquinas();
  }, []);

  useEffect(() => {
    const fetchTiposMantenimientos = async () => {
      try {
        const data = await getTiposMantenimientos();
        setTiposMantenimientos(data);
      } catch (error) {
        console.error("Error al obtener los mantenimientos", error);
      }
    };
    fetchTiposMantenimientos();
  }, []);

  useEffect(() => {
    const fetchEstadoMantenimiento = async () => {
      try {
        const data = await getEstadoMantenimiento();
        setEstadoMantenimiento(data);
      } catch (error) {
        console.error("Error al obtener los estados", error);
      }
    };
    fetchEstadoMantenimiento();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
        console.log("Archivo seleccionado:", files[0]);
        setFormData({ ...formData, imagen: files[0] }); 
    } else {
        const parsedValue = ["id_maquina", "tipo_mantenimiento", "estado"].includes(name) ? Number(value) || "" : value;
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
          await updateMantenimientoMaquina(editingId, finalData);
          setSuccessMessage("Mantenimiento actualizado exitosamente.");
      } else {
          await createMantenimientoMaquina(finalData);
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
  
  const handleEdit = (mantenimiento_maquina) => {
    setEditingId(mantenimiento_maquina.id_mantenimiento);
    setFormData({
      id_maquina: mantenimiento_maquina.id_maquina || "",
      imagen: mantenimiento_maquina.imagen?.startsWith("http") ? mantenimiento_maquina.imagen : "",
      fecha_programada: mantenimiento_maquina.fecha_programada ? new Date(mantenimiento_maquina.fecha_programada).toISOString().split("T")[0] : "",
      responsable: mantenimiento_maquina.responsable || "",
      email: mantenimiento_maquina.email || "",
      tipo_mantenimiento: mantenimiento_maquina.tipo_mantenimiento || "",
      estado: mantenimiento_maquina.estado || "",
      descripcion: mantenimiento_maquina.descripcion || "",
    });
    setShowForm(true);
  };

  const handleVerMas = (mantenimiento) => {
    setSelectedResponsable(mantenimiento);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResponsable(null);
  };
  
  const handleDelete = async () => {
    if (confirmDelete.id) {
      try {
        await deleteMantenimientoMaquina(confirmDelete.id);
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

  const filteredMantenimientosMaquinas = mantenimientos_maquinas.filter((mantenimiento_maquina) => {
    const maquinaTexto = maquinas.find((maquina) => maquina.id_maquina === mantenimiento_maquina.id_maquina)?.serie?.toLowerCase() || "";
    const estadoTexto = estado_mantenimiento.find((estado) => estado.id_estado_mantenimiento === mantenimiento_maquina.estado)?.estado?.toLowerCase() || "";
    const tipo_mantenimientoTexto = tipos_mantenimientos.find((tipo) => tipo.id_tipo_mantenimiento === mantenimiento_maquina.tipo_mantenimiento)?.tipo_mantenimiento?.toLowerCase() || "";
  
    return (
      maquinaTexto.includes(searchTerm.toLowerCase()) ||
      estadoTexto.includes(searchTerm.toLowerCase()) ||
      tipo_mantenimientoTexto.includes(searchTerm.toLowerCase()) ||
      (mantenimiento_maquina.fecha_programada?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (mantenimiento_maquina.responsable?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
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
        <h2 className="text-3xl font-bold text-black"> Gestión del Mantenimientos de las Máquinas</h2>
        <LuFolderCog size={30} />
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
          <input type="text" placeholder="Buscar por serie, responsable, estado..." className="w-full pl-10 p-2 border border-gray-300 rounded" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
            <select name="id_maquina" value={formData.id_maquina} onChange={handleChange} required className="w-full p-2 border rounded" disabled={editingId !== null}>
              <option value="">Seleccione la Máquina</option>
              {maquinas.map((maquina) => (
                <option key={maquina.id_maquina} value={maquina.id_maquina}>
                  {maquina.serie}
                </option>
              ))}
            </select>
            <input type="file" name="imagen" placeholder="Imagen" onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="date" name="fecha_programada" value={formData.fecha_programada} onChange={handleChange} required className="w-full p-2 border rounded" />
            <input type="text" name="responsable" placeholder="Responsable" value={formData.responsable} onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" />
            <select name="tipo_mantenimiento" value={formData.tipo_mantenimiento} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Seleccione el Tipo de Mantenimiento</option>
              {tipos_mantenimientos.map((tipo) => (
                <option key={tipo.id_tipo_mantenimiento} value={tipo.id_tipo_mantenimiento}>
                  {tipo.tipo}
                </option>
              ))}
            </select>
            <select name="estado" value={formData.estado} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Seleccione un Estado</option>
              {estado_mantenimiento.map((estado) => (
                <option key={estado.id_estado_mantenimiento} value={estado.id_estado_mantenimiento}>
                  {estado.estado_mantenimiento}
                </option>
              ))}
            </select>
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
            <th className="p-2 border">Imagen</th>
            <th className="p-2 border">Serie de la Máquina</th>
            <th className="p-2 border">Nombre de la Máquina</th>
            <th className="p-2 border">Fecha Programada para el Mantenimiento</th>
            <th className="p-2 border">Responsable</th>
            <th className="p-2 border">Tipo de Mantenimiento</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredMantenimientosMaquinas.map((mantenimiento_maquina, index) => (
            <tr key={mantenimiento_maquina.id_mantenimiento || index} className="border">
              <td className="p-2 text-center border">
                {mantenimiento_maquina.imagen && (
                  <img src={mantenimiento_maquina.imagen} alt="Ambiente" className="size-12 rounded-full mb-2 mx-auto" />
                )}
              </td>
              <td className="p-2 text-center border">
                {maquinas.find((maq) => maq.id_maquina === mantenimiento_maquina.id_maquina)?.serie || "No encontrado"}
              </td>
              <td className="p-2 text-center border">
                {maquinas.find((maq) => maq.id_maquina === mantenimiento_maquina.id_maquina)?.nombre || "No encontrado"}
              </td>
              <td className="p-2 text-center border">{formatDate(mantenimiento_maquina.fecha_programada)}</td>
              <td className="p-2 text-center border">
                <button
                  onClick={() => handleVerMas(mantenimiento_maquina)}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Ver más
                </button>
              </td>
              <td className="p-2 text-center border">
                {mantenimiento_maquina.tipo_mantenimiento || "No encontrado"}
              </td>
              <td className="p-2 text-center border">
                {mantenimiento_maquina.estado || "No encontrado"}
              </td>
              <td className="p-2 text-center border">{mantenimiento_maquina.descripcion}</td>
              <td className="p-2 text-center border">
                <button className="text-yellow-500 px-2" onClick={() => handleEdit(mantenimiento_maquina)}>
                  <FaEdit size={20} />
                </button>
                <button className="text-red-500 px-2" onClick={() => setConfirmDelete({ isOpen: true, id: mantenimiento_maquina.id_mantenimiento })} >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && selectedResponsable && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-green-700">
            <h2 className="text-lg text-center font-bold mb-4">Información del Responsable del Mantenimiento</h2>
            {selectedResponsable.responsable?.trim() || selectedResponsable.email?.trim() ? (
              <>
                {selectedResponsable.responsable && <p><strong>Nombre:</strong> {selectedResponsable.responsable}</p>}
                {selectedResponsable.email && <p><strong>Email:</strong> {selectedResponsable.email}</p>}
              </>
            ) : (
            <p className="text-center">No hay datos del responsable disponibles.</p>
          )}
          <div className="flex justify-center mt-4">
            <button
              className="bg-[#008e00] hover:bg-green-700 text-white px-4 py-2 rounded-lg"
               onClick={closeModal} >
              Cerrar
            </button>
            </div>
          </div>
        </div>
      )}

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
            {filteredMantenimientosMaquinas.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-3 px-4 text-center text-black">No hay mantenimientos disponibles</td>
              </tr>
            ) : (
              filteredMantenimientosMaquinas
              .map((mantenimiento_maquina) => (
                <tr key={mantenimiento_maquina.id_mantenimiento} className="border-b border-black">

                  <td className="max-w-screen-sm border border-black text-center">
                    {mantenimiento_maquina.imagen && (
                      <img src={mantenimiento_maquina.imagen} alt="Mantenimiento" className="size-12 rounded-full mb-2" />
                    )}
                  </td>

                  <td className="max-w-screen-sm text-left text-black">
                    <p className="py-2 px-4 border-b"><strong>Serie de la Máquina:</strong> {maquinas.find(maquina => maquina.id_maquina === mantenimiento_maquina.id_maquina)?.serie || "No encontrado"}</p>
                    <p className="py-2 px-4 border-b"><strong>Nombre de la Maquina:</strong> {maquinas.find(maquina => maquina.id_maquina === mantenimiento_maquina.id_maquina)?.nombre || "No encontrado"}</p>
                    <p className="py-2 px-4 border-b"><strong>Fecha Programada:</strong> {formatDate(mantenimiento_maquina.fecha_programada)}</p>
                    <p className="py-2 px-4 border-b"><strong>Responsable del Mantenimiento:</strong> {mantenimiento_maquina.responsable}</p>
                    <p className="py-2 px-4 border-b"><strong>Correo Electrónico:</strong> {mantenimiento_maquina.email}</p>
                    <p className="py-2 px-4 border-black"><strong>Tipo de Mantenimiento:</strong> {tipos_mantenimientos.find(tipo => tipo.id_tipo_mantenimiento === mantenimiento_maquina.tipo_mantenimiento)?.tipo || "No encontrado"}</p>
                    <p className="py-2 px-4 border-black"><strong>Estado:</strong> {estado_mantenimiento.find(estado => estado.id_estado_mantenimiento === mantenimiento_maquina.estado)?.estado_mantenimiento || "No encontrado"}</p>
                    <p className="py-2 px-4 border-b"><strong>Descripción:</strong> {mantenimiento_maquina.descripcion}</p>
                  </td>

                  {/* Columna de Acciones */}
                  <td className="py-3 px-4 border border-black">
                    <button className="text-yellow-400 hover:text-yellow-600 block mb-2" onClick={() => handleEdit(mantenimiento_maquina)}>
                      <FaEdit size={24} />
                    </button>
                    <button className="text-red-500 px-2" onClick={() => setConfirmDelete({ isOpen: true, id: mantenimiento_maquina.id_mantenimiento })} >
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

export default MantenimientosMaquinasPage;