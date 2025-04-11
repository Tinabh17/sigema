import React, { useState, useContext, useRef, useEffect } from "react";
import { FaRegUser } from "react-icons/fa";
import { IoChevronDownSharp } from "react-icons/io5";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="relative h-16 bg-[#008e00] text-white flex items-center justify-end px-5 transition-all duration-300 ease-in-out">
      <div ref={menuRef} className="relative">
        <button className="flex items-center gap-3 cursor-pointer focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
          <FaRegUser size={20} />
          <span>{user ? `${user.nombre} ${user.apellido}` : "Invitado"}</span>
          <IoChevronDownSharp size={16} />
        </button>

        {menuOpen && (
          <div className="absolute top-12 right-0 bg-white text-black rounded-md shadow-lg flex flex-col p-2 w-40">
            <button className="px-4 py-2 hover:bg-gray-200" onClick={() => navigate("/perfil")}>Perfil</button>
            <button className="px-4 py-2 hover:bg-gray-200" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
