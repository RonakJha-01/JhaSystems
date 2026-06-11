import { useEffect, useState } from "react";
import { FaClipboardList } from "react-icons/fa";
import axios from "axios";
import { useDashboard } from "../context/DashboardContext";

const Dashboard = () => {
  const { totalLR, allLRs, loadLRs } = useDashboard();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadLRs();
  }, []);

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
    <div className="w-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">
        📊 Dashboard
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          onClick={() => setShowModal(true)}
          className="bg-linear-to-r from-blue-500 to-blue-600 p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium">
                Total Saved LR
              </div>

              <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
                {totalLR}
              </div>
            </div>

            <FaClipboardList className="text-white text-3xl sm:text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Saved LR Numbers
            </h2>

            <div className="max-h-[60vh] overflow-y-auto">
              {allLRs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No LR saved yet.
                </p>
              ) : (
                allLRs.map((lr) => (
                  <div
                    key={lr._id}
                    onClick={() => handleDownload(lr._id)}
                    className="p-3 border-b hover:bg-gray-100 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                  >
                    <span className="font-medium break-all">
                      LR No: {lr.grNo}
                    </span>

                    <span className="text-blue-600 text-sm font-medium">
                      Download
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg transition"
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