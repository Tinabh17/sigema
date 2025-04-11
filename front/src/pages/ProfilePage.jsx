import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const ProfilePage = () => {
  const { user } = useAuth();
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.apellido || !formData.email) {
      return "Por favor, completa todos los campos obligatorios.";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      return "Por favor, introduce un email válido.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await updateUser(user.id, formData);
      setMessage("Perfil actualizado correctamente.");
    } catch (error) {
      setError("Error al actualizar el perfil. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-center text-gray-500">Cargando perfil...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Perfil de Usuario</h2>

      {error && <p className="bg-red-100 text-red-700 text-center py-2 rounded mb-4">{error}</p>}
      {message && <p className="bg-green-100 text-green-700 text-center py-2 rounded mb-4">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
          <h3 className="text-xl font-bold mb-2">Información Básica</h3>
          <p className="text-gray-700"><strong>Tipo de Documento:</strong> {user.tipo_documento}</p>
          <p className="text-gray-700"><strong>Número de Identificación:</strong> {user.numero_documento}</p>
          <p className="text-gray-700"><strong>Rol:</strong> {user.rol}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ label: "Nombre", name: "nombre", icon: <FaUser /> },
            { label: "Apellido", name: "apellido", icon: <FaUser /> },
            { label: "Email", name: "email", icon: <FaEnvelope />, type: "email" },
            { label: "Teléfono", name: "telefono", icon: <FaPhone /> },
            { label: "Dirección", name: "direccion", icon: <FaMapMarkerAlt /> },
          ].map(({ label, name, type = "text", icon }) => (
            <div key={name} className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                {icon}
              </span>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={label}
                required
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-bold rounded-md transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#00af00] hover:bg-[#008e00] text-white"
            }`}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
