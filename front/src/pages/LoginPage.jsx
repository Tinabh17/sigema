import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSena from "../assets/img/logo_sena.png";
import { getDocumentos } from "../api/tablas.js";

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin, isAuthenticated, errors: signinErrors } = useAuth();
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const data = await getDocumentos();
        console.log("Datos recibidos:", data); 
        setDocumentos(data);
      } catch (error) {
        console.error("Error al obtener los Tipos de documento", error);
        setDocumentos([]);
      }
    };
    fetchDocumentos();
  }, []);

  const onSubmited = handleSubmit(async (data) => {
    const userRol = await signin(data);

    if (userRol === 1) {
      navigate("/dashboard"); 
    } else if (userRol === 5 || userRol === 3) {
      navigate("/ambientes"); 
    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-pattern p-4">
      {/* Mostrar errores de autenticación */}
      {signinErrors.length > 0 && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4 w-80 text-center">
          {signinErrors.map((error, i) => (
            <p key={i} className="text-sm">{error}</p>
          ))}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-96">
        <img src={logoSena} alt="Logo SENA" className="w-24 mb-3" />
        <h2 className="text-black text-2xl font-semibold mb-4">Iniciar Sesión</h2>

        <form onSubmit={onSubmited} className="w-full flex flex-col space-y-2">
          <select
            {...register("tipo_documento", { required: "El tipo de documento es requerido", valueAsNumber: true })}
            className="w-full p-2 border rounded-full text-center bg-white"
          >
            <option value="">Seleccione Tipo de Documento</option>
            {Array.isArray(documentos) && documentos.map((documento) => (
              <option key={documento.id_documento} value={documento.id_documento}>
                {documento.tipo_documento}
              </option>
            ))}
          </select>
          {errors.tipo_documento && <p className="text-red-500 text-sm">{errors.tipo_documento.message}</p>}

          <input
            type="text"
            {...register("numero_documento", { required: "El número de documento es requerido", valueAsNumber: true })}
            placeholder="Número de Documento"
            className="w-full p-2 border rounded-full text-center bg-white"
          />
          {errors.numero_documento && <p className="text-red-500 text-sm">{errors.numero_documento.message}</p>}

          <input
            type="password"
            {...register("password", { required: "La contraseña es requerida", minLength: { value: 6, message: "Debe tener al menos 6 caracteres" } })}
            placeholder="Contraseña"
            autoComplete="off"
            className="w-full p-2 border rounded-full text-center bg-white"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <p className="text-black text-sm text-center">
            ¿Olvidaste tu contraseña? <a href="/recover" className="text-green-700 font-semibold">Recupérala aquí</a>
          </p>

          <div className="flex justify-center">
            <button type="submit" className="w-2/4 p-2 rounded-full bg-[#00af00] text-white font-bold hover:bg-green-800 transition text-sm">
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
