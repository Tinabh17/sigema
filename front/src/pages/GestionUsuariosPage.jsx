import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { FaUserPlus, FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";

const GestionUsuariosPage = () => {
  const { users, deleteUser, error, loadUsers, downloadPDF, downloadExcel, downloadRolPDF, downloadRolExcel } = useUser();
  const navigate = useNavigate();
  const [localUsers, setLocalUsers] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDownloadErrorModal, setShowDownloadErrorModal] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleDelete = (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteUser(userToDelete);
    setLocalUsers(localUsers.filter((user) => user.id_usuario !== userToDelete));
    setShowDeleteModal(false);
    setUserToDelete(null);
    setSuccessMessage("Usuario eliminado exitosamente.");
  
    // Ocultar el mensaje luego de unos segundos
    setTimeout(() => setSuccessMessage(""), 3000);
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
      case "downloadRolPDF":
        downloadRolPDF();
        break;
      case "downloadRolExcel":
        downloadRolExcel();
        break;
    }
  
    setDownloadMessage("Descarga realizada exitosamente.");
    setTimeout(() => setDownloadMessage(""), 3000);
  };  

  const filteredUsers = localUsers.filter((user) =>
    `${user.nombre} ${user.apellido} ${user.email} ${user.numero_documento} ${user.nombre_rol}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );


  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="border-b border-gray-400 flex justify-between items-center w-full pb-4">
        <h2 className="text-3xl font-bold text-black">Gestión de Usuarios</h2>
          <FaUsers size={50} />
      </div>
      <br/>

      {successMessage && (
        <div className="mb-4 bg-[#00af00] text-white font-semibold px-4 py-2 rounded shadow text-center animate-fade-in">
          {successMessage}
        </div>
      )}

      {downloadMessage && (
        <div className="mb-4 bg-[#00af00] text-white font-semibold px-4 py-2 rounded shadow text-center animate-fade-in">
          {downloadMessage}
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <div className="relative w-full md:w-1/2">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar por documento, nombre, email, rol..." className="w-full pl-10 p-2 border border-gray-300 rounded" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <br/>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        
        <Link
          to="/register"
          className="bg-[#00af00] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#008e00] transition w-full sm:w-auto justify-center"
        >
          <FaUserPlus size={20} />
          <span>Nuevo Usuario</span>
        </Link>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select className="border border-gray-300 rounded px-4 py-2" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)} >
            <option value="">Seleccionar tipo de archivo</option>
            <option value="downloadPDF">Usuarios - PDF</option>
            <option value="downloadExcel">Usuarios - Excel</option>
            <option value="downloadRolPDF">Usuarios - Roles - PDF</option>
            <option value="downloadRolExcel">Usuarios - Roles - Excel</option>
          </select>
          <button onClick={handleDownload} className="bg-[#00af00] text-white px-4 py-2 rounded hover:bg-[#008e00] transition" >
            <FaDownload size={20} />
          </button>
        </div>
      </div>

     {/* Tabla escritorio */}
     {filteredUsers.length > 0 ? (
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg border border-gray-300">
            <thead className="bg-[#008e00] text-white">
              <tr>
                <th className="p-2">Tipo de Documento</th>
                <th className="p-2">Identificación</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Apellido</th>
                <th className="p-2">Email</th>
                <th className="p-2">Dirección</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Rol</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id_usuario} className="text-center hover:bg-gray-100 transition">
                  <td className="p-2">{user.nombre_documento}</td>
                  <td className="p-2">{user.numero_documento}</td>
                  <td className="p-2">{user.nombre}</td>
                  <td className="p-2">{user.apellido}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.direccion}</td>
                  <td className="p-2">{user.telefono}</td>
                  <td className="p-2">{user.nombre_rol}</td>
                  <td className="p-2 flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/editUser/${user.id_usuario}`)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id_usuario)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No hay usuarios disponibles.</p>
      )}

      {/* Tabla móvil */}
      <div className="lg:hidden w-full overflow-x-auto mt-6">
        <table className="w-full border-collapse text-black">
          <thead className="bg-[#008e00] text-white">
            <tr>
              <th className="px-3 py-2 border border-black">Info</th>
              <th className="px-3 py-2 border border-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-3 px-4 text-center">
                  No hay usuarios disponibles
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id_usuario} className="border-b border-black">
                  <td className="text-left px-2 py-2">
                    <p><strong>Tipo Doc:</strong> {user.nombre_documento}</p>
                    <p><strong>ID:</strong> {user.numero_documento}</p>
                    <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Teléfono:</strong> {user.telefono}</p>
                    <p><strong>Dirección:</strong> {user.direccion}</p>
                    <p><strong>Rol:</strong> {user.nombre_rol}</p>
                  </td>
                  <td className="text-center py-3 px-4">
                    <button
                      className="text-yellow-500 hover:text-yellow-600 block mb-2"
                      onClick={() => navigate(`/editUser/${user.id_usuario}`)}
                    >
                      <FaEdit size={22} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(user.id_usuario)}
                    >
                      <MdDelete size={22} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#00af00] max-w-sm w-full">
            <h3 className="text-xl font-bold text-[#00af00] mb-4 text-center">¿Eliminar usuario?</h3>
            <p className="text-gray-700 mb-6 text-center">Esta acción no se puede deshacer. ¿Deseas continuar?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition" >
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-[#00af00] text-white rounded hover:bg-[#008e00] transition" >
                Eliminar
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

export default GestionUsuariosPage;
