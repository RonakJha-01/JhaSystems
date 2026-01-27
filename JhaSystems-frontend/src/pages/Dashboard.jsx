import { useEffect, useState } from "react";
import { FaClipboardList } from "react-icons/fa";
import axios from "axios";
import { useDashboard } from "../context/DashboardContext";

const Dashboard = () => {
  const { totalLR, allLRs, loadLRs } = useDashboard();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadLRs(); // Load LR count + list when dashboard loads
  }, []);

  // Download LR PDF
  const handleDownload = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://jhasystems-backend.onrender.com/api/gr/${id}/pdf`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `GR_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📊 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Saved LR Box */}
        <div
          className="bg-linear-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium">Total Saved LR</div>
              <div className="text-3xl font-bold text-white mt-2">{totalLR}</div>
            </div>
            <FaClipboardList className="text-white text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Modal for showing all saved LR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Saved LR Numbers</h2>

            <div className="max-h-64 overflow-y-auto">
              {allLRs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No LR saved yet.</p>
              )}

              {allLRs.map((lr) => (
                <div
                  key={lr._id}
                  className="p-3 border-b hover:bg-gray-100 cursor-pointer flex justify-between"
                  onClick={() => handleDownload(lr._id)}
                >
                  <span>LR No: {lr.grNo}</span>
                  <span className="text-blue-600">Download</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
