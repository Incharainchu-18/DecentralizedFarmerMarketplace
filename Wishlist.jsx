import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [filterCategory, setFilterCategory] = useState("all");
  const [notification, setNotification] = useState("");

  /* ---------- HELPERS ---------- */
  const getId = (item) => item?.id || item?._id;

  const getImage = (item) =>
    item?.image ||
    item?.images?.[0] ||
    "/placeholder.png"; // put placeholder in public/

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  /* ---------- LOAD WISHLIST (ON EVERY NAVIGATION) ---------- */
  const loadWishlist = () => {
    try {
      const data = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistItems(data);
    } catch {
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [location.pathname]); // 🔥 refresh on navigation

  const saveWishlist = (items) => {
    localStorage.setItem("wishlist", JSON.stringify(items));
    setWishlistItems(items);
  };

  /* ---------- REMOVE ---------- */
  const removeFromWishlist = (id) => {
    const updated = wishlistItems.filter(item => getId(item) !== id);
    saveWishlist(updated);
    showNotification("Item removed from wishlist");
  };

  /* ---------- MOVE TO CART ---------- */
  const moveToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const pid = getId(product);

    const existing = cart.find(item => item.id === pid);

    let updatedCart;
    if (existing) {
      updatedCart = cart.map(item =>
        item.id === pid
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          ...product,
          id: pid,
          image: getImage(product), // ✅ ensure image persists
          quantity: 1,
        },
      ];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    removeFromWishlist(pid);
    showNotification(`${product.name} added to cart`);
  };

  /* ---------- MOVE ALL ---------- */
  const moveAllToCart = () => {
    if (wishlistItems.length === 0) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    wishlistItems.forEach(product => {
      const pid = getId(product);
      const existing = cart.find(item => item.id === pid);

      if (existing) {
        cart = cart.map(item =>
          item.id === pid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        cart.push({
          ...product,
          id: pid,
          image: getImage(product),
          quantity: 1,
        });
      }
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    saveWishlist([]);
    showNotification("All items moved to cart");
  };

  /* ---------- CLEAR ---------- */
  const clearWishlist = () => {
    if (window.confirm("Clear entire wishlist?")) {
      saveWishlist([]);
      showNotification("Wishlist cleared");
    }
  };

  /* ---------- FILTER & SORT ---------- */
  const categories = ["all", ...new Set(wishlistItems.map(i => i.category).filter(Boolean))];

  const filteredItems = wishlistItems
    .filter(i => filterCategory === "all" || i.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
    });

  /* ---------- UI ---------- */
  return (
    <div className="wishlist-page">

      {notification && (
        <div className="wishlist-notification">{notification}</div>
      )}

      {/* HEADER */}
      <div className="wishlist-header">
        <div className="header-content">
          <h1>❤️ My Wishlist</h1>
          <p>Save your favorite products for later</p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="header-actions">
            <button className="move-all-btn" onClick={moveAllToCart}>🛒 Move All</button>
            <button className="clear-btn" onClick={clearWishlist}>🗑 Clear</button>
          </div>
        )}
      </div>

      {/* EMPTY */}
      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <h2>Your wishlist is empty</h2>
          <p>Tap the ❤️ icon on products to save them</p>
          <button
            className="start-shopping-btn"
            onClick={() => navigate("/products")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* CONTROLS */}
          <div className="wishlist-controls">
            <div className="wishlist-stats">
              <strong>{wishlistItems.length} items</strong>
              <p>
                Total Value: ₹
                {wishlistItems.reduce((t, i) => t + (i.price || 0), 0)}
              </p>
            </div>

            <div className="filter-controls">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date">Recently Added</option>
                <option value="price-low">Price Low → High</option>
                <option value="price-high">Price High → Low</option>
                <option value="name">Name A–Z</option>
              </select>

              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.filter(c => c !== "all").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GRID */}
          <div className="wishlist-grid">
            {filteredItems.map(item => {
              const id = getId(item);

              return (
                <div className="wishlist-item" key={id}>
                  <div
                    className="item-image"
                    onClick={() => navigate(`/product/${id}`)}
                  >
                    <img src={getImage(item)} alt={item.name} />
                    <button
                      className="remove-wishlist-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(id);
                      }}
                    >
                      ❌
                    </button>
                  </div>

                  <h3>{item.name}</h3>
                  <p className="price">₹{item.price}/{item.unit || "unit"}</p>

                  <div className="item-actions">
                    <button
                      className="move-to-cart-btn"
                      onClick={() => moveToCart(item)}
                    >
                      🛒 Move to Cart
                    </button>
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/product/${id}`)}
                    >
                      👁 View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
