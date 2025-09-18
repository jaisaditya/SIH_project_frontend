// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api.js";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await registerUser({ full_name, email, password });
      localStorage.setItem("token", data.token);
      login(data);
      navigate("/", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow space-y-6">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
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
            Register
          </button>
        </form>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
