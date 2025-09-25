// frontend/src/components/Header.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Header({ onOpenSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="py-4 px-4 sm:px-8 bg-white border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <button
              onClick={() => {
                console.log("[Header] hamburger clicked, onOpenSidebar exists:", !!onOpenSidebar);
                if (onOpenSidebar) onOpenSidebar();
              }}
              aria-label="Open menu"
              className="p-2 rounded bg-white border shadow-sm hover:bg-gray-50"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="text-xl font-semibold">HealthSetu</div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm">Welcome, <span className="font-medium">{user?.name || "Guest"}</span></div>
          <div>
            <button onClick={logout} className="text-rose-500 hover:underline">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
}




