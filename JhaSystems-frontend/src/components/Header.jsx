import { useAuth } from "../auth/AuthContext";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b shadow-sm px-4 sm:px-6 py-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 lg:gap-4">
        
        {/* Branding */}
        <div className="font-bold text-base sm:text-lg lg:text-xl text-blue-700 tracking-wide text-center lg:text-left">
          Transport Management System
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:justify-end gap-3 lg:gap-4">
          
          {/* User Badge */}
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-gray-700 text-xs sm:text-sm min-w-0">
            <FaUserCircle className="text-blue-600 text-lg shrink-0" />

            <span className="truncate">
              {user?.orgCode} | {user?.username}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-full transition shrink-0"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;