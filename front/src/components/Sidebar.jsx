import { FaUsers, FaMapMarkerAlt, FaTools, FaMapMarkedAlt } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { LuFolderCog } from "react-icons/lu";
import { GrVmMaintenance } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
import logoSena from "../assets/img/logo_Sena2.png";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Importar el contexto de autenticación

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth(); // Obtener usuario autenticado y su rol

  const linkClass = ({ isActive }) =>
    `flex items-center p-2 rounded-md transition-colors duration-200 hover:bg-white/20 ${isActive ? "bg-white/20" : ""}`;

  return (
    <div className={`fixed top-0 left-0 h-full bg-[#00af00] text-white transition-all duration-300 ease-in-out flex flex-col z-10 ${isCollapsed ? "w-20" : "w-60"}`}>
      
      {/* Logo y Título */}
      <div className="flex items-center py-4 px-2 border-b border-white overflow-hidden">
        <img src={logoSena} alt="Logo SENA" className="w-16 h-16" />
        {!isCollapsed && <h2 className="ml-3 text-xl font-bold overflow-hidden whitespace-nowrap">SIGEMA</h2>}
      </div>

      {/* Botón de menú */}
      <div className={`border-b border-white flex items-center ${isCollapsed ? "justify-center" : "justify-end"} px-3`}>
        <button className="p-2" onClick={() => setIsCollapsed(!isCollapsed)} aria-label="Toggle Sidebar" aria-expanded={!isCollapsed}>
          <IoMdMenu size={30} className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-grow p-3 flex flex-col">
        <ul className="space-y-2">
          {/* Mostrar enlaces según el rol del usuario */}
          {user?.rol !== 5 && ( // Mostrar el menú completo solo si el rol no es 5
            <>
                            <li>
                <NavLink to="/dashboard" className={linkClass}>
                  <div className="w-12 flex items-center justify-center">
                    <MdDashboard size={30} />
                  </div>
                  {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Dashboard</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/usuarios" className={linkClass}>
                  <div className="w-12 flex items-center justify-center">
                    <FaUsers size={30} />
                  </div>
                  {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Gestión de Usuarios</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/maquinaria" className={linkClass}>
                  <div className="w-12 flex items-center justify-center">
                    <LuFolderCog size={30} />
                  </div>
                  {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Lista de máquinas</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/mantenimiento/maquina" className={linkClass}>
                  <div className="w-12 flex items-center justify-center">
                    <FaTools size={30} />
                  </div>
                  {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Mantenimiento Maquinas</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/mantenimiento/ambiente" className={linkClass}>
                  <div className="w-12 flex items-center justify-center">
                    <GrVmMaintenance size={35} />
                  </div>
                  {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Mantenimiento Ambientes</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/mapa" className={linkClass}>
                  <div className="w-12 flex items-center justify-center">
                    <FaMapMarkedAlt size={30} />
                  </div>
                  {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Mapa</span>}
                </NavLink>
              </li>
            </>
          )}

          {/* Enlace accesible para todos, incluidos los usuarios con rol 5 */}
          <li>
            <NavLink to="/ambientes" className={linkClass}>
              <div className="w-12 flex items-center justify-center">
                <FaMapMarkerAlt size={30} />
              </div>
              {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Ambientes</span>}
            </NavLink>
          </li>

          {user?.role !== 5 && ( // Condicional para evitar que el rol 5 vea estas opciones
            <>

            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
