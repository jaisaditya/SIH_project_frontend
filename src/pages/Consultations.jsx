// frontend/src/pages/Consultations.jsx
import React, { useEffect, useState } from "react";
import { fetchConsultations } from "../services/api";
import { Link } from "react-router-dom";

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchConsultations();
        setConsultations(data);
      } catch (err) {
        console.error("❌ Error fetching consultations", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Consultations</h2>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : consultations.length === 0 ? (
        <p className="text-slate-500">No consultations found.</p>
      ) : (
        consultations.map((c) => (
          <div
            key={c._id}
            className="bg-white border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">Dr. {c.doctor.name} — {c.doctor.specialization}</p>
              <p className="text-sm text-slate-500 mt-1">Symptoms: {c.symptoms || "N/A"}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded text-white ${c.status === "accepted" ? "bg-green-600" : "bg-orange-500"}`}
              >
                {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
              </span>

              <Link to={`/consultations/${c._id}/chat`} className="text-blue-600 underline">
                Open Chat
              </Link>

              {c.status === "accepted" && (
                <Link to={`/consultations/${c._id}/video`} className="ml-2 px-3 py-1 bg-purple-600 text-white rounded">
                  Open Video
                </Link>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
