// frontend/src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

function QuickAction({ colorClass, title, subtitle }) {
  return (
    <div
      className={`rounded-2xl p-6 text-white flex flex-col justify-center h-32 ${colorClass}`}
    >
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-sm opacity-90 mt-1">{subtitle}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="header-gradient rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold">Welcome back, Aditya Jaiswal!</h1>
        <p className="opacity-90 mt-2">Your health is our priority •</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-soft">
        <div className="font-semibold text-xl mb-6">Quick Actions</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <Link to="/book-consultation">
          <QuickAction
            colorClass="bg-blue-600 cursor-pointer hover:bg-blue-700 transition"
            title="Book Consultation"
            subtitle="Schedule appointment with doctor"
          />
        </Link>

          <Link to="/medicines">
          <QuickAction
            colorClass="bg-green-500 cursor-pointer hover:bg-green-600 transition"
            title="Find Medicines"
            subtitle="Check medicine availability"
          />
        </Link>

          <Link to="/health-records">
          <QuickAction
            colorClass="bg-purple-600 cursor-pointer hover:bg-purple-700 transition"
            title="Health Records"
            subtitle="View your medical history"
          />
        </Link>

          <QuickAction
            colorClass="bg-red-500"
            title="Emergency Help"
            subtitle="24/7 emergency assistance"
          />
        </div>
      </div>

      {/* Upcoming Consultations + Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Consultations */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Upcoming Consultations</h2>
          <div className="mt-8 p-12 border-dashed rounded text-center text-slate-400">
            <div className="text-6xl">📅</div>
            <div className="mt-4">No upcoming consultations scheduled</div>
            
            <Link
                  to="/book-consultation"
                  className="mt-6 inline-block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Book Consultation
                </Link>

          </div>
        </div>

        {/* Profile Overview */}
        <div className="bg-white rounded-lg p-6 shadow-soft">
          <h3 className="font-semibold text-lg">Profile Overview</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-green-400 text-white flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <div className="font-medium">Aditya Jaiswal</div>
              <div className="text-sm text-slate-500">Healthcare User</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Health Records + Health Summary + Emergency Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Health Records */}
        <section className="bg-white rounded-lg p-6 shadow-soft flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold mb-4">Recent Health Records</h2>
          <span className="text-5xl text-gray-400">📄</span>
          <p className="mt-3 text-gray-600">No health records available</p>
          <p className="text-sm text-gray-400">
            Your consultation records and prescriptions will appear here
          </p>
        </section>

        {/* Health Summary */}
        <section className="bg-white rounded-lg p-6 shadow-soft flex flex-col justify-center text-center">
          <h2 className="text-xl font-semibold mb-4">❤️ Health Summary</h2>
          <p className="text-gray-600">
            Complete your health profile for better care
          </p>
        </section>

        {/* Emergency Services */}
        <section className="bg-white rounded-lg p-6 shadow-soft flex flex-col justify-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            📞 Emergency Services
          </h2>
          <ul className="space-y-1 text-gray-700 text-center">
            <li>
              🚑 Ambulance: <span className="font-semibold">108</span>
            </li>
            <li>
              📞 Health Helpline: <span className="font-semibold">104</span>
            </li>
            <li>
              👮 Police: <span className="font-semibold">100</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Daily Health Tip */}
      <section className="bg-green-50 border border-green-200 shadow-soft rounded-xl p-6">
        <h2 className="text-lg font-semibold text-green-700 mb-2">
          Daily Health Tip
        </h2>
        <p className="text-gray-700">
          Drink at least 8 glasses of water daily and include fresh fruits and
          vegetables in your diet. Regular exercise and proper sleep are
          essential for good health.
        </p>
      </section>
    </div>
  );
}

