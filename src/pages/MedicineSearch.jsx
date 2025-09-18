// frontend/src/pages/MedicineSearch.jsx
import React, { useEffect, useState } from "react";
import { fetchMedicines } from "../services/api";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export default function MedicineSearch() {
  const [medicines, setMedicines] = useState([]);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, [filters, search]);

  useEffect(() => {
  const socket = io(SOCKET_URL, {
  path: "/socket.io",                  // default path; explicit is fine
  transports: ["polling", "websocket"],// polling first, then upgrade to websocket
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 20000,                      // connection timeout
});

socket.on("connect_error", (err) => console.error("Socket connect_error:", err));
socket.on("error", (err) => console.error("Socket error:", err));

socket.on("connect", () => {
  try {
    // socket.io v4: engine is available on socket.io
    const transport = socket.io.engine.transport.name;
    console.log("Socket connected", socket.id, "transport:", transport);
  } catch (e) {
    console.log("Socket connected", socket.id);
  }
});

  socket.on("disconnect", () => {
    setSocketConnected(false);
  });

  // unified reload handler (use same function for multiple events)
  const reloadHandler = (payload) => {
    console.log("socket reload event:", payload);
    // reload medicines using current filters/search
    loadMedicines();
  };

  // support old and new event names (backwards compatible)
  socket.on("medicines-updated", reloadHandler);
  socket.on("bill-processed", reloadHandler);
  socket.on("bill-deleted", reloadHandler);

  return () => {
    socket.off("medicines-updated", reloadHandler);
    socket.off("bill-processed", reloadHandler);
    socket.off("bill-deleted", reloadHandler);
    socket.disconnect();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // run once

  const loadMedicines = async () => {
    try {
      const { data } = await fetchMedicines({ ...filters, search });
      setMedicines(data);
    } catch (err) {
      console.error("Error fetching medicines", err);
    }
  };

  // Stats
  const availableCount = medicines.filter((m) => m.quantity > 0).length;
  const outOfStockCount = medicines.filter((m) => m.quantity === 0).length;
  const totalMedicines = medicines.length;
  const pharmacyCount = [...new Set(medicines.map((m) => m.pharmacy))].length;

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Medicine Search</h2>
        <p className="text-gray-600">Find medicines and check availability in nearby pharmacies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-500 text-white p-6 rounded-2xl shadow">
          <p className="text-3xl font-bold">{availableCount}</p>
          <p className="opacity-90">Available</p>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-2xl shadow">
          <p className="text-3xl font-bold">{outOfStockCount}</p>
          <p className="opacity-90">Out of Stock</p>
        </div>
        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow">
          <p className="text-3xl font-bold">{totalMedicines}</p>
          <p className="opacity-90">Total Medicines</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-2xl shadow">
          <p className="text-3xl font-bold">{pharmacyCount}</p>
          <p className="opacity-90">Pharmacies</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-2">🔍 Search Medicines</h2>
        <input
          type="text"
          placeholder="Search by medicine name or generic name..."
          className="w-full border rounded-lg p-3 focus:ring focus:ring-blue-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-4">
          <select
            className="border rounded-lg p-2"
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="Painkillers">Painkillers</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Diabetes">Diabetes</option>
          </select>

          <select
            className="border rounded-lg p-2"
            onChange={(e) => setFilters({ ...filters, form: e.target.value })}
          >
            <option value="">All Forms</option>
            <option value="Tablet">Tablet</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
          </select>

          <select
            className="border rounded-lg p-2"
            onChange={(e) => setFilters({ ...filters, available: e.target.value })}
          >
            <option value="">All Medicines</option>
            <option value="true">Available Only</option>
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📦 Medicine Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Antibiotics", "Painkillers", "Diabetes"].map((cat) => {
            const catMeds = medicines.filter((m) => m.category === cat);
            const available = catMeds.filter((m) => m.quantity > 0).length;
            const out = catMeds.filter((m) => m.quantity === 0).length;

            return (
              <div
                key={cat}
                className="p-6 rounded-2xl shadow cursor-pointer bg-slate-50 hover:bg-slate-100"
                onClick={() => setFilters({ ...filters, category: cat })}
              >
                <h3 className="font-bold text-lg">{cat}</h3>
                <p className="text-sm text-gray-500">{catMeds.length} medicines</p>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-green-600">{available} Available</span>
                  <span className="text-red-600">{out} Out of Stock</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Search Results ({medicines.length} medicines)</h2>
        <div className="grid gap-4">
          {medicines.map((med) => (
            <div key={med._id} className="p-4 bg-white shadow rounded-lg flex justify-between border hover:shadow-md">
              <div>
                <h3 className="font-bold text-lg">{med.name}</h3>
                <p className="text-sm text-gray-600">Generic: {med.genericName || "—"}</p>
                <p className="text-sm text-gray-600">{med.form || "—"} • {med.quantity} units • ₹{med.price ?? "-"}</p>
                <p className="text-sm text-gray-500">Expires: {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "—"}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${med.quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {med.quantity > 0 ? "Available" : "Out of Stock"}
                </span>
                <p className="text-sm mt-2">Pharmacy: {med.pharmacy}</p>
                <p className="text-sm text-gray-500">{med.location}</p>

                {/* NEW: show last updated */}
                <p className="text-xs text-gray-400 mt-2">Last updated: {med.updatedAt ? new Date(med.updatedAt).toLocaleString() : "-"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
