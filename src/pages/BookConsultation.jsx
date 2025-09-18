// src/pages/BookConsultation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchDoctors } from "../services/api"; // <-- ensure this exists
import { createConsultation } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BookConsultation() {
  const [doctors, setDoctors] = useState([]); // fetched from backend
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All Specializations");
  const navigate = useNavigate();

  // consultations state -> counts update when booking
  const [consultations, setConsultations] = useState({
    upcoming: [],
    completed: [],
    active: [],
  });

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();


  // --- Fetch doctors from backend on mount ---
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await fetchDoctors(); // expects array of doctor documents
        if (!mounted) return;

        // normalize shape so UI code below doesn't need to change:
        // target fields used in UI: id, name, specialization, experience_years, qualification, consultation_fee
        const normalized = (data || []).map((d) => {
          // pick common field names from your DB docs (fallbacks included)
          const id = d._id ?? d.id ?? String(Math.random());
          const name = d.name ?? d.fullName ?? "Unnamed Doctor";
          const specialization =
            d.specialization ?? d.speciality ?? d.department ?? "General Medicine";
          const experience_years =
            d.experience_years ?? d.experience ?? d.years ?? d.experienceYears ?? 0;
          const qualification =
            d.qualification ?? d.qualifications ?? d.degree ?? "";
          const consultation_fee =
            d.consultation_fee ?? d.consultationFee ?? d.fee ?? 0;
          const phone = d.phone ?? d.contact ?? "";
          const hospital = d.hospital ?? d.clinic ?? "";
          return {
            id,
            _id: d._id,
            name,
            specialization,
            experience_years,
            qualification,
            consultation_fee,
            phone,
            hospital,
            raw: d,
          };
        });

        setDoctors(normalized);
      } catch (err) {
        console.error("Error fetching doctors", err);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // derived specializations list
  const specializations = useMemo(() => {
    const s = ["All Specializations", ...new Set(doctors.map((d) => d.specialization || "General"))];
    return s;
  }, [doctors]);

  // filtered doctors based on search + specialization
  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchName = !q || (d.name && d.name.toLowerCase().includes(q));
      const matchSpec = specialization === "All Specializations" || d.specialization === specialization;
      return matchName && matchSpec;
    });
  }, [doctors, search, specialization]);

 const handleBook = async (doctor) => {
    try {
      // Create consultation with the selected doctor (user must be logged in)
      const { data: newConsult } = await createConsultation({
        doctorId: doctor.id,
        symptoms: "",               // or prompt user for symptoms if desired
        appointment_date: null,
        appointment_time: null,
      });
      console.log("✅ Booked new consultation:", newConsult);
      setConsultations((prev) => ({
        ...prev,
        upcoming: [newConsult, ...prev.upcoming],
      }));
    } catch (err) {
      console.error("❌ Error booking consultation", err);
      alert(err.response?.data?.message || "Failed to book consultation");
    }
  };

  return (
    <div className="space-y-8">
      {/* gradient header */}
      <div className="rounded-2xl p-8 text-white" style={{ background: "linear-gradient(90deg,#1e90ff,#06b6d4)" }}>
        <h1 className="text-3xl md:text-4xl font-extrabold">Consultations</h1>
        <p className="opacity-90 mt-2 text-slate-100">Book appointments and manage your healthcare consultations</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white p-5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Upcoming</div>
              <div className="text-2xl font-bold mt-2">{consultations.upcoming.length}</div>
            </div>
            <div className="text-3xl opacity-30">📅</div>
          </div>
        </div>

        <div className="bg-green-600 text-white p-5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Completed</div>
              <div className="text-2xl font-bold mt-2">{consultations.completed.length}</div>
            </div>
            <div className="text-3xl opacity-30">🎥</div>
          </div>
        </div>

        <div className="bg-purple-600 text-white p-5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Active Now</div>
              <div className="text-2xl font-bold mt-2">{consultations.active.length}</div>
            </div>
            <div className="text-3xl opacity-30">📞</div>
          </div>
        </div>

        <div className="bg-orange-500 text-white p-5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Doctors</div>
              <div className="text-2xl font-bold mt-2">{doctors.length}</div>
            </div>
            <div className="text-3xl opacity-30">🔎</div>
          </div>
        </div>
      </div>

      {/* Book new + Tabs row */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <button
          onClick={() => window.scrollTo({ top: 9999, behavior: "smooth" })}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow-md"
        >
          + Book New
        </button>

         {/* NEW BUTTON */}
      <button
        onClick={() => navigate("/consultations")}
        className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-200 flex items-center gap-2"
      >
        📋 View My Consultations
      </button>


        {/* tabs (right) */}
        <div className="ml-auto flex gap-4 items-center bg-white rounded-full p-2 shadow-sm">
          <button className="px-4 py-2 rounded-full text-sm">🎥 Active</button>
          <button className="px-4 py-2 rounded-full text-sm">📅 Upcoming</button>
          <button className="px-4 py-2 rounded-full text-sm">🕒 History</button>
        </div>
      </div>

      {/* Search & filter card */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Find and Book a Doctor</h2>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* search input */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {/* inline svg fallback if heroicons not installed */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
              </svg>
            </span>
            <input
              placeholder="Search by doctor's name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* specialization dropdown */}
          <div className="w-64">
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              {specializations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* doctors grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Keep UI structure; minimal loading view
            <div className="col-span-full p-6 text-slate-500">Loading doctors...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="col-span-full p-6 text-slate-500">No doctors found.</div>
          ) : (
            filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-100 rounded-lg shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-blue-600">🩺</div>
                    <div>
                      <h3 className="font-semibold text-lg">{doc.name}</h3>
                      <div className="text-blue-600">{doc.specialization}</div>
                    </div>
                  </div>

                  <ul className="mt-4 text-sm text-slate-500 space-y-2">
                    <li>🏅 {doc.experience_years} years experience</li>
                    <li>🎓 {doc.qualification}</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleBook(doc)}
                    className="w-full bg-blue-600 text-white py-2 rounded-md shadow"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming summary card (below doctors) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Upcoming Consultations</h3>
          {consultations.upcoming.length === 0 ? (
            <div className="mt-6 p-12 border-dashed border-slate-200 rounded text-center text-slate-400">
              <div className="text-4xl">📅</div>
              <div className="mt-2">No upcoming consultations scheduled</div>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
             {consultations.upcoming.map((c) => (
                <li key={c._id} className="p-3 border rounded flex justify-between items-center">
                  <span>
                    Dr. {c.doctor?.name} — {c.doctor?.specialization}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded text-white ${
                      c.status === "accepted" ? "bg-green-600" : "bg-orange-500"
                    }`}
                  >
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Profile Overview</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-green-400 text-white flex items-center justify-center font-bold">A</div>
            <div>
              <div className="font-medium">{user?.name || "Guest User"}</div>
               <div className="text-sm text-slate-500">Healthcare User</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
