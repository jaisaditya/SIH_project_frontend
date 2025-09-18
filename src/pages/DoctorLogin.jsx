// // src/pages/DoctorLogin.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginDoctor } from "../services/api";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await loginDoctor({ email, password });

      // Save doctor token and profile separately
      localStorage.setItem("doctorToken", data.token);
      localStorage.setItem(
        "doctor",
        JSON.stringify({ _id: data._id, name: data.name, email: data.email })
      );

      navigate("/doctor/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Doctor Login</h2>

        {error && (
          <p className="text-red-600 text-sm mb-2 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/doctor/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
