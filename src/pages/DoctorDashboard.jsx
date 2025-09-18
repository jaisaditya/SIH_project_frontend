// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchDoctorProfile,
  fetchDoctorRequests,
  respondToRequest,
} from "../services/api";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const navigate = useNavigate();

  // Load doctor profile + requests
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchDoctorProfile();
        setDoctor(data);
      } catch (err) {
        console.error("Error fetching doctor profile", err);
        if (err.response?.status === 401) {
          navigate("/doctor/login");
        }
      } finally {
        setLoadingProfile(false);
      }

      try {
        const { data } = await fetchDoctorRequests();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching requests", err);
      } finally {
        setLoadingRequests(false);
      }
    };
    load();
  }, [navigate]);

  // Accept / Reject consultation
  const handleRespond = async (id, action) => {
    setActionLoading(id);
    try {
      await respondToRequest(id, action);
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: action === "accept" ? "accepted" : "declined" } : r
        )
      );
    } catch (err) {
      console.error("Respond failed", err);
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Chat & Video navigation
  const startChat = (req) => navigate(`/doctor/consultations/${req._id}/chat`);
  const startVideo = (req) => navigate(`/doctor/consultations/${req._id}/video`);

  // Logout (optional - you also have a logout button in the Header)
  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    navigate("/doctor/login");
  };

  if (loadingProfile) return <div className="p-6">Loading...</div>;

  return (
    // This renders _only_ the main content area. Sidebar/header are provided by Layout.
    <div className="space-y-6">
      {/* Gradient Header with optional Logout (Header already has logout; you can remove this if redundant) */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-2xl shadow-md p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <p className="mt-2 text-lg">Manage your profile and consultation requests</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Logout
        </button>
      </div>

      {/* Doctor Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h2 className="text-xl font-semibold">Welcome, Dr. {doctor?.name}</h2>
        <p className="text-slate-600 mt-1">
          {doctor?.specialization} • {doctor?.hospital}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          {doctor?.experience} years experience • {doctor?.phone}
        </p>
      </div>

      {/* Requests Section */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Consultation Requests</h2>

        {loadingRequests ? (
          <p className="text-slate-500">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-slate-500">No requests yet.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((r) => (
              <li
                key={r._id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                {/* Patient Info */}
                <div>
                  <p className="font-medium">{r.patientName}</p>
                  <p className="text-sm text-slate-500">{r.symptoms}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(r._id, "accept")}
                      disabled={actionLoading === r._id || r.status !== "pending"}
                      className={`px-3 py-1 rounded text-white ${
                        r.status === "accepted"
                          ? "bg-green-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {r.status === "accepted" ? "Accepted" : "Accept"}
                    </button>
                    <button
                      onClick={() => handleRespond(r._id, "decline")}
                      disabled={actionLoading === r._id || r.status !== "pending"}
                      className={`px-3 py-1 rounded ${
                        r.status === "declined"
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {r.status === "declined" ? "Declined" : "Reject"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startChat(r)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => startVideo(r)}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Video
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

