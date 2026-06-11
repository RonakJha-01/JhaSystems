import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileInvoice,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: <FaTachometerAlt className="text-lg shrink-0" />,
    },
    {
      to: "/gr/create",
      label: "Create GR",
      icon: <FaFileInvoice className="text-lg shrink-0" />,
    },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm sm:text-base ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "hover:bg-slate-800 text-slate-300"
    }`;

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md">
        <div className="font-bold text-lg">Jha Systems</div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <FaBars className="text-xl" />
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen w-64 max-w-[85vw]
          bg-slate-900 text-white flex flex-col shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Branding */}
        <div className="h-14 lg:h-auto p-4 lg:p-6 text-xl lg:text-2xl font-bold border-b border-slate-700 bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
          <span className="truncate">Jha Systems</span>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-blue-700"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;