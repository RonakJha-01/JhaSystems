import { useAuth } from "../auth/AuthContext";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b shadow-sm px-4 sm:px-6 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        {/* Branding */}
        <div className="font-bold text-base sm:text-lg md:text-xl text-blue-700 tracking-wide text-center sm:text-left">
          Transport Management System
        </div>

        {/* User Info + Logout */}
        <div className="flex flex-col xs:flex-row sm:flex-row items-center gap-2 sm:gap-4">
          
          {/* User Badge */}
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-gray-700 text-xs sm:text-sm max-w-full">
            <FaUserCircle className="text-blue-600 text-lg shrink-0" />
            <span className="truncate max-w-45 sm:max-w-none">
              {user?.orgCode} | {user?.username}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-full transition"
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