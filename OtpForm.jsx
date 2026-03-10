import React, { useState } from "react";
import axios from "axios";

export default function OtpForm({ onVerified, baseUrl = "http://localhost:5000/api/auth" }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== Send OTP =====
  const handleSendOtp = async () => {
    if (!phone) return setMessage("Please enter your phone number.");
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${baseUrl}/send-otp`, { phone });
      setMessage(res.data.msg || "OTP sent successfully!");
      setSent(true);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Verify OTP =====
  const handleVerifyOtp = async () => {
    if (!otp) return setMessage("Enter OTP.");
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${baseUrl}/verify-otp`, { phone, code: otp });
      setMessage(res.data.msg || "OTP verified!");
      setVerified(true);
      onVerified?.({ phone });
    } catch (err) {
      setMessage(err.response?.data?.msg || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
      }}
    >
      {!verified ? (
        <>
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>OTP Verification</h2>

          {!sent ? (
            <>
              <input
                placeholder="Phone (+91XXXXXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
              <button onClick={handleSendOtp} style={buttonStyle} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={inputStyle}
              />
              <button onClick={handleVerifyOtp} style={buttonStyle} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {message && (
            <p style={{ color: verified ? "green" : "red", marginTop: 10 }}>{message}</p>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h3 style={{ color: "green" }}>✅ Verified Successfully!</h3>
          <p>You can proceed.</p>
        </div>
      )}
    </div>
  );
}
