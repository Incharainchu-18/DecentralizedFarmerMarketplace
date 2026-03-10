import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(
        "/api/auth/forgot-password",
        { email: trimmedEmail }
      );

      if (data.success) {
        let successMsg = data.message || "Reset link sent to your email.";

        // ✅ DEV MODE: show reset link if backend sends it
        if (data.resetLink) {
          successMsg += `\n\nDevelopment Reset Link:\n${data.resetLink}`;
        }

        setMessage(successMsg);
        setEmail("");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Request failed");
      } else {
        setError("Server not responding. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="login-page">
      <div className="forgot-password-container idle-float">

        <h2>Forgot Password</h2>

        <p className="instruction-text">
          Enter your registered email address and we’ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="input-group">
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className={`submit-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {error && (
          <div
            className="alert-message alert-error"
            style={{ whiteSpace: "pre-line" }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="alert-message alert-success"
            style={{ whiteSpace: "pre-line" }}
          >
            {message}
          </div>
        )}

        <div className="auth-links">
          <Link to="/login" className="back-link">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
