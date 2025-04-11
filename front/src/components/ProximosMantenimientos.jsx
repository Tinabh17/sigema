import { useEffect, useState } from "react";
import { useMantenimientosMaquinas } from "../context/MantenimientosMaquinasContext.jsx";
import { useMaquinas } from "../context/MaquinasContext.jsx";

const ProximosMantenimientos = () => {
  const { mantenimientos_maquinas } = useMantenimientosMaquinas();
  const { maquinas } = useMaquinas();
  const [proximos, setProximos] = useState([]);
  const [showAll, setShowAll] = useState(false); // Estado para mostrar u ocultar la lista

  useEffect(() => {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 7); // Filtrar mantenimientos en los próximos 7 días

    const mantenimientos_maquinasFiltrados = mantenimientos_maquinas.filter((mantenimiento_maquina) => {
      const fechaMantenimiento = new Date(mantenimiento_maquina.fecha_programada);
      return fechaMantenimiento >= hoy && fechaMantenimiento <= limite;
    });

    // Ordenar mantenimientos por fecha
    const sortedMantenimientosMaquinas = mantenimientos_maquinasFiltrados.sort(
      (a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada)
    );

    setProximos(sortedMantenimientosMaquinas);
  }, [mantenimientos_maquinas]);

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-300">
      <h2 className="text-xl font-bold text-gray-900">Próximos Mantenimientos</h2>

      {proximos.length === 0 ? (
        <p className="text-gray-600">No hay mantenimientos programados en los próximos 7 días.</p>
      ) : (
        <>
          {/* Mostrar el mantenimiento más próximo */}
          <div className="p-2 border-b">
            <strong className="text-gray-800">{maquinas.find(m => m.id_maquina === proximos[0].id_maquina)?.serie || "Máquina desconocida"}</strong>
            <p className="text-gray-600">Fecha: {proximos[0].fecha_programada}</p>
            <p className="text-gray-600">Descripción: {proximos[0].descripcion}</p>
          </div>

          {/* Botón para expandir la lista */}
          {proximos.length > 1 && (
            <>
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md w-full"
              >
                {showAll ? "Ocultar" : "Ver más"}
              </button>

              {/* Lista desplegable de los demás mantenimientos */}
              {showAll && (
                <ul className="mt-2">
                  {proximos.slice(1).map((mantenimiento_maquina) => {
                    const maquina = maquinas.find(m => m.id_maquina === mantenimiento_maquina.id_maquina);
                    return (
                      <li key={mantenimiento_maquina.id_mantenimiento} className="p-2 border-b">
                        <strong className="text-gray-800">{maquina ? maquina.serie : "Máquina desconocida"}</strong>
                        <p className="text-gray-600">Fecha: {mantenimiento_maquina.fecha_programada}</p>
                        <p className="text-gray-600">Descripción: {mantenimiento_maquina.descripcion}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProximosMantenimientos;