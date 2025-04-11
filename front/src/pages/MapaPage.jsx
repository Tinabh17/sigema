import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import mapaPlanta from "/src/assets/img/mapa_planta.jpg";

const MapaInteractivo = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-navbarHeight)] w-full">
      {/* Ajusta navbarHeight según la altura de tu navbar */}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        wheel={{ step: 0.08 }}
        doubleClick={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controles opcionales */}
            <div className="flex justify-center space-x-4 p-2 bg-white">
              <button
                onClick={() => zoomIn()}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Zoom In (+)
              </button>
              <button
                onClick={() => zoomOut()}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Zoom Out (-)
              </button>
              <button
                onClick={() => resetTransform()}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Reset
              </button>
            </div>

            {/* Contenedor del mapa */}
            <TransformComponent
              wrapperClass="w-full h-full overflow-hidden"
              contentClass="flex items-center justify-center"
            >
              <img
                src={mapaPlanta}
                alt="Mapa de planta"
                className="max-w-full max-h-full object-contain"
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MapaInteractivo;