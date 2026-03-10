// src/components/Cart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

// Constants
const AVAILABLE_COUPONS = [
  { 
    code: 'FARM25', 
    discount: 25, 
    type: 'percentage', 
    minAmount: 500, 
    description: '25% off on farm fresh products',
    validUntil: '2025-12-31'
  },
  { 
    code: 'WELCOME10', 
    discount: 10, 
    type: 'percentage', 
    minAmount: 200, 
    description: '10% off on your first order',
    validUntil: '2025-06-30'
  },
  { 
    code: 'FREESHIP', 
    discount: 40, 
    type: 'fixed', 
    minAmount: 300, 
    description: 'Free shipping on orders above ₹300',
    validUntil: '2025-12-31'
  },
  { 
    code: 'VEGGIE50', 
    discount: 50, 
    type: 'fixed', 
    minAmount: 1000, 
    description: '₹50 off on vegetable orders',
    validUntil: '2025-08-31'
  }
];

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const navigate = useNavigate();

  // Utility functions
  const formatIndianPrice = useCallback((price) => {
    const numericPrice = Number(price) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice);
  }, []);

  const getSafeItemQuantity = (item) => Math.max(1, Number(item.quantity) || 1);
  const getSafeItemPrice = (item) => Math.max(0, Number(item.price) || 0);

  // Load cart from localStorage - FIXED VERSION
  useEffect(() => {
    const loadCart = () => {
      try {
        console.log('Cart: Loading cart data...');
        let cart = [];
        
        // Method 1: Try cartManager first
        if (window.cartManager && typeof window.cartManager.getCart === 'function') {
          cart = window.cartManager.getCart();
          console.log('Cart: Loaded from cartManager:', cart);
        } 
        // Method 2: Fallback to localStorage
        else {
          const savedCart = localStorage.getItem('cart');
          console.log('Cart: Raw localStorage data:', savedCart);
          if (savedCart) {
            cart = JSON.parse(savedCart);
          }
        }

        // Validate cart items
        const validCart = Array.isArray(cart) 
          ? cart.filter(item => 
              item && 
              typeof item === 'object' && 
              item.id && 
              !isNaN(item.price)
            )
          : [];

        console.log('Cart: Valid cart items:', validCart);
        
        // Update state only if cart actually changed
        setCartItems(prevItems => {
          const prevJson = JSON.stringify(prevItems);
          const newJson = JSON.stringify(validCart);
          if (prevJson !== newJson) {
            console.log('Cart: Cart state updated');
            return validCart;
          }
          return prevItems;
        });
        
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadCart();

    // Subscribe to cart updates using cartManager if available
    let unsubscribe;
    if (window.cartManager && typeof window.cartManager.subscribe === 'function') {
      unsubscribe = window.cartManager.subscribe((cart) => {
        console.log('Cart: Subscription update received:', cart);
        const validCart = Array.isArray(cart) 
          ? cart.filter(item => item && typeof item === 'object' && item.id && !isNaN(item.price))
          : [];
        setCartItems(validCart);
      });
    }

    // Event handlers with debouncing
    let updateTimeout;
    const handleCartUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        console.log('Cart: cartUpdated event received');
        loadCart();
      }, 100);
    };

    const handleCartCountUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        console.log('Cart: cartCountUpdated event received');
        loadCart();
      }, 100);
    };

    // Add event listeners
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartCountUpdated', handleCartCountUpdate);

    // Cleanup
    return () => {
      console.log('Cart: Cleaning up event listeners');
      clearTimeout(updateTimeout);
      
      if (unsubscribe) {
        unsubscribe();
      }
      
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate);
    };
  }, []);

  // Cart operations
  const updateQuantity = useCallback((productId, newQuantity) => {
    const quantity = Math.max(0, Number(newQuantity) || 0);
    
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    
    console.log('Cart: Updating quantity for', productId, 'to', quantity);
    
    // Use cartManager if available
    if (window.cartManager && typeof window.cartManager.updateQuantity === 'function') {
      window.cartManager.updateQuantity(productId, quantity);
    } else {
      // Fallback: Update local state and localStorage
      const updatedItems = cartItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cartItems]);

  const removeFromCart = useCallback((productId) => {
    console.log('Cart: Removing item', productId);
    
    if (window.cartManager && typeof window.cartManager.removeFromCart === 'function') {
      window.cartManager.removeFromCart(productId);
    } else {
      // Fallback: Update local state and localStorage
      const updatedItems = cartItems.filter(item => item.id !== productId);
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cartItems]);

  const emptyCart = useCallback(() => {
    if (cartItems.length === 0) return;
    
    if (window.confirm('Are you sure you want to empty your cart? This action cannot be undone.')) {
      console.log('Cart: Emptying cart');
      
      if (window.cartManager && typeof window.cartManager.clearCart === 'function') {
        window.cartManager.clearCart();
      } else {
        setCartItems([]);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
      }
      setAppliedCoupon(null);
    }
  }, [cartItems.length]);

  // Price calculations
  const getSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const quantity = getSafeItemQuantity(item);
      const price = getSafeItemPrice(item);
      return total + (price * quantity);
    }, 0);
  }, [cartItems]);

  const getDeliveryFee = useCallback(() => {
    const subtotal = getSubtotal();
    return subtotal > 500 ? 0 : 40;
  }, [getSubtotal]);

  const getDiscount = useCallback(() => {
    if (!appliedCoupon) return 0;
    
    const subtotal = getSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.discount) / 100;
    } else {
      return Math.min(appliedCoupon.discount, subtotal);
    }
  }, [appliedCoupon, getSubtotal]);

  const getGstAmount = useCallback(() => {
    const taxableAmount = getSubtotal() - getDiscount();
    return Math.max(0, taxableAmount * 0.05);
  }, [getSubtotal, getDiscount]);

  const getTotal = useCallback(() => {
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const discount = getDiscount();
    const gst = getGstAmount();
    
    return Math.max(0, subtotal + deliveryFee - discount + gst);
  }, [getSubtotal, getDeliveryFee, getDiscount, getGstAmount]);

  // Coupon operations
  const validateCoupon = useCallback((coupon) => {
    const currentDate = new Date();
    const couponExpiry = new Date(coupon.validUntil);
    
    if (currentDate > couponExpiry) {
      return { isValid: false, message: 'This coupon has expired.' };
    }

    const subtotal = getSubtotal();
    if (subtotal < coupon.minAmount) {
      return { 
        isValid: false, 
        message: `Minimum order amount of ${formatIndianPrice(coupon.minAmount)} required for this coupon` 
      };
    }

    return { isValid: true };
  }, [getSubtotal, formatIndianPrice]);

  const applyCoupon = useCallback(() => {
    const code = couponCode.trim();
    if (!code) {
      alert('Please enter a coupon code');
      return;
    }

    const coupon = AVAILABLE_COUPONS.find(
      c => c.code.toLowerCase() === code.toLowerCase()
    );

    if (!coupon) {
      alert('Invalid coupon code. Please check and try again.');
      return;
    }

    const validation = validateCoupon(coupon);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode('');
    setShowCoupons(false);
  }, [couponCode, validateCoupon]);

  const applyCouponFromList = useCallback((coupon) => {
    const validation = validateCoupon(coupon);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setAppliedCoupon(coupon);
    setShowCoupons(false);
  }, [validateCoupon]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // FIXED: Checkout Navigation Function
  const proceedToCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    console.log('=== CHECKOUT DEBUG INFO ===');
    
    // Calculate totals
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const discountAmount = getDiscount();
    const gstAmount = getGstAmount();
    const finalTotal = getTotal();

    console.log('Calculated totals:', { 
      subtotal, 
      deliveryFee, 
      discountAmount, 
      gstAmount, 
      finalTotal 
    });

    // Create order data with proper structure
    const orderData = {
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name || 'Unknown Product',
        price: getSafeItemPrice(item),
        quantity: getSafeItemQuantity(item),
        unit: item.unit || 'kg',
        image: item.image || item.images?.[0] || '/default-image.jpg',
        farmer: item.farmer || 'Local Farmer',
        location: item.location || 'Karnataka',
        organic: item.organic || false,
        rating: item.rating || 4.0
      })),
      total: {
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discountAmount: discountAmount,
        gstAmount: gstAmount,
        finalTotal: finalTotal
      },
      couponCode: appliedCoupon?.code || null,
      timestamp: new Date().toISOString()
    };

    console.log('Order data to be saved:', orderData);
    
    try {
      // Save to localStorage
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      
      // Verify it was saved
      const savedOrder = localStorage.getItem('pendingOrder');
      console.log('Saved order in localStorage:', savedOrder);
      
      console.log('=== END DEBUG INFO ===');
      
      // Navigate to checkout
      console.log('Navigating to checkout page...');
      navigate('/checkout');
      
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error processing your order. Please try again.');
    }
  }, [
    cartItems, 
    getSubtotal, 
    getDeliveryFee, 
    getDiscount, 
    getGstAmount, 
    getTotal, 
    appliedCoupon, 
    navigate
  ]);

  const continueShopping = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const getSavings = useCallback(() => {
    const deliverySavings = getDeliveryFee() === 0 ? 40 : 0;
    const couponSavings = getDiscount();
    return deliverySavings + couponSavings;
  }, [getDeliveryFee, getDiscount]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="cart-title">🛒 Shopping Cart</h1>
              <p className="cart-subtitle">Review your items and proceed to checkout</p>
            </div>
            <div className="col-auto">
              <div className="cart-stats">
                <span className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                {getSavings() > 0 && (
                  <span className="savings-badge">You save {formatIndianPrice(getSavings())}!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="cart-section">
              <div className="section-header">
                <h3 className="section-title">Cart Items</h3>
                {cartItems.length > 0 && (
                  <div className="cart-actions">
                    <button className="btn btn-primary btn-explore" onClick={continueShopping}>
                      🛍️ Continue Shopping
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={emptyCart}>
                      🗑️ Empty Cart
                    </button>
                  </div>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Your cart is empty</h3>
                  <p>Browse our fresh products and add items to your cart</p>
                  <button className="btn btn-primary btn-explore" onClick={continueShopping}>
                    🛍️ Start Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <img 
                          src={item.image || item.images?.[0] || '/default-image.jpg'} 
                          alt={item.name} 
                          className="product-image" 
                          onError={(e) => {
                            e.target.src = '/default-image.jpg';
                          }}
                        />
                        {item.organic && <span className="organic-badge">Organic</span>}
                      </div>
                      
                      <div className="item-details">
                        <h4 className="item-name">{item.name || 'Unknown Product'}</h4>
                        <p className="item-farmer">👨‍🌾 {item.farmer || 'Local Farmer'}</p>
                        <p className="item-location">📍 {item.location || 'Karnataka'}</p>
                        <div className="item-price">
                          {formatIndianPrice(getSafeItemPrice(item))}/{item.unit || 'kg'}
                        </div>
                        {item.rating && (
                          <div className="item-rating">
                            <span className="stars">{"⭐".repeat(Math.floor(item.rating))}</span>
                            <span className="rating-text">({item.rating})</span>
                          </div>
                        )}
                      </div>

                      <div className="item-quantity">
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, getSafeItemQuantity(item) - 1)}
                            disabled={getSafeItemQuantity(item) <= 1}
                          >−</button>
                          <span className="quantity-display">{getSafeItemQuantity(item)}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, getSafeItemQuantity(item) + 1)}
                          >+</button>
                        </div>
                        <div className="item-total">
                          {formatIndianPrice(getSafeItemPrice(item) * getSafeItemQuantity(item))}
                        </div>
                      </div>

                      <button
                        className="item-remove"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="order-summary">
              <div className="summary-header">
                <h3 className="summary-title">Order Summary</h3>
              </div>

              <div className="summary-content">
                <div className="coupon-section">
                  <div className="coupon-header">
                    <h5>Apply Coupon</h5>
                    <button 
                      className="btn-coupon-toggle" 
                      onClick={() => setShowCoupons(!showCoupons)}
                      type="button"
                    >
                      {showCoupons ? 'Hide Coupons' : 'Show All'}
                    </button>
                  </div>
                  
                  {!appliedCoupon ? (
                    <>
                      <div className="coupon-input-group">
                        <input
                          type="text"
                          className="coupon-input"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                        />
                        <button 
                          className="btn-apply" 
                          onClick={applyCoupon} 
                          disabled={!couponCode.trim()}
                          type="button"
                        >
                          Apply
                        </button>
                      </div>

                      {showCoupons && (
                        <div className="available-coupons">
                          <h6>Available Coupons</h6>
                          <div className="coupons-list">
                            {AVAILABLE_COUPONS.map(coupon => (
                              <div 
                                key={coupon.code} 
                                className="available-coupon" 
                                onClick={() => applyCouponFromList(coupon)}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => e.key === 'Enter' && applyCouponFromList(coupon)}
                              >
                                <div className="coupon-info">
                                  <strong>{coupon.code}</strong>
                                  <span className="coupon-discount">
                                    {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `${formatIndianPrice(coupon.discount)} OFF`}
                                  </span>
                                </div>
                                <small>{coupon.description}</small>
                                <div className="coupon-footer">
                                  <span>Min. order: {formatIndianPrice(coupon.minAmount)}</span>
                                  <span className="valid-until">Valid until: {new Date(coupon.validUntil).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="applied-coupon">
                      <div className="coupon-success">
                        <span>✅ Coupon {appliedCoupon.code} applied!</span>
                        <button 
                          className="btn-remove-coupon" 
                          onClick={removeCoupon}
                          type="button"
                        >✕</button>
                      </div>
                      <small className="coupon-description">
                        {appliedCoupon.description} • {appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}% discount` : `${formatIndianPrice(appliedCoupon.discount)} off`}
                      </small>
                    </div>
                  )}
                </div>

                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span>{formatIndianPrice(getSubtotal())}</span>
                  </div>
                  
                  <div className="price-row">
                    <span>Delivery Fee</span>
                    <span>
                      {getDeliveryFee() === 0 ? (
                        <span className="text-success">FREE</span>
                      ) : (
                        formatIndianPrice(getDeliveryFee())
                      )}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="price-row discount">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="text-success">-{formatIndianPrice(getDiscount())}</span>
                    </div>
                  )}

                  <div className="price-row">
                    <span>GST (5%)</span>
                    <span>{formatIndianPrice(getGstAmount())}</span>
                  </div>

                  <div className="price-row total">
                    <span><strong>Total Amount</strong></span>
                    <span><strong>{formatIndianPrice(getTotal())}</strong></span>
                  </div>
                </div>

                {getSavings() > 0 && (
                  <div className="savings-info">
                    <span>💰 You're saving {formatIndianPrice(getSavings())} on this order!</span>
                  </div>
                )}

                <button 
                  className="btn-checkout" 
                  onClick={proceedToCheckout} 
                  disabled={cartItems.length === 0}
                  type="button"
                >
                  🔒 Proceed to Checkout
                  <small>Pay {formatIndianPrice(getTotal())}</small>
                </button>

                <div className="security-badge">
                  <span>🛡️ Secure checkout • 100% Safe & Protected</span>
                </div>
              </div>
            </div>

            <div className="benefits-card">
              <h5>Why Shop With FarmerMarket?</h5>
              <div className="benefits-list">
                <div className="benefit-item"><span>🚚 Free delivery on orders above ₹500</span></div>
                <div className="benefit-item"><span>🔄 Easy returns within 24 hours</span></div>
                <div className="benefit-item"><span>🌱 100% organic certification</span></div>
                <div className="benefit-item"><span>💳 Secure payment options</span></div>
                <div className="benefit-item"><span>⏰ Same day delivery available</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;