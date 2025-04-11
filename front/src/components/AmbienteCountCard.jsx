import { useAmbientes } from "../context/AmbientesContext.jsx";

const AmbienteCountCard = () => {
  const { ambientes } = useAmbientes(); // Obtener la lista de ambientes

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl flex flex-col items-center justify-center w-60">
      <h2 className="text-2xl font-semibold text-gray-800">Ambientes Registrados</h2>
      <span className="text-4xl font-bold text-green-600">{ambientes.length}</span>
    </div>
  );
};

export default AmbienteCountCard;