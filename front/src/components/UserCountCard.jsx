import { useUser } from "../context/UserContext";

const UserCountCard = () => {
  const { users } = useUser(); // Obtener la lista de usuarios

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl flex flex-col items-center justify-center w-60">
      <h2 className="text-2xl font-semibold text-gray-800">Usuarios Registrados</h2>
      <span className="text-4xl font-bold text-green-600">{users.length}</span>
    </div>
  );
};

export default UserCountCard;