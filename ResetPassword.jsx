import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Auth.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= INVALID LINK ================= */
  if (!token || !userId) {
    return (
      <div className="login-page">
        <div className="reset-password-container idle-float">
          <h2>Invalid or Expired Link</h2>
          <p>
            This password reset link is invalid or has expired.
            Please request a new reset link.
          </p>

          <div className="auth-links">
            <Link to="/forgot-password" className="back-link">
              Request New Reset Link
            </Link>
            <Link to="/login" className="back-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const pwd = password.trim();
    const confirmPwd = confirmPassword.trim();

    if (!pwd || !confirmPwd) {
      setError("Please fill in both password fields");
      return;
    }

    if (pwd.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (pwd !== confirmPwd) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/reset-password", {
        token,
        userId,
        password: pwd,
      });

      if (data.success) {
        setMessage(data.message || "Password reset successful!");

        // Redirect to login after success
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Reset failed");
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="login-page">
      <div className="reset-password-container idle-float">

        <h2>Reset Your Password</h2>
        <p className="instruction-text">
          Enter a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="input-group">
            <input
              type="password"
              className="form-input"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="form-input"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={`submit-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
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
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
