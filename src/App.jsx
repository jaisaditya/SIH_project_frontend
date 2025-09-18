// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookConsultation from './pages/BookConsultation';
import MedicineSearch from "./pages/MedicineSearch";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorDashboard from "./pages/DoctorDashboard";
import HealthRecords from "./pages/HealthRecords";
import RecordDetails from "./pages/RecordDetails";
import PharmacyLogin from "./pages/PharmacyLogin";
import PharmacyRegister from "./pages/PharmacyRegister";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import Consultations from "./pages/Consultations";
import ConsultationChat from "./pages/ConsultationChat";
import DoctorConsultationChat from "./pages/DoctorConsultationChat";
import ConsultationVideo from "./pages/ConsultationVideo";
import DoctorConsultationVideo from "./pages/DoctorConsultationVideo";
import ChatAssistant from './pages/ChatAssistant';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/register" element={<DoctorRegister />} />
          <Route path="/pharmacy-login" element={<PharmacyLogin />} />
          <Route path="/pharmacy-register" element={<PharmacyRegister />} />

          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="book-consultation" element={<BookConsultation />} />
            <Route path="medicines" element={<MedicineSearch />} />
            <Route path="health-records" element={<HealthRecords />} />
            <Route path="records/:id" element={<RecordDetails />} />
            <Route path="pharmacy-dashboard" element={<PharmacyDashboard />} />
            <Route path="consultations/:id/chat" element={<ConsultationChat />} />
            <Route path="consultations/:id/video" element={<ConsultationVideo />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/consultations/:id/chat" element={<DoctorConsultationChat />} />
            <Route path="/doctor/consultations/:id/video" element={<DoctorConsultationVideo />} />
            <Route path="/ai" element={<ChatAssistant />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


