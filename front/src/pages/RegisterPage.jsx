import {useState, useEffect} from 'react';
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { HiIdentification } from "react-icons/hi2";
import { getDocumentos, getRoles } from "../api/tablas.js";
import { useUser } from "../context/UserContext";

function RegisterPage() {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const { signup, errors: registerErrors = [] } = useAuth();
    const { users, updateUser, loadUsers } = useUser(); // Obtener la lista de usuarios cargados
    const navigate = useNavigate();
    const { id } = useParams(); // Obtener el id del usuario a editar de la URL
    const [documentos, setDocumentos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [userToEdit, setUserToEdit] = useState(null);

    useEffect(() => {
        loadUsers(); // Cargar la lista de usuarios si no está cargada aún
    }, []);

    useEffect(() => {
        if (id && users.length > 0) {
            const user = users.find((u) => u.id_usuario === parseInt(id));
            if (user) {
                setUserToEdit(user);
                // Cargar valores en el formulario
                setValue("tipo_documento", user.tipo_documento);
                setValue("numero_documento", user.numero_documento);
                setValue("nombre", user.nombre);
                setValue("apellido", user.apellido);
                setValue("email", user.email);
                setValue("telefono", user.telefono);
                setValue("direccion", user.direccion);
                setValue("rol", user.rol);
            }
        }
    }, [id, users, setValue]);
    
    useEffect(() => {
      const fetchDocumentos = async () => {
        try {
          const data = await getDocumentos(); 
          setDocumentos(data);
        } catch (error) {
          console.error("Error al obtener los Tipos de documento", error);
          setDocumentos([]);
        }
      };
      fetchDocumentos();
    }, []);

    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const data = await getRoles();
          setRoles(data);
        } catch (error) {
          console.error("Error al obtener los Tipos de documento", error);
          setRoles([]);
        }
      };
      fetchRoles();
    }, []);

    const onSubmit = async (data) => {
        if (userToEdit) {
            // Si hay un usuario a editar, actualizarlo
            await updateUser(userToEdit.id_usuario, data);  // Corregido: Usar la función de UserContext
        } else {
            // Si no, registrar un nuevo usuario
            await signup(data);
        }
        navigate("/usuarios");  // Redirigir a la página de gestión de usuarios
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <main className="max-w-6xl mx-auto p-6">
                <div className="border-b border-gray-400 flex justify-between items-center w-full pb-4">
                    <h1 className="text-3xl font-bold text-black">{userToEdit ? "Editar usuario" : "Registrar usuario"}</h1>
                    <HiIdentification size={35} />
                </div>

                {registerErrors.length > 0 && (
                    <div className="bg-red-500 text-white p-2 my-2 rounded-md">
                        {registerErrors.map((error, i) => (
                            <div key={i}>{error}</div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="text-black font-bold block mb-2">Tipo de Documento</label>
                        <select {...register("tipo_documento", { required: "El tipo de documento es requerido", valueAsNumber: true})} className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccione Tipo de Documento</option>
                                {Array.isArray(documentos) && documentos.map((documento) => (
                            <option key={documento.id_documento} value={documento.id_documento}>
                                {documento.tipo_documento}
                            </option>
                        ))}

          </select>
          {errors.tipo_documento && <p className="text-red-500 text-sm">{errors.tipo_documento.message}</p>}
                    </div>

                    <div>
                        <label className="text-black font-bold block mb-2">Número de Documento</label>
                        <input type="number" {...register("numero_documento", { required: "El número de documento es requerido", valueAsNumber: true})}
                            className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Número de Documento" />
                        {errors.numero_documento && <p className="text-red-500 text-sm mt-1">{errors.numero_documento.message}</p>}
                    </div>

                    <div>
                        <label className="text-black font-bold block mb-2">Nombre</label>
                        <input type="text" {...register("nombre", { required: "El nombre es requerido" })}
                            className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nombre" />
                        {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
                    </div>

                    <div>
                        <label className="text-black font-bold block mb-2">Apellido</label>
                        <input type="text" {...register("apellido", { required: "El apellido es requerido" })}
                            className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Apellido" />
                        {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>}
                    </div>

                    <div>
                        <label className="text-black font-bold block mb-2">Correo Electrónico</label>
                        <input type="email" {...register("email", { required: "El correo electrónico es requerido" })}
                            className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Correo Electrónico" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="text-black font-bold block mb-2">Teléfono</label>
                        <input type="number" {...register("telefono", { required: "El teléfono es requerido" })}
                            className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Teléfono" />
                        {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
                    </div>

                    <div>
                        <label className="text-black font-bold block mb-2">Dirección</label>
                        <input type="text" {...register("direccion", { required: "La dirección es requerida" })}
                            className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dirección" />
                        {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>}
                    </div>

                    <div>
                        <label className="text-black font-bold block mb-2">Rol</label>
                        <select {...register("rol", { required: "El rol es requerido", valueAsNumber: true})} className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccione el rol</option>
                                {Array.isArray(roles) && roles.map((rol) => (
                            <option key={rol.id_rol} value={rol.id_rol}>
                                {rol.rol}
                            </option>
                        ))}

          </select>
                        {errors.rol && <p className="text-red-500 text-sm mt-1">{errors.rol.message}</p>}
                    </div>

                    <div>
                        <label className="text-black font-bold block mb-2">Contraseña</label>
                        <input type="password" {...register("password", { required: !userToEdit && "La contraseña es requerida", minLength: { value: 6, message: "Debe tener al menos 6 caracteres" } })}
                            className="w-full border border-gray-300 bg-white text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={userToEdit ? "Deja vacío si no deseas cambiar la contraseña" : "Contraseña"} />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="col-span-2 flex justify-center mt-4">
                        <button type="submit" className="bg-[#00af00] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#008e00] transition duration-300">
                            {userToEdit ? "Actualizar" : "Registrar"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default RegisterPage;
