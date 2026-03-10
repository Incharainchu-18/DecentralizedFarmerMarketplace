// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css"; // local styles

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [coins, setCoins] = useState(0);
  const [balance, setBalance] = useState(0);
  const [wallet, setWallet] = useState("");

  useEffect(() => {
    // load products (adjust endpoint if your backend uses different path)
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data || []))
      .catch(err => {
        console.error("Products load error", err);
        setProducts([]); // fallback
      });

    // load user summary (optional)
    axios.get("http://localhost:5000/api/user/summary", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(r => {
      if (r.data) { setCoins(r.data.coins || 0); setBalance(r.data.balance || 0); }
    }).catch(() => { /* ignore */ });
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask or another web3 wallet");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
    } catch (e) {
      console.error("wallet connect error", e);
    }
  };

  return (
    <div className="dashboard-root">
      <h1>User Dashboard</h1>

      <div className="summary">
        <div>Coins: <strong>{coins}</strong></div>
        <div>Balance: <strong>₹{balance}</strong></div>
        <button className="btn" onClick={() => alert("Convert coins flow not implemented")}>Convert coins → ₹</button>
      </div>

      <div style={{ margin: "12px 0" }}>
        <button className="btn" onClick={connectWallet}>
          {wallet ? `Wallet: ${wallet.slice(0,6)}...${wallet.slice(-4)}` : "Connect Wallet"}
        </button>
      </div>

      <h2>Available Products</h2>
      <div className="products-grid">
        {products.length === 0 && <div className="no-products">No products found</div>}
        {products.map(p => (
          <div key={p._id} className="product-card">
            <h3>{p.title || p.name}</h3>
            <p className="desc">{p.description ? p.description.substring(0,140) : "No description"}</p>
            <div className="row">
              <strong className="price">₹{p.price || 0}</strong>
              <button className="btn small" onClick={() => alert('Buy not implemented')}>Buy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
