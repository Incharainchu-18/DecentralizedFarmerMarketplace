import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pendingOrder = localStorage.getItem('pendingOrder');
    const cartItems = localStorage.getItem('cart');
    
    console.log('Checkout - pendingOrder:', pendingOrder);
    console.log('Checkout - cartItems:', cartItems);
    
    // If no pendingOrder but cart exists, create order data from cart
    if (!pendingOrder && cartItems) {
      try {
        const items = JSON.parse(cartItems);
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const gstAmount = subtotal * 0.05;
        const deliveryFee = subtotal > 300 ? 0 : 40;
        const finalTotal = subtotal + gstAmount + deliveryFee;

        const newOrderData = {
          items: items,
          total: {
            subtotal: subtotal,
            gstAmount: gstAmount,
            deliveryFee: deliveryFee,
            discountAmount: 0,
            finalTotal: finalTotal
          },
          couponCode: null
        };

        console.log('Checkout - Created new order data:', newOrderData);
        localStorage.setItem('pendingOrder', JSON.stringify(newOrderData));
        setOrderData(newOrderData);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error creating order from cart:', error);
        navigate('/cart');
        return;
      }
    }

    // If pendingOrder exists, use it
    if (pendingOrder) {
      try {
        const order = JSON.parse(pendingOrder);
        console.log('Checkout - Parsed pending order:', order);
        
        if (!order.items || !order.total) {
          console.log('Checkout - Invalid order structure, redirecting to cart');
          navigate('/cart');
          return;
        }
        
        setOrderData(order);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing order:', error);
        navigate('/cart');
      }
    } else {
      console.log('Checkout - No cart data found, redirecting to cart');
      navigate('/cart');
    }
  }, [navigate]);

  const calculateFinalTotal = () => {
    if (!orderData) return 0;

    if (orderData.total && typeof orderData.total.finalTotal === 'number') {
      return orderData.total.finalTotal;
    }

    if (typeof orderData.total === 'number') {
      return orderData.total;
    }

    if (orderData.items && Array.isArray(orderData.items)) {
      const subtotal = orderData.items.reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 0;
        return total + (itemPrice * itemQuantity);
      }, 0);
      
      const gstAmount = subtotal * 0.05;
      const deliveryFee = subtotal > 300 ? 0 : 40;
      return subtotal + gstAmount + deliveryFee;
    }

    return 0;
  };

  const handleStartCheckout = () => {
    if (orderData) {
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    }
    navigate('/checkout/address');
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="checkout-page">
        <div className="error-container">
          <h2>No Order Data</h2>
          <p>Unable to load order information. Please try again.</p>
          <button onClick={() => navigate('/cart')} className="btn btn-primary">
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  const finalTotal = calculateFinalTotal();

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your purchase in a few simple steps</p>
        </div>

        <div className="checkout-steps">
          <div className="step-card" onClick={() => navigate('/checkout/address')}>
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Delivery Address</h3>
              <p>Add your delivery information</p>
            </div>
            <div className="step-arrow">→</div>
          </div>

          <div className="step-card" onClick={() => navigate('/checkout/payment')}>
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Payment Method</h3>
              <p>Choose how you want to pay</p>
            </div>
            <div className="step-arrow">→</div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Confirmation</h3>
              <p>Review and confirm your order</p>
            </div>
            <div className="step-arrow">→</div>
          </div>
        </div>

        <div className="order-summary-checkout">
          <h3>Order Summary</h3>
          {orderData.items && orderData.items.length > 0 ? (
            <>
              {orderData.items.map((item, index) => (
                <div key={item.id || index} className="order-item-checkout">
                  <span>{item.name || `Item ${index + 1}`} × {item.quantity || 1}</span>
                  <span>₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div className="order-total-checkout">
                <strong>Total: ₹{finalTotal.toFixed(2)}</strong>
              </div>
            </>
          ) : (
            <p>No items in order</p>
          )}
        </div>

        <div className="checkout-actions">
          <button onClick={() => navigate('/cart')} className="btn btn-outline">
            ← Back to Cart
          </button>
          <button 
            onClick={handleStartCheckout} 
            className="btn btn-primary"
            disabled={!orderData.items || orderData.items.length === 0}
          >
            Start Checkout →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;