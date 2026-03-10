import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OtpForm from "./OtpForm";

export default function RegisterFarmerOtp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showOtp, setShowOtp] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Backend API base URL
  const backendUrl = "http://localhost:5000/api/auth";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Register farmer and send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("Registering...");
    try {
      const res = await axios.post(`${backendUrl}/register-farmer`, form);
      setMessage(res.data.msg || "OTP sent. Please verify.");
      setShowOtp(true);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Registration failed.");
    }
  };

  // Step 2: After OTP verified → redirect to dashboard or login
  const handleVerified = async () => {
    setMessage("✅ OTP Verified! Redirecting to dashboard...");
    setTimeout(() => navigate("/dashboard/farmer"), 2000);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      {!showOtp ? (
        <>
          <h2>Farmer Registration (with OTP)</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              style={{ display: "block", marginBottom: 10, width: "100%" }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              style={{ display: "block", marginBottom: 10, width: "100%" }}
            />
            <input
              type="text"
              name="phone"
              placeholder="+91XXXXXXXXXX"
              value={form.phone}
              onChange={handleChange}
              style={{ display: "block", marginBottom: 10, width: "100%" }}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={{ display: "block", marginBottom: 10, width: "100%" }}
            />
            <button type="submit" style={{ padding: 10, width: "100%" }}>
              Register
            </button>
          </form>
          {message && <p style={{ color: "green" }}>{message}</p>}
        </>
      ) : (
        <OtpForm baseUrl={backendUrl} onVerified={handleVerified} />
      )}
    </div>
  );
}
