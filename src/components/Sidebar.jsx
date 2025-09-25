// frontend/src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link , NavLink} from "react-router-dom";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

export default function Sidebar({ onNavigate }) {
  const [language, setLanguage] = useState("English");

  const handleClick = (label) => {
    // debug log for link clicks
    console.log("[Sidebar] link clicked:", label);
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="w-72 bg-white h-full border-r flex flex-col justify-between">
      <div className="p-6 flex flex-col">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center text-white font-bold">
            NH
          </div>
          <div>
            <h3 className="text-lg font-bold">HealthSetu</h3>
            <p className="text-sm text-slate-500">Healthcare for Rural Punjab</p>
          </div>
        </div>

        <nav className="mt-10 space-y-3">
          <Link onClick={() => handleClick("Dashboard")} to="/" className="block px-3 py-2 rounded hover:bg-slate-100">
            Dashboard
          </Link>

          <Link onClick={() => handleClick("Doctor")} to="/doctor/login" className="block px-3 py-2 rounded hover:bg-slate-100">
            Doctor
          </Link>

          <Link onClick={() => handleClick("Pharmacies")} to="/pharmacy-login" className="block px-3 py-2 rounded hover:bg-slate-100">
            Pharmacies
          </Link>

          <Link onClick={() => handleClick("Patients")} to="/patients" className="block px-3 py-2 rounded hover:bg-slate-100">
            Patients
          </Link>

         <NavLink className="block px-3 py-2 rounded hover:bg-slate-100" to={'/ai'}>AI Assistance</NavLink>
         
        </nav>

        <div className="mt-12">
          <p className="text-xs font-semibold text-slate-500 px-3">SETTINGS</p>
          <div className="flex items-center gap-2 px-3 mt-3">
            <GlobeAltIcon className="w-5 h-5 text-slate-600" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option>English</option>
              <option>हिंदी</option>
              <option>ਪੰਜਾਬੀ</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="px-3 py-2 rounded bg-rose-50 text-rose-600 flex items-center gap-2 text-sm font-medium">
            <span>🚑</span> Emergency: 102
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">A</div>
          <div>
            <div className="font-semibold">Aditya Jaiswal</div>
            <div className="text-xs text-slate-400">Healthcare User</div>
          </div>
        </div>
      </div>
    </aside>
  );
}



