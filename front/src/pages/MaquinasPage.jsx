import { useEffect, useState } from "react";
import { useMaquinas } from "../context/MaquinasContext.jsx";
import { getAmbientes } from "../api/tablas.js";
import { getEstados } from "../api/tablas.js";
import { FaEdit, FaSearch } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { LuFolderCog } from "react-icons/lu";
import { FaDownload } from "react-icons/fa";

const MaquinasPage = () => {
  const { maquinas, createMaquina, updateMaquina, deleteMaquina, loading, error, downloadPDF, downloadExcel } = useMaquinas();
  const [estados, setEstados] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResponsableModal, setShowResponsableModal] = useState(false);
  const [selectedMaquina, setSelectedMaquina] = useState(null);
  const [formData, setFormData] = useState({
    serie: "",
    marca: "",
    nombre: "",
    ambiente: "",
    descripcion: "",
    fecha_adquisicion: "",
    cedula: "",
    cuentadante: "",
    email: "",
    estado: "",
    observaciones: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [modalObservacion, setModalObservacion] = useState({ isOpen: false, content: "" });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [successMessage, setSuccessMessage] = useState("");
  const [showDownloadErrorModal, setShowDownloadErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");

  const toggleForm = () => {
    setShowForm(!showForm);
    setFormData({
      serie: "",
      marca: "",
      nombre: "",
      ambiente: "",
      descripcion: "",
      fecha_adquisicion: "",
      cedula: "",
      cuentadante: "",
      email: "",
      estado: "",
      observaciones: "",
    });
    setEditingId(null);
  };

  const openResponsableModal = (maquina) => {
    setSelectedMaquina(maquina);
    setShowResponsableModal(true);
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
    const fetchAmbientes = async () => {
      try {
        const data = await getAmbientes();
        setAmbientes(data);
      } catch (error) {
        console.error("Error al obtener los ambientes", error);
      }
    };
    fetchAmbientes();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
  
    if (name === "imagen") {
      console.log("Archivo seleccionado:", files[0]);
      setFormData((prev) => ({ ...prev, imagen: files[0] }));
      return;
    }
  
    // Parsear ciertos valores como números (si no están vacíos)
    const numericFields = ["ambiente", "cedula", "estado"];
    const parsedValue = numericFields.includes(name)
    ? value !== "" && !isNaN(value) ? parseInt(value) : ""
    : value;
  
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clonar y limpiar datos antes de enviar
    const finalData = { ...formData };

    // Validar campos requeridos
    if (!finalData.serie || !finalData.marca || !finalData.nombre || !finalData.ambiente || !finalData.fecha_adquisicion) {
        setErrorMessage("Por favor, completa todos los campos obligatorios.");
        setTimeout(() => setErrorMessage(""), 4000); // Ocultar mensaje luego de 4 segundos
        return;
    }

    // Eliminar 'imagen' si está vacío
    if (!finalData.imagen) {
        delete finalData.imagen;
    }

    // Validar y limpiar campos opcionales
    if (finalData.cedula === "" || isNaN(finalData.cedula)) {
        delete finalData.cedula;
    }

    if (!finalData.email || finalData.email.trim() === "") {
        delete finalData.email;
    }

    console.log("Datos a enviar:", finalData);

    try {
        if (editingId) {
            await updateMaquina(editingId, finalData);
            setSuccessMessage("Máquina actualizada exitosamente.");
        } else {
            await createMaquina(finalData);
            setSuccessMessage("Máquina creada exitosamente.");
        }

        // Ocultar el mensaje de éxito después de 4 segundos
        setTimeout(() => setSuccessMessage(""), 4000);
        toggleForm(); // cerrar el formulario

    } catch (error) {
      console.error("Error al guardar la máquina:", error);
      setErrorMessage("Ocurrió un error al guardar la máquina.");
      // Ocultar el mensaje de error después de 4 segundos
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };
  
  const handleEdit = (maquina) => {
    setEditingId(maquina.id_maquina);
    setFormData({
      serie: maquina.serie || "",
      marca: maquina.marca || "",
      nombre: maquina.nombre || "",
      imagen: maquina.imagen?.startsWith("http") ? maquina.imagen : "",
      ambiente: maquina.ambiente || "",
      descripcion: maquina.descripcion || "",
      fecha_adquisicion: maquina.fecha_adquisicion || "",
      cedula: maquina.cedula || "",
      cuentadante: maquina.cuentadante || "",
      email: maquina.email || "",
      estado: maquina.estado || "",
      observaciones: maquina.observaciones || "",
    });
    setShowForm(true);
  };
  
  const handleDelete = async () => {
    if (confirmDelete.id) {
      try {
        await deleteMaquina(confirmDelete.id);
        setSuccessMessage("Máquina eliminada correctamente.");
      } catch (error) {
        console.error("Error al eliminar la máquina:", error);
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

  const filteredMaquinas = maquinas.filter((maquina) => {
    const estadoTexto = estados.find(estado => estado.id_estado === maquina.estado)?.estado?.toLowerCase() || "";

    return (
      (maquina.serie?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (maquina.marca?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (maquina.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (maquina.cedula?.toString().includes(searchTerm) || "") ||
      (maquina.cuentadante?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (estadoTexto.includes(searchTerm.toLowerCase()))
    );
  });

  const openModal = (observacion) => {
    setModalObservacion({ isOpen: true, content: observacion });
  };

  const closeModal = () => {
    setModalObservacion({ isOpen: false, content: "" });
  };


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
        <h2 className="text-3xl font-bold text-black">Gestión de Máquinas</h2>
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
        {showForm ? "Cancelar" : editingId ? "Editar Máquina" : "Crear Máquina"}
      </button>


      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="serie" placeholder="Serie" value={formData.serie} onChange={handleChange} required className="w-full p-2 border rounded" disabled={editingId !== null} />
            <input type="text" name="marca" placeholder="Marca" value={formData.marca} onChange={handleChange} required className="w-full p-2 border rounded" disabled={editingId !== null} />
            <input type="text" name="nombre" placeholder="Nombre de la Máquina" value={formData.nombre} onChange={handleChange} required className="w-full p-2 border rounded" disabled={editingId !== null} />
            <input type="file" name="imagen" placeholder="imagen" onChange={handleChange} className="w-full p-2 border rounded" />
            <select name="ambiente" value={formData.ambiente} onChange={handleChange} required className="w-full p-2 border rounded">
              <option value="">Seleccione un Ambiente</option>
              {ambientes.map((ambiente) => (
                <option key={ambiente.id_ambiente} value={ambiente.id_ambiente}>
                  {ambiente.numero_ambiente}
                </option>
              ))}
            </select>
            <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion}  onChange={handleChange} required className="w-full p-2 border rounded" disabled={editingId !== null}/>
            <input type="text" name="cedula" placeholder="Cédula" value={formData.cedula !== "" ? formData.cedula : ""} onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="text" name="cuentadante" placeholder="Cuentadante" value={formData.cuentadante} onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" />
            <select name="estado" value={formData.estado} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Seleccione un Estado</option>
              {estados.map((estado) => (
                <option key={estado.id_estado} value={estado.id_estado}>
                  {estado.estado}
                </option>
              ))}
            </select>
            <input type="text" name="observaciones" placeholder="Observación" value={formData.observaciones} onChange={handleChange} className="w-full p-2 border rounded" />
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
            <th className="p-2 border border-gray-300">Serie</th>
            <th className="p-2 border border-gray-300">Marca</th>
            <th className="p-2 border border-gray-300">Nombre</th>
            <th className="p-2 border border-gray-300">Ambiente</th>
            <th className="p-2 border border-gray-300">Descripción</th>
            <th className="p-2 border border-gray-300">Fecha de Adquisición</th>
            <th className="p-2 border border-gray-300">Responsable</th>
            <th className="p-2 border border-gray-300">Estado</th>
            <th className="p-2 border border-gray-300">Observaciones</th>
            <th className="p-2 border border-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredMaquinas.map((maquina, index) => (
            <tr key={maquina.id_maquina || index} className="border">
              <td className="p-2 text-center border">
                {maquina.imagen && (
                  <img src={maquina.imagen} alt="Imagen" className="size-12 rounded-full mb-2" />
                )}
              </td>
              <td className="p-2 text-center border">{maquina.serie}</td>
              <td className="p-2 text-center border">{maquina.marca}</td>
              <td className="p-2 text-center border">{maquina.nombre}</td>
              <td className="p-2 text-center border">
                {ambientes.find((ambiente) => ambiente.id_ambiente === maquina.ambiente)?.numero_ambiente || "No hay información disponible"}
              </td>
              <td className="p-2 text-center border">{maquina.descripcion || "Sin descripción"}</td>
              <td className="p-2 text-center border">{formatDate(maquina.fecha_adquisicion)}</td>
              <td className="p-2 text-center border">
                <button className="bg-[#00af00] text-white px-2 py-1 rounded hover:bg-[#008e00] transition" onClick={() => openResponsableModal(maquina)} >
                  Ver más
                </button>
              </td>
              <td className="p-2 text-center border">
                {estados.find((estado) => estado.id_estado === maquina.estado)?.estado || "No hay información disponible"}
              </td>
              <td className="p-2 text-center border">
                <button 
                  className="bg-[#008e00] text-white px-2 py-1 rounded hover:bg-[#00af00] transition" 
                  onClick={() => openModal(maquina.observaciones)}
                >
                  Observación
                </button>
              </td>
              <td className="p-2 text-center border">
                <button className="text-yellow-500 px-2" onClick={() => handleEdit(maquina)}>
                  <FaEdit size={20} />
                </button>
                <button className="text-red-500 px-2" onClick={() => setConfirmDelete({ isOpen: true, id: maquina.id_maquina })} >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabla en dispositivos móviles */}
      <div className="lg:hidden w-full overflow-x-auto mt-6">
        <table className="w-100 border-collapse  text-black">
          <thead className="bg-[#008e00] text-white">
            <tr>
              <th className="px-3 py-2 border border-black">Imagen</th>
              <th className="px-3 py-2 border border-black">Info</th>
              <th className="px-3 py-2 border border-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaquinas.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-3 px-4 text-center text-black">No hay maquinas disponibles</td>
              </tr>
            ) : (
              filteredMaquinas.map((maquina) => (
                <tr key={maquina.id_maquina} className="border-b border-black">

                  <td className="max-w-screen-sm border border-black text-center">
                    {maquina.imagen && (
                      <img src={maquina.imagen} alt="Maquina" className="size-12 rounded-full mb-2" />
                    )}
                  </td>
                  <td className="max-w-screen-sm text-left text-black">
                    <p className="py-2 px-4 border-b"><strong>Serie:</strong> {maquina.serie}</p>
                    <p className="py-2 px-4 border-b"><strong>Marca:</strong> {maquina.marca}</p>
                    <p className="py-2 px-4 border-b"><strong>Nombre:</strong> {maquina.nombre}</p>
                    <p className="p-2 px-4 border-b"><strong>Ambiente:</strong>{ambientes.find(a => a.id_ambiente === maquina.ambiente)?.numero_ambiente || "No hay información disponible"}</p>
                    <p className="py-2 px-4 border-b"><strong>Descripción:</strong> {maquina.descripcion || "Sin descripción"}</p>
                    <p className="py-2 px-4 border-b"><strong>Fecha de Adquisición:</strong> {formatDate(maquina.fecha_adquisicion)}</p>
                    <p className="py-2 px-4 border-b"><strong>Cédula del Cuentadante:</strong> {maquina.cedula}</p>
                    <p className="py-2 px-4 border-b"><strong>Cuentadante:</strong> {maquina.cuentadante}</p>
                    <p className="py-2 px-4 border-b"><strong>Email:</strong> {maquina.email}</p>
                    <p className="py-2 px-4 border-black"><strong>Estado:</strong> {estados.find(e => e.id_estado === maquina.estado)?.estado || "No hay información disponible"}</p>
                    <p className="py-2 px-4 border-b"><strong>Observaciones:</strong> {maquina.observaciones || "Sin observaciones"} </p>
                  </td>

                  {/* Columna de Acciones */}
                  <td className="py-3 px-4 border border-black">
                    <button className="text-yellow-400 hover:text-yellow-600 block mb-2" onClick={() => handleEdit(maquina)}>
                      <FaEdit size={24} />
                    </button>
                    <button className="text-red-500 px-2" onClick={() => setConfirmDelete({ isOpen: true, id: maquina.id_maquina })} >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalObservacion.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white w-150 p-6 rounded-lg shadow-lg text-center border border-green-700">
          <h2 className="text-lg text-center font-bold mb-4">Observaciones</h2>
            <p className="text-xl mb-4">
              {modalObservacion.content?.trim()
              ? modalObservacion.content
              : "No hay observaciones disponibles"}
            </p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showResponsableModal && selectedMaquina && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-green-700">
            <h2 className="text-lg text-center font-bold mb-4">Información Responsable de la Máquina</h2>
            {selectedMaquina.cuentadante?.trim() || selectedMaquina.email?.trim() || selectedMaquina.cedula ? (
              <>
                {selectedMaquina.cuentadante && <p><strong>Nombre:</strong> {selectedMaquina.cuentadante}</p>}
                {selectedMaquina.cedula && <p><strong>Cédula:</strong> {selectedMaquina.cedula}</p>}
                {selectedMaquina.email && <p><strong>Email:</strong> {selectedMaquina.email}</p>}
              </>
            ) : (
            <p className="text-center">No hay datos del responsable disponibles.</p>
          )}
            <div className="flex justify-center mt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg" onClick={() => setShowResponsableModal(false)} >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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

export default MaquinasPage;