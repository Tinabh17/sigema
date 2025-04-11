import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? "ml-20" : "ml-60"}`}>
        <Navbar />
        <div className="p">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
