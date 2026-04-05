import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    orgCode: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Auto-fill guest credentials
  const fillGuestCredentials = () => {
    setForm({
      orgCode: "JHA001",
      username: "admin",
      password: "123456",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Set timeout to prevent hanging requests (15 seconds max)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await api.post("/auth/login", form, {
        signal: controller.signal,
        // Add timeout to axios config
        timeout: 10000,
      });

      clearTimeout(timeoutId);

      login(
        {
          orgCode: res.data.orgCode,
          username: res.data.username,
        },
        res.data.token
      );

      navigate("/");
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.code === "ECONNABORTED" || err.name === "AbortError") {
        setError("Request timeout. Please check your connection and try again.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Transport Billing Login
            </h2>
            <p className="text-blue-100 text-sm text-center mt-1">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="p-8">
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-3">
              <input
                name="orgCode"
                placeholder="Organization ID"
                value={form.orgCode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
                required
              />
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-2.5 rounded-lg font-semibold transition flex items-center justify-center
                ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} 
                text-white shadow-md`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              © {new Date().getFullYear()} Transport Billing Software
            </p>
          </div>
        </form>

        {/* Guest Credentials Table */}
        <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-green-600 to-teal-600 px-6 py-3">
            <h3 className="text-white font-semibold text-center flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Guest Access
            </h3>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 text-sm text-center mb-4">
              Use the following credentials to login as a guest:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Field</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3 rounded-r-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Organization ID</td>
                    <td className="px-4 py-3 font-mono text-sm">JHA001</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setForm({ ...form, orgCode: "JHA001" })}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Username</td>
                    <td className="px-4 py-3 font-mono text-sm">admin</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setForm({ ...form, username: "admin" })}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Password</td>
                    <td className="px-4 py-3 font-mono text-sm">123456</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setForm({ ...form, password: "123456" })}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <button
              onClick={fillGuestCredentials}
              className="w-full mt-4 py-2 bg-linear-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Auto-fill Guest Credentials
            </button>
          </div>
        </div>

        {/* Performance Tip */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            ⚡ For faster login, ensure stable internet connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;