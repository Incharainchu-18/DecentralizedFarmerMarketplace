import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Auth.css";
import logo from "../images/logo1.jpg";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [role, setRole] = useState("farmer");
  const [email, setEmail] = useState("suchitrabander@gmail.com");
  const [password, setPassword] = useState("Suchi@123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* ================= LOGIN ================= */
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }

    setLoading(true);

    const demoUser = {
      id: Date.now(),
      name: role === "farmer" ? "Suchitra Bander" : "Inchara Vaishnavar",
      email,
      role,
    };

    localStorage.setItem("token", "demo-token");
    localStorage.setItem("user", JSON.stringify(demoUser));

    if (remember) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    setTimeout(() => {
      navigate(
        role === "farmer" ? "/dashboard/farmer" : "/dashboard/user",
        { replace: true }
      );
    }, 800);
  };

  /* ================= ROLE CHANGE ================= */
  const handleRoleChange = (r) => {
    setRole(r);
    setErrorMsg("");
    if (r === "farmer") {
      setEmail("suchitrabander@gmail.com");
      setPassword("Suchi@123");
    } else {
      setEmail("incharavaishnavar@gmail.com");
      setPassword("Inchu@123");
    }
  };

  /* ================= VOICE ================= */
  const handleMicClick = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return alert("Voice not supported");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (e) => {
      const cmd = e.results[0][0].transcript.toLowerCase();
      if (cmd.includes("farmer")) handleRoleChange("farmer");
      if (cmd.includes("user")) handleRoleChange("user");
      if (cmd.includes("login")) handleLogin({ preventDefault: () => {} });
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  /* ================= UI ================= */
  return (
    <div className="login-page">
      <div className="auth-wrapper">

        <div className="auth-logo">
          <img src={logo} alt="Farmer Marketplace" />
        </div>

        <div className="login-card">

          {/* Language + Mic */}
          <div className="top-right-controls">
            <select
              className="lang-select"
              value={localStorage.getItem("i18nextLng") || "en"}
              onChange={(e) => {
                localStorage.setItem("i18nextLng", e.target.value);
                window.location.reload();
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>

            <button
              className={`voice-btn ${listening ? "listening" : ""}`}
              onClick={handleMicClick}
            >
              <i className="bi bi-mic" />
            </button>
          </div>

          <h2>Login</h2>
          <p className="login-subtitle">Access your Farmer Marketplace</p>

          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="form">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="farmer">Farmer</option>
                <option value="user">User / Buyer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  className="form-control"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button className="login-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            Don’t have an account?
            <Link to="/register" className="register-link"> Register</Link>
          </div>

          {/* ADMIN ACCESS (POSITION CONTROLLED BY CSS) */}
          <div className="admin-access-section">
            <Link to="/admin/login" className="admin-access-btn">
              <i className="bi bi-shield-lock"></i> Admin Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
