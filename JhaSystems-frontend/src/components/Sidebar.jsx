import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaFileInvoice, FaUsers, FaBuilding } from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg">
      {/* Branding */}
      <div className="p-6 text-2xl font-bold border-b border-slate-700 bg-linear-to-r from-blue-600 to-indigo-600">
        Jha Systems
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <FaTachometerAlt className="text-lg" />
          Dashboard
        </NavLink>

        <NavLink
          to="/gr/create"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <FaFileInvoice className="text-lg" />
          Create GR
        </NavLink>
        
      </nav>
    </aside>
  );
};

export default Sidebar;
