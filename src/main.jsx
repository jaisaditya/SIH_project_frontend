// frontent/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      // new
      // main.jsx (temporary debug lines)
console.log("[Google OAuth] clientId:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log("[Google OAuth] clientId length:", (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").length);

      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

