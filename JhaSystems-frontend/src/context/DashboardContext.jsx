import { createContext, useContext, useState } from "react";
import axios from "axios";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [totalLR, setTotalLR] = useState(0);
  const [allLRs, setAllLRs] = useState([]);

  const loadLRs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://jhasystems-backend.onrender.com/api/gr/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAllLRs(res.data);
      setTotalLR(res.data.length);
    } catch (err) {
      console.error("Error fetching GRs:", err);
    }
  };

  return (
    <DashboardContext.Provider
      value={{ totalLR, allLRs, loadLRs }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
