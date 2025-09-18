// frontend/src/components/Layout.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // lock body scroll while mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // debug log so you can observe clicks
  useEffect(() => {
    if (sidebarOpen) console.log("[Layout] onOpenSidebar called -> open");
    else console.log("[Layout] sidebar closed");
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop fixed sidebar (md+) */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-72 z-40">
        <Sidebar />
      </div>

      {/* Mobile slide-over: backdrop + panel */}
      {/* Note: pointer-events present only when open so the page behind is not clickable */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!sidebarOpen}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => {
            console.log("[Layout] backdrop clicked -> close");
            setSidebarOpen(false);
          }}
        />

        {/* Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-green-400 text-white flex items-center justify-center font-bold">
                NH
              </div>
              <div className="font-semibold">Nabha Health</div>
            </div>
            <button
              aria-label="Close menu"
              onClick={() => {
                console.log("[Layout] close button clicked -> close");
                setSidebarOpen(false);
              }}
              className="p-1 rounded hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          {/* Sidebar content: pass onNavigate so the Sidebar can close the menu on any link click */}
          <div className="h-[calc(100vh-64px)] overflow-auto">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </aside>
      </div>

      {/* Page content — padding left on md+ to account for fixed sidebar */}
      <div className="md:pl-72">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-64px)] overflow-y-auto p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
