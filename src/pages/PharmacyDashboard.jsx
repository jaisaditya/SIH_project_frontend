// frontend/src/pages/PharmacyDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPharmacyProfile, fetchBills, uploadBill, deleteBill } from "../services/api";
import { io } from "socket.io-client";

// const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_API_URL || "https://sih-project-backend-7l8d.onrender.com";

export default function PharmacyDashboard() {
  const [pharmacy, setPharmacy] = useState(null);
  const [bills, setBills] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("pharmacyToken");
    if (!token) {
      navigate("/pharmacy-login");
      return;
    }

    const loadData = async () => {
      try {
        const { data } = await fetchPharmacyProfile(); // role handled in service
        setPharmacy(data);

        const billsRes = await fetchBills(data._id);
        setBills(billsRes.data);
      } catch (err) {
        console.error("Failed to load pharmacy dashboard", err);
        navigate("/pharmacy-login");
      }
    };

    loadData();
  }, [navigate]);

      // socket setup (after pharmacy loaded)
      useEffect(() => {
        if (!pharmacy) return;

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

    // unified handler for reload events
    const onBillChange = (payload) => {
      // Only reload if event matches our pharmacy or if payload is missing pharmacyId
      try {
        if (payload && payload.pharmacyId && payload.pharmacyId.toString() !== pharmacy._id.toString()) {
          return;
        }
      } catch (e) {
        // ignore, fallback to reload
      }

      // re-fetch current bills
      fetchBills(pharmacy._id)
        .then((res) => setBills(res.data))
        .catch((err) => console.error("Failed to refresh bills", err));
    };

    // Listen to all relevant events (backward compatible)
    socket.on("bill-processed", onBillChange);
    socket.on("bill-deleted", onBillChange);
    socket.on("medicines-updated", onBillChange); // keep older name supported

    return () => {
      // remove handlers explicitly then disconnect
      socket.off("bill-processed", onBillChange);
      socket.off("bill-deleted", onBillChange);
      socket.off("medicines-updated", onBillChange);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [pharmacy]);

  const handleLogout = () => {
    localStorage.removeItem("pharmacyToken");
    localStorage.removeItem("pharmacy");
    navigate("/");
  };

  const handleUpload = async () => {
    if (!file || !pharmacy) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // token will identify pharmacy on server; pharmacyId is optional
      formData.append("pharmacyId", pharmacy._id);

      // use service helper - it returns axios response
      const { data: returnedBill } = await uploadBill(formData);

      // Keep UI consistent: push returned bill onto top
      setBills((prev) => [returnedBill, ...prev]);
      setFile(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Upload failed";
      alert("Upload failed: " + msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBill(id); // api helper throws if fails
      // optimistic UI: remove locally
      setBills((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Delete failed";
      alert("Delete failed: " + msg);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "Processing":
        return "text-blue-600";
      case "Uploaded":
        return "text-gray-600";
      case "Error":
        return "text-red-600";
      default:
        return "";
    }
  };

  if (!pharmacy) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {pharmacy.name}!</h1>
          <p className="text-sm">{pharmacy.address} • {pharmacy.phone}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">🚪 Logout</button>
      </header>

      <main className="flex-1 p-8 space-y-6 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-blue-100 p-4 rounded-lg shadow hover:shadow-md cursor-pointer text-center">
            <p className="font-bold text-blue-800">📄 Upload Bill</p>
            <p className="text-sm text-gray-600">Submit patient bills</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow hover:shadow-md cursor-pointer text-center">
            <p className="font-bold text-green-800">📋 Medicines</p>
            <p className="text-sm text-gray-600">Manage stock</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-3">📤 Upload New Bill</h2>
          <div className="flex items-center gap-4">
            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setFile(e.target.files[0])} className="border p-2 rounded" />
            <button
              onClick={handleUpload}
              className={`px-4 py-2 rounded ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Supports PNG/JPG (PDF supported as file but OCR is image-only — first page will be processed if converted server-side)</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">📋 Uploaded Bills</h2>
          {bills.length === 0 ? (
            <p className="text-gray-500">No bills uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div key={bill._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">📄 {bill.fileName || bill.originalName}</p>
                    <p className="text-xs text-gray-500">{new Date(bill.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${statusColor(bill.status)}`}>{bill.status}</span>
                    <a href={`${SOCKET_URL.replace(/\/$/,'')}${bill.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
                    <button onClick={() => handleDelete(bill._id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
