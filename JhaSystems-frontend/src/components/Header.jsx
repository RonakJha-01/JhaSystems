import { useAuth } from "../auth/AuthContext";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
      {/* Branding */}
      <div className="font-bold text-lg text-blue-700 tracking-wide">
        Transport Management System
      </div>

      {/* User Info + Logout */}
      <div className="flex items-center gap-6">
        {/* User Badge */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-sm">
          <FaUserCircle className="text-blue-600 text-lg" />
          <span>
            {user?.orgCode} | {user?.username}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-full transition"
        >
          <FaSignOutAlt className="text-sm" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
