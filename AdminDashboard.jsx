// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin/login");
      return;
    }

    setAdmin({
      email: localStorage.getItem("adminEmail"),
      role: localStorage.getItem("adminRole"),
    });

    loadAllData();
  }, [navigate]);

  /* ================= LOAD DATA ================= */
  const loadAllData = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(JSON.parse(localStorage.getItem("users") || "[]"));
      setProducts(JSON.parse(localStorage.getItem("blockchainProducts") || "[]"));
      setOrders(JSON.parse(localStorage.getItem("orders") || "[]"));
      setLoading(false);
    }, 500);
  };

  /* ================= ACTIONS ================= */
  const updateUserStatus = (id, status) => {
    const updated = users.map(u =>
      u.id === id ? { ...u, status } : u
    );
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  const updateProductStatus = (id, status) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, status } : p
    );
    setProducts(updated);
    localStorage.setItem("blockchainProducts", JSON.stringify(updated));
  };

  const updateOrderStatus = (id, status) => {
    const updated = orders.map(o =>
      o.id === id ? { ...o, status } : o
    );
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  const logout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  /* ================= STATS ================= */
  const stats = {
    users: users.length,
    farmers: users.filter(u => u.role === "farmer").length,
    products: products.length,
    pendingProducts: products.filter(p => p.status === "pending").length,
    orders: orders.length,
  };

  /* ================= UI ================= */
  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <header className="admin-header">
        <h1>🌾 FarmerMarket Admin Panel</h1>
        <div className="admin-meta">
          <span>{admin?.email}</span>
          <span className="role">{admin?.role}</span>
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-container">

        {/* SIDEBAR */}
        <aside className="sidebar">
          {["dashboard", "users", "products", "orders", "blockchain"].map(tab => (
            <button
              key={tab}
              type="button"
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </aside>

        {/* CONTENT */}
        <main className="main-content">

          {loading && <p>Loading...</p>}

          {!loading && activeTab === "dashboard" && (
            <div className="cards">
              <div className="card">👤 Users: {stats.users}</div>
              <div className="card">👨‍🌾 Farmers: {stats.farmers}</div>
              <div className="card">📦 Products: {stats.products}</div>
              <div className="card">⏳ Pending Products: {stats.pendingProducts}</div>
              <div className="card">🛒 Orders: {stats.orders}</div>
            </div>
          )}

          {!loading && activeTab === "users" && (
            <table>
              <thead>
                <tr><th>Name</th><th>Role</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.role}</td>
                    <td>{u.status || "active"}</td>
                    <td>
                      <button type="button" onClick={() => updateUserStatus(u.id, "blocked")}>Block</button>
                      <button type="button" onClick={() => updateUserStatus(u.id, "active")}>Activate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && activeTab === "products" && (
            <div className="products-grid">
              {products.map(p => (
                <div key={p.id} className="product-card">
                  <h3>{p.name}</h3>
                  <p>Farmer: {p.farmer}</p>
                  <p>Status: {p.status}</p>
                  <button type="button" onClick={() => updateProductStatus(p.id, "approved")}>Approve</button>
                  <button type="button" onClick={() => updateProductStatus(p.id, "rejected")}>Reject</button>
                </div>
              ))}
            </div>
          )}

          {!loading && activeTab === "orders" && (
            <table>
              <thead>
                <tr><th>Order ID</th><th>User</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.user}</td>
                    <td>{o.status}</td>
                    <td>
                      <button type="button" onClick={() => updateOrderStatus(o.id, "completed")}>Complete</button>
                      <button type="button" onClick={() => updateOrderStatus(o.id, "cancelled")}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && activeTab === "blockchain" && (
            <pre>{JSON.stringify(products, null, 2)}</pre>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
