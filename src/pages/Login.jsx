// frontend/src/pages/Login.jsx
import { GoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  loginUser,
  googleLoginUser,
  sendUserOtp,
  verifyUserOtp,
} from "../services/api.js";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Email/password login
  async function handleEmailLogin(e) {
    e.preventDefault();
    try {
      const { data } = await loginUser({ email, password });

      // Save in localStorage
      localStorage.setItem("userToken", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ _id: data._id, name: data.name, email: data.email })
      );

      // Save in context
      login({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || "patient",
        token: data.token,
      });

      navigate("/", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  }

  // Send OTP
  async function handleSendOtp() {
    try {
      await sendUserOtp(phone);
      setOtpSent(true);
      alert("OTP sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  }

  // Verify OTP
  async function handleVerifyOtp() {
    try {
      const { data } = await verifyUserOtp({ phone, code: otp });

      localStorage.setItem("userToken", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ _id: data._id, name: data.name, email: data.email })
      );

      login({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || "patient",
        token: data.token,
      });

      navigate("/", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  }

  // Google login
  async function handleGoogleLogin(idToken) {
    try {
      const { data } = await googleLoginUser(idToken);

      localStorage.setItem("userToken", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ _id: data._id, name: data.name, email: data.email })
      );

      login({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || "patient",
        token: data.token,
      });

      navigate("/", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Google login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow space-y-6">
        <h2 className="text-2xl font-bold text-center">User Login</h2>

        {/* Email/Password login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
            Login with Email
          </button>
        </form>

        {/* OTP Login */}
        <div className="space-y-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="text"
            placeholder="Mobile number"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              className="w-full bg-green-600 text-white py-2 rounded-lg"
            >
              Send OTP
            </button>
          ) : (
            <>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleVerifyOtp}
                className="w-full bg-green-600 text-white py-2 rounded-lg"
              >
                Verify OTP
              </button>
            </>
          )}
        </div>

        {/* Google Login */}
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const idToken = credentialResponse.credential;
              await handleGoogleLogin(idToken);
            } catch (err) {
              alert("Google login failed");
            }
          }}
          onError={() => {
            alert("Google Login Failed");
          }}
          useOneTap
        />

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

