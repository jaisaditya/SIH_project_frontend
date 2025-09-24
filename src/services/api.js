// frontend/src/services/api.js
import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

const API = axios.create({
  baseURL: "https://sih-project-backend-7l8d.onrender.com/api",
});


API.interceptors.request.use((config) => {
  const role = config.role || "user"; // 'user' | 'doctor' | 'pharmacy'
  let tokenKey = "userToken";
  if (role === "doctor") tokenKey = "doctorToken";
  if (role === "pharmacy") tokenKey = "pharmacyToken";

  const token = localStorage.getItem(tokenKey);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ========== AUTH + DOCTOR + ... (unchanged) ========== */
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);
export const googleLoginUser = (idToken) =>
  API.post("/users/auth/google", { idToken });
export const sendUserOtp = (phone) => API.post("/users/auth/send-otp", { phone });
export const verifyUserOtp = (data) => API.post("/users/auth/verify-otp", data);

/* DOCTOR */
export const registerDoctor = (payload) => API.post("/doctors/register", payload);
export const loginDoctor = (payload) => API.post("/doctors/login", payload);
export const sendDoctorOtp = (phone) => API.post("/doctors/otp/send", { phone });
export const verifyDoctorOtp = (payload) => API.post("/doctors/otp/verify", payload);
export const googleLoginDoctor = (idToken) => API.post("/doctors/google-login", { idToken });

/* DOCTORS LIST */
export const fetchDoctors = () => API.get("/doctors");

/* DOCTOR DASH */
export const fetchDoctorProfile = () => API.get("/doctors/me", { role: "doctor" });
export const fetchDoctorRequests = () => API.get("/doctors/requests", { role: "doctor" });
export const respondToRequest = (id, action) =>
  API.post(`/doctors/requests/${id}`, { action }, { role: "doctor" });

/* MEDICINES */
export const fetchMedicines = (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.search) query.append("search", filters.search);
  if (filters.category) query.append("category", filters.category);
  if (filters.form) query.append("form", filters.form);
  if (filters.available) query.append("available", filters.available);
  return API.get(`/medicines?${query.toString()}`);
};
export const createMedicine = (data) => API.post("/medicines", data);
export const updateMedicine = (id, data) => API.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => API.delete(`/medicines/${id}`);

/* PHARMACY */
export const registerPharmacy = (data) => API.post("/pharmacy-auth/register", data);
export const loginPharmacy = (data) => API.post("/pharmacy-auth/login", data);
export const fetchPharmacyProfile = () =>
  API.get("/pharmacy-auth/me", { role: "pharmacy" });

/* HEALTH RECORDS */
export const fetchHealthRecords = async () => {
  const res = await API.get("/health-records", { role: "user" });
  return res.data;
};
export const fetchHealthRecordsCount = async () => {
  const res = await API.get("/health-records/count", { role: "user" });
  return res.data;
};
export const fetchHealthRecordById = async (id) => {
  const res = await API.get(`/health-records/${id}`, { role: "user" });
  return res.data;
};

/* BILLS */
export const uploadBill = (formData) =>
  API.post("/bills/upload-bill", formData, {
    role: "pharmacy",
    headers: { "Content-Type": "multipart/form-data" },
  });
export const fetchBills = (pharmacyId) => API.get(`/bills/${pharmacyId}`, { role: "pharmacy" });

// new helper to delete a bill (consistent)
export const deleteBill = (id) =>
  API.delete(`/bills/${id}`, { role: "pharmacy" });

/* CONSULTATION (chat + video) */
export const createConsultation = (data) =>
  API.post("/consultations", data, { role: "user" });
export const fetchConsultations = () => API.get("/consultations", { role: "user" });

/* get messages: pass role='doctor' when doctor requests */
export const getMessages = (consultationId, role = "user") =>
  API.get(`/consultations/${consultationId}/messages`, { role });

/* optional: server-side route doctor can call to reserve a roomId */
export const startVideoSession = (consultationId) =>
  API.post(`/consultations/${consultationId}/start-video`, {}, { role: "doctor" });

export default API;


