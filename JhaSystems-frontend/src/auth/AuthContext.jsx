import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

let inMemoryToken = null; // 🔥 IMPORTANT

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Restore session on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      inMemoryToken = storedToken;
      api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    // Clear previous session completely
    inMemoryToken = token;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // 🔥 THIS is what decides identity
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    setUser(userData);
  };

  const logout = () => {
    inMemoryToken = null;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete api.defaults.headers.common.Authorization;

    setUser(null);

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
