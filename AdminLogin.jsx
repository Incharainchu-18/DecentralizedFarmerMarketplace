import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ✅ FIXED
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 🔐 DEMO ADMIN CREDENTIALS
  const ADMIN_CREDENTIALS = [
    { email: "admin@farmermarket.com", password: "admin123", role: "superadmin" },
    { email: "moderator@farmermarket.com", password: "mod123", role: "moderator" }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // ⏳ Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const admin = ADMIN_CREDENTIALS.find(
        (cred) => cred.email === email && cred.password === password
      );

      if (!admin) {
        setError("Invalid admin credentials. Please check email and password.");
        setIsLoading(false);
        return;
      }

      // ✅ STORE ADMIN SESSION
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminEmail", admin.email);
      localStorage.setItem("adminRole", admin.role);
      localStorage.setItem("adminLoginTime", new Date().toISOString());

      // 🚀 REDIRECT
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">

          <div className="login-header">
            <div className="logo-container">
              <i className="fas fa-leaf"></i>
              <h1>FarmerMarket Admin</h1>
            </div>
            <p>Secure Admin Portal Access</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">

            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Admin Email</label>
              <div className="input-container">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-container">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-login">
              {isLoading ? "Signing in..." : "Sign in as Admin"}
            </button>

          </form>

          <div className="login-footer">
            <div className="security-notice">
              <i className="fas fa-shield-alt"></i>
              <p>Authorized personnel only. All actions are monitored.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
