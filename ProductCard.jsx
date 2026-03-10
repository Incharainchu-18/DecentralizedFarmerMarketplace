import React, { useState, useEffect } from 'react';
import "./ProductCard.css";

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onBuyNow, 
  viewMode, 
  index 
}) => {

  const productId = product.id || product._id; // ✅ FIX: ID consistency

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  /* ================= WISHLIST CHECK ================= */
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (!savedWishlist) return;

      const wishlist = JSON.parse(savedWishlist);
      const exists = wishlist.some(item => item?.id === productId);
      setIsInWishlist(exists);
    } catch (err) {
      console.error("Wishlist parse error:", err);
      localStorage.removeItem("wishlist");
    }
  }, [productId]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (product.stock === 0 || isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      const cartProduct = {
        id: productId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.images?.[0] || "",
        images: product.images || [],
        farmer: product.farmerName || product.farmer,
        location: product.location,
        organic: product.isOrganic || product.organic || false,
        rating: product.rating || 4,
        unit: product.unit || "kg",
        category: product.category,
        stock: product.stock,
        deliveryTime: product.deliveryTime
      };

      if (window.cartManager?.addToCart) {
        window.cartManager.addToCart(cartProduct, 1);
      } else {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const index = cart.findIndex(i => i.id === productId);

        if (index > -1) cart[index].quantity += 1;
        else cart.push({ ...cartProduct, quantity: 1 });

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
      }

      onAddToCart && onAddToCart(product);

    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  };

  /* ================= BUY NOW ================= */
  const handleBuyNow = () => {
    if (product.stock === 0) return;

    handleAddToCart();

    setTimeout(() => {
      if (onBuyNow) {
        onBuyNow(product);
      } else {
        window.location.href = "/checkout";
      }
    }, 600);
  };

  /* ================= WISHLIST ================= */
  const toggleWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem("wishlist");
      let wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

      if (isInWishlist) {
        wishlist = wishlist.filter(item => item?.id !== productId);
        setIsInWishlist(false);
      } else {
        wishlist.push({
          id: productId,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          farmer: product.farmerName,
          unit: product.unit,
          category: product.category,
          rating: product.rating
        });
        setIsInWishlist(true);
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      onAddToWishlist && onAddToWishlist(product, !isInWishlist);

    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  /* ================= IMAGE ================= */
  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const getStarRating = (rating = 0) => {
    const full = Math.floor(rating);
    return "⭐".repeat(full) + "☆".repeat(5 - full);
  };

  /* ================= UI ================= */
  return (
    <div 
      className={`product-card ${viewMode}`} 
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="product-image">
        {imageLoading && !imageError && <div className="image-loading" />}
        {!imageError && product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            style={{ display: imageLoading ? "none" : "block" }}
          />
        ) : (
          <div className="image-placeholder">📦</div>
        )}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-rating">
          {getStarRating(product.rating)} ({product.reviews || 0})
        </div>

        <p className="product-description">{product.description}</p>

        <div className="product-price">
          ₹{product.price}/{product.unit}
          {product.originalPrice > product.price && (
            <span className="original-price">₹{product.originalPrice}</span>
          )}
        </div>

        <div className="product-actions">
          <button
            className="add-to-cart-btn"
            disabled={product.stock === 0 || isAddingToCart}
            onClick={handleAddToCart}
          >
            {isAddingToCart ? "Adding..." : "🛒 Add to Cart"}
          </button>

          <button
            className="buy-now-btn"
            disabled={product.stock === 0}
            onClick={handleBuyNow}
          >
            ⚡ Buy Now
          </button>

          <button
            className={`wishlist-btn ${isInWishlist ? "in-wishlist" : ""}`}
            onClick={toggleWishlist}
          >
            {isInWishlist ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
