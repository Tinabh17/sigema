import { useMaquinas } from "../context/MaquinasContext.jsx";

const MachineCountCard = () => {
  const { maquinas } = useMaquinas(); // Obtener la lista de máquinas

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl flex flex-col items-center justify-center w-60">
      <h2 className="text-2xl font-semibold text-gray-800">Máquinas Registradas</h2>
      <span className="text-4xl font-bold text-green-600">{maquinas.length}</span>
    </div>
  );
};

export default MachineCountCard;