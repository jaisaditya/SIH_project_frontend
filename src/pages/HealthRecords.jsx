// frontend/src/pages/HealthRecords.jsx
import React, { useEffect, useState } from "react";
import { fetchHealthRecords, fetchHealthRecordsCount } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const recs = await fetchHealthRecords();
        const cntRes = await fetchHealthRecordsCount();

        // 🔍 DEBUG: log API responses
        console.log("📦 Records API response:", recs);
        console.log("📊 Count API response:", cntRes);

        if (!mounted) return;
        //setRecords(recs || []);
        setRecords(Array.isArray(recs) ? recs : []);
        setCount(cntRes?.count ?? 0);
      } catch (err) {
        console.error("❌ Failed to load records", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // optional: poll every 10s for near-real-time updates
    const interval = setInterval(load, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* big gradient header like screenshot */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">Health Records</h1>
        <p className="mt-2 text-lg max-w-2xl">
          View and manage your medical history and health information
        </p>
      </div>

      {/* metrics + records list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Records</p>
                <p className="text-3xl font-bold mt-2">{count}</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center">
                  🗂️
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">All Health Records</h2>

            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <svg
                  className="mx-auto mb-4"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2v6h6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 11h8M8 15h8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>No records found</div>
              </div>
            ) : (
              <ul className="space-y-4">
                {records.map((r) => (
                  <li
                    key={r._id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">Diagnosis: {r.diagnosis}</p>
                      <p className="text-sm text-slate-500">
                        Prescription: {r.prescription}
                      </p>
                      <p className="text-sm text-slate-500">Notes: {r.notes}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* <button
                        onClick={() =>
                          window.open(`/records/${r._id}`, "_blank")
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                      >
                        View Details
                      </button> */}
                      <button
                        onClick={() => navigate(`/records/${r._id}`)}   // 👈 changed
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




