// frontend/src/pages/PharmacyLogin.jsx
import React, { useState } from "react";
import { loginPharmacy } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function PharmacyLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

 try {
  const res = await loginPharmacy(form);
  if (res.data && res.data.token) {
       const pharmacyData = {
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
    };
    localStorage.setItem("pharmacyToken", res.data.token);
    localStorage.setItem("pharmacy", JSON.stringify(pharmacyData));
    navigate("/pharmacy-dashboard");
  } else {
    setError(res.data?.message || "Login failed");
  }
} catch (err) {
  console.error("Login error:", err);
  setError(err.response?.data?.message || "Login failed");
}
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Pharmacy Login</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-400 bg-gray-50"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-400 bg-gray-50"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/pharmacy-register" className="text-green-600 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
