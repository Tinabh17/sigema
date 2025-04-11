import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

function EditUserPage() {
  const { register, handleSubmit, setValue } = useForm();
  const { getUser, updateUser, error } = useUser();
  const { id } = useParams(); // Obtener ID del usuario desde la URL
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const user = await getUser(id); // Cargar datos del usuario por ID
      if (user) {
        setValue("tipo_documento", user.tipo_documento);
        setValue("numero_documento", user.numero_documento);
        setValue("nombre", user.nombre);
        setValue("apellido", user.apellido);
        setValue("email", user.email);
        setValue("telefono", user.telefono);
        setValue("direccion", user.direccion);
        setValue("rol", user.rol);
      }
    };
    loadUser();
  }, [id, setValue, getUser]);

  const onSubmit = async (data) => {
    await updateUser(id, data); // Actualizar el usuario
    navigate("/usuarios"); // Redirigir a la lista de usuarios
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Editar Usuario</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block font-bold">Nombre</label>
          <input {...register("nombre", { required: true })} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block font-bold">Apellido</label>
          <input {...register("apellido", { required: true })} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block font-bold">Correo Electrónico</label>
          <input {...register("email", { required: true })} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block font-bold">Teléfono</label>
          <input {...register("telefono", { required: true })} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="col-span-2">
          <label className="block font-bold">Dirección</label>
          <input {...register("direccion", { required: true })} className="w-full border px-3 py-2 rounded" />
        </div>
        <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded mt-4">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

export default EditUserPage;
