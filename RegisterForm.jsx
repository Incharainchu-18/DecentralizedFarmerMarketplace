// src/components/RegisterForm.js
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";
import logo from "../images/logo1.jpg";
import { connectWallet, onChainChanged, onAccountsChanged } from "../utils/walletConnect";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry"
];

export default function RegisterForm({ initialRole = "user" }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  // Vite env: set VITE_API_BASE in .env (eg. VITE_API_BASE=http://localhost:5000)
  const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5000";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otpEmail: "",
    mobile: "",
    otpMobile: "",
    address: "",
    state: "",
    country: "India",
    password: "",
    confirmPassword: "",
    walletAddr: "",
    farmName: "",
    farmType: "",
    farmSize: "",
    experience: "",
    certification: ""
  });

  const [role, setRole] = useState(initialRole);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [status, setStatus] = useState("");

  const [emailCooldown, setEmailCooldown] = useState(0);
  const [mobileCooldown, setMobileCooldown] = useState(0);
  const emailIntervalRef = useRef(null);
  const mobileIntervalRef = useRef(null);

  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    return () => {
      if (emailIntervalRef.current) { clearInterval(emailIntervalRef.current); emailIntervalRef.current = null; }
      if (mobileIntervalRef.current) { clearInterval(mobileIntervalRef.current); mobileIntervalRef.current = null; }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop?.();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // wallet listeners (best-effort — utils may be undefined in some envs)
  useEffect(() => {
    let unsubChain = () => {};
    let unsubAccounts = () => {};

    try {
      if (typeof onChainChanged === "function") {
        unsubChain = onChainChanged(({ chainId, networkName }) => {
          setStatus(`🔄 Network changed to ${networkName}. Please reconnect wallet.`);
          setFormData(prev => ({ ...prev, walletAddr: "" }));
        });
      }
    } catch (e) {
      console.warn("onChainChanged not available", e);
    }
    try {
      if (typeof onAccountsChanged === "function") {
        unsubAccounts = onAccountsChanged((accounts) => {
          if (!accounts || accounts.length === 0) {
            setStatus("⚠️ Wallet disconnected. You can reconnect or skip wallet.");
            setFormData(prev => ({ ...prev, walletAddr: "" }));
          } else {
            setFormData(prev => ({ ...prev, walletAddr: accounts[0] }));
            setStatus("🔁 Wallet account switched.");
          }
        });
      }
    } catch (e) {
      console.warn("onAccountsChanged not available", e);
    }

    return () => {
      try { unsubChain(); } catch(_) {}
      try { unsubAccounts(); } catch(_) {}
    };
  }, []);

  const speak = (msg) => {
    try {
      const lang = i18n.language || "en";
      const utter = new SpeechSynthesisUtterance(typeof msg === "object" ? (msg[lang] || msg.en || JSON.stringify(msg)) : msg);
      utter.lang = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN";
      window.speechSynthesis.speak(utter);
    } catch (e) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "password") calculatePasswordStrength(value);
  };
  const handleFocus = (e) => setFocusedField(e.target.name || null);

  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setPasswordStrength(score);
  };

  // connect wallet — robust handling for errors (including "process is not defined")
  const handleConnectWallet = async () => {
    if (walletConnecting) return;
    setWalletConnecting(true);
    try {
      const result = await connectWallet();
      if (result && result.switched) {
        setStatus(`⚠️ ${result.message} Click "Connect Wallet" again.`);
        speak({ en: result.message });
        setWalletConnecting(false);
        return;
      }
      const { address } = result || {};
      if (address) {
        setFormData(prev => ({ ...prev, walletAddr: address }));
        setStatus(`✅ Wallet connected: ${shortAddr(address)}`);
        speak({ en: "Wallet connected successfully" });
      } else {
        setStatus("❌ Wallet connection returned no address");
      }
    } catch (err) {
      console.error("handleConnectWallet error:", err);
      // Detect common bundler/runtime mistake where `process` is used in browser code
      if (err && typeof err.message === "string" && err.message.includes("process is not defined")) {
        setStatus("❌ Wallet util error: 'process' is not defined in the browser. Please update utils/walletConnect to use import.meta.env for Vite or remove server-only process.env usage.");
      } else {
        setStatus(`❌ Wallet connection failed: ${err?.message || String(err)}`);
      }
      speak({ en: "Wallet connection failed" });
    } finally {
      setWalletConnecting(false);
    }
  };

  const startCooldown = (type, duration = 60) => {
    const setCooldown = type === "email" ? setEmailCooldown : setMobileCooldown;
    const ref = type === "email" ? emailIntervalRef : mobileIntervalRef;
    if (ref.current) { clearInterval(ref.current); ref.current = null; }
    setCooldown(duration);
    ref.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(ref.current);
          ref.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // helper: try list of endpoint variants sequentially
  async function tryEndpoints(endpoints, options = {}) {
    for (const p of endpoints) {
      const url = p.startsWith("http") ? p : `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;
      try {
        const fetchOptions = { ...options, credentials: 'include' }; // include cookies (if backend sets them)
        const resp = await fetch(url, fetchOptions);
        const text = await resp.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { raw: text }; }

        if (resp.ok) return { ok: true, resp, data, used: url };
        if (resp.status === 404) {
          console.warn("Endpoint returned 404, trying next:", url, text);
          continue;
        }
        // other status -> return failure (but still try next endpoint variants above)
        return { ok: false, resp, data, used: url };
      } catch (err) {
        console.error("Network error trying", p, err);
        continue;
      }
    }
    return { ok: false, error: "No endpoint responded (all tried)", tried: endpoints };
  }

  const sendOTP = async (type) => {
    setStatus("Sending OTP...");
    if (type === "email" && (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))) {
      setStatus("❌ Enter a valid email address.");
      return;
    }
    if (type === "mobile" && (!formData.mobile || formData.mobile.length < 6)) {
      setStatus("❌ Enter a valid mobile number.");
      return;
    }

    const endpoints = type === "email"
      ? ["/api/auth/send-email-otp", "/api/auth/send-otp", "/api/send-email-otp", "/api/send-otp"]
      : ["/api/auth/send-mobile-otp", "/api/auth/send-otp", "/api/send-mobile-otp", "/api/send-otp"];

    const payload = type === "email" ? { email: formData.email } : { mobile: formData.mobile };

    const res = await tryEndpoints(endpoints, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setStatus(`✅ OTP sent (via ${res.used})`);
      // if dev fallback returns debugOtp, help the developer
      if (res.data?.debugOtp) {
        console.log("DEV OTP:", res.data.debugOtp);
        setStatus("✅ OTP sent (dev). Check server console or response debugOtp.");
      }
      startCooldown(type);
    } else {
      const errMsg = res.data?.message || res.data?.msg || res.data?.raw || res.error || `HTTP ${res?.resp?.status || "?"}`;
      setStatus(`❌ Failed to send OTP: ${errMsg}`);
      console.error("sendOTP failed result:", res);
    }
  };

  const verifyOTP = async (type) => {
    setStatus("Verifying OTP...");
    const otp = type === "email" ? formData.otpEmail : formData.otpMobile;
    if (!otp) { setStatus("❌ Enter OTP first."); return; }

    const endpoints = type === "email"
      ? ["/api/auth/verify-email-otp", "/api/auth/verify-otp", "/api/verify-otp"]
      : ["/api/auth/verify-mobile-otp", "/api/auth/verify-otp", "/api/verify-otp"];

    const payload = type === "email" ? { email: formData.email, otp } : { mobile: formData.mobile, otp };

    const res = await tryEndpoints(endpoints, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setStatus(`✅ ${type} verified (via ${res.used})`);
      if (type === "email") setEmailVerified(true); else setMobileVerified(true);
    } else {
      const errMsg = res.data?.message || res.data?.msg || res.data?.raw || res.error || `HTTP ${res?.resp?.status || "?"}`;
      setStatus(`❌ Verification failed: ${errMsg}`);
      console.error("verifyOTP failed result:", res);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Registering...");

    if (!formData.name || !formData.email || !formData.mobile) {
      setStatus("❌ Please fill all required fields");
      return;
    }
    if (!emailVerified || !mobileVerified) {
      setStatus("❌ Please verify email and mobile before registering");
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setStatus("❌ Passwords do not match");
      return;
    }
    if (role === "farmer" && (!formData.farmName || !formData.farmType)) {
      setStatus("❌ Farm name and type are required for farmers");
      return;
    }

    // Primary server endpoint (server.js uses /api/register)
    const endpoints = ["/api/register", "/api/auth/register-user", "/api/auth/register-user", "/api/auth/register"];

    const payload = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password || undefined,
      confirmPassword: formData.confirmPassword || undefined,
      address: formData.address,
      state: formData.state,
      country: formData.country || "India",
      role,
      farmName: formData.farmName,
      farmType: formData.farmType,
      farmSize: formData.farmSize,
      experience: formData.experience,
      walletAddr: formData.walletAddr
    };

    const res = await tryEndpoints(endpoints, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setStatus(`✅ Registered successfully (via ${res.used})`);
      if (res.data?.token) localStorage.setItem("token", res.data.token);
      setTimeout(() => navigate("/login"), 1200);
    } else {
      const errMsg = res.data?.message || res.data?.msg || res.data?.raw || res.error || `HTTP ${res?.resp?.status || "?"}`;
      setStatus(`❌ Registration failed: ${errMsg}`);
      console.error("Registration failed result:", res);
    }
  };

  // speech recognition helpers
  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setStatus("⚠️ Speech recognition not supported"); return; }
    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.lang = i18n.language === "hi" ? "hi-IN" : i18n.language === "kn" ? "kn-IN" : "en-IN";
      recognitionRef.current.onresult = (ev) => {
        const transcript = Array.from(ev.results).map(r => r[0].transcript).join(" ").trim();
        if (!transcript) return;
        const target = focusedField || "name";
        setFormData(prev => ({ ...prev, [target]: (prev[target] || "") + (prev[target] ? " " : "") + transcript }));
        setStatus(`🎙 Heard: "${transcript}"`);
      };
      recognitionRef.current.onerror = (err) => { console.error(err); setStatus("⚠️ Voice recognition error"); setListening(false); };
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.start();
      setListening(true);
      setStatus("🎧 Listening...");
    } catch (err) {
      console.error("startRecognition error:", err);
      setStatus("⚠️ Could not start voice recognition");
    }
  };
  const stopRecognition = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop?.();
        recognitionRef.current = null;
      }
    } catch (e) {}
    setListening(false);
    setStatus("⏹️ Stopped listening.");
  };
  const toggleMic = () => (listening ? stopRecognition() : startRecognition());

  const shortAddr = (addr = "") => (!addr ? "" : `${addr.slice(0, 8)}...${addr.slice(-6)}`);
  const isFormReady = emailVerified && mobileVerified;

  return (
    <div className="register-page">
      <div className="top-right-controls" role="toolbar" aria-label="language and voice">
        <select
          className="lang-select"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>

        <button type="button" className="mic-button" onClick={toggleMic} aria-pressed={!!listening}>
          🎙
        </button>
      </div>

      <header className="register-header"><div className="logo-container"><img src={logo} alt="Logo" /></div></header>

      <main className="register-container idle-float" role="main" aria-live="polite">
        <h2 style={{ marginTop: 12 }}>Registration</h2>

        <div className="registration-tabs">
          <button type="button" className={`registration-tab ${role === "user" ? "active" : ""}`} onClick={() => setRole("user")}>User Registration</button>
          <button type="button" className={`registration-tab ${role === "farmer" ? "active" : ""}`} onClick={() => setRole("farmer")}>Farmer Registration</button>
        </div>

        <div className="form-scroll" role="region" aria-label="Registration form">
          <form onSubmit={handleSubmit} aria-label={`${role}-register-form`}>
            {role === "farmer" && (
              <div className="form-grid">
                <input name="farmName" placeholder="Farm Name" value={formData.farmName} onChange={handleChange} onFocus={handleFocus} required />
              </div>
            )}

            <div className="form-grid two-col">
              <input name="name" placeholder={role === "farmer" ? "Farmer Name" : "Name"} value={formData.name} onChange={handleChange} onFocus={handleFocus} required />
              <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} onFocus={handleFocus} required />
            </div>

            <div className="form-grid">
              <div className="full">
                <input name="otpEmail" placeholder="Enter OTP" value={formData.otpEmail} onChange={handleChange} onFocus={handleFocus} />
                <div className="otp-container">
                  <button type="button" className="otp-link" onClick={() => sendOTP("email")} disabled={emailCooldown > 0}>
                    {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : "Send Email OTP"}
                  </button>
                  <button type="button" className="otp-link verify" onClick={() => verifyOTP("email")}>Verify Email OTP</button>
                  {emailVerified && <span className="verified-text" aria-hidden>✔ Verified</span>}
                </div>
              </div>
            </div>

            <div className="form-grid two-col">
              <input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} onFocus={handleFocus} required />
              <input name="otpMobile" placeholder="Enter OTP" value={formData.otpMobile} onChange={handleChange} onFocus={handleFocus} />
            </div>

            <div className="form-grid">
              <div className="full">
                <div className="otp-container">
                  <button type="button" className="otp-link" onClick={() => sendOTP("mobile")} disabled={mobileCooldown > 0}>
                    {mobileCooldown > 0 ? `Resend in ${mobileCooldown}s` : "Send Mobile OTP"}
                  </button>
                  <button type="button" className="otp-link verify" onClick={() => verifyOTP("mobile")}>Verify Mobile OTP</button>
                  {mobileVerified && <span className="verified-text" aria-hidden>✔ Verified</span>}
                </div>
              </div>
            </div>

            <div className="form-grid">
              <input name="address" placeholder={role === "farmer" ? "Farm Address" : "Address"} value={formData.address} onChange={handleChange} onFocus={handleFocus} required />
            </div>

            {role === "farmer" && (
              <div className="farmer-fields active">
                <div className="form-grid two-col">
                  <select name="farmType" value={formData.farmType} onChange={handleChange} onFocus={handleFocus} required>
                    <option value="">Farm Type</option>
                    <option value="organic">Organic Farming</option>
                    <option value="dairy">Dairy Farming</option>
                    <option value="poultry">Poultry Farming</option>
                    <option value="crops">Crop Farming</option>
                    <option value="mixed">Mixed Farming</option>
                  </select>
                  <input name="farmSize" placeholder="Farm Size (acres)" value={formData.farmSize} onChange={handleChange} onFocus={handleFocus} />
                </div>
              </div>
            )}

            <div className="form-grid two-col">
              <select name="state" value={formData.state} onChange={handleChange} onFocus={handleFocus} required>
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} onFocus={handleFocus} required />
            </div>

            <div className="form-grid two-col">
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} onFocus={handleFocus} />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} onFocus={handleFocus} />
            </div>

            <div className="form-grid">
              <div className="full">
                <div className="password-strength-bar" aria-hidden>
                  <div className={passwordStrength < 2 ? "password-weak" : passwordStrength < 4 ? "password-medium" : "password-strong"}
                       style={{ width: `${(passwordStrength / 4) * 100}%`, height: "100%" }} />
                </div>
              </div>
            </div>

            <div style={{ height: 8 }} />
          </form>
        </div>

        <div className="card-footer" role="region" aria-label="form actions">
          <div className="footer-ctas">
            <button type="button" className="primary-submit" onClick={handleSubmit} aria-label="Register" disabled={!isFormReady}>
              Register as {role === "farmer" ? "Farmer" : "User"}
            </button>
            <button type="button" className="wallet-connect" onClick={handleConnectWallet} disabled={walletConnecting}>
              {walletConnecting ? "Connecting..." : (formData.walletAddr ? shortAddr(formData.walletAddr) : "Connect Wallet")}
            </button>
          </div>
        </div>

        {status && (
          <div style={{ padding: 8 }}>
            <div className={`status-message ${status.includes("❌") ? "error" : "success"}`} role="status">
              {status}
            </div>
          </div>
        )}
      </main>

      <div style={{ marginTop: 12, textAlign: "center" }}>
        <p style={{ color: "#eafdf0", fontWeight: 600 }}>
          Already have an account? <Link to="/login" style={{ color: "var(--rg-brand-green)" }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
