// frontend/src/pages/DoctorRegister.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerDoctor } from "../services/api";

export default function DoctorRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    phone: "",
    hospital: "",
    experience: "",
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await registerDoctor(form);
      alert("Doctor registered successfully!");
      navigate("/doctor/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Doctor Register</h2>

        {error && (
          <p className="text-red-600 text-sm mb-2 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <input name="specialization" placeholder="Specialization" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
          <input name="hospital" placeholder="Hospital/Clinic" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
          <input name="experience" type="number" placeholder="Experience (years)" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />

          <button className="w-full bg-green-600 text-white py-2 rounded-lg">
            Register
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/doctor/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
