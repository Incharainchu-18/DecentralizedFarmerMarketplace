import React, { useState } from "react";
import axios from "axios";
import OtpForm from "./OtpForm"; // we’ll reuse your verified OTP component
import { useNavigate } from "react-router-dom";
export default function RegisterUserOtp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showOtp, setShowOtp] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 
  const backendUrl = "http://localhost:5000/api/auth";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("Registering...");
    try {
      const res = await axios.post(`${backendUrl}/register-user`, form);
      setMessage(res.data.msg || "OTP sent. Please verify.");
      setShowOtp(true);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Registration failed.");
    }
  };

  const handleVerified = async () => {
    setMessage("✅ Registration verified successfully! You can now log in.");
     setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      {!showOtp ? (
        <>
          <h2>Register (with OTP)</h2>
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
