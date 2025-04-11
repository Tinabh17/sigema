import React from "react";
import BarsChart from "../components/BarsChart";
import MachineCountCard from "../components/MachineCountCard";
import AmbienteCountCard from "../components/AmbienteCountCard";
import UserCountCard from "../components/UserCountCard";
import ProximosMantenimientos from "../components/ProximosMantenimientos";

function Dashboard() {
  return (
    <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen w-full">
      {/* Contenedor superior con tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl h-1/3">
        <div className="card flex-grow"><MachineCountCard /></div>
        <div className="card flex-grow"><AmbienteCountCard /></div>
        <div className="card flex-grow"><UserCountCard /></div>
      </div>

      {/* Contenedor inferior con gráfica y mantenimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full max-w-6xl mt-5 h-2/3">
        <div className="p-5 bg-white rounded-lg shadow-lg lg:col-span-2 h-full flex-grow">
          <BarsChart />
        </div>
        <div className="card h-full flex-grow"><ProximosMantenimientos /></div>
      </div>
    </div>
  );
}

export default Dashboard;