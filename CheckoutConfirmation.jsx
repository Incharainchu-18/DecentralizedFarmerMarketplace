import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./CheckoutConfirmation.css";

const CheckoutConfirmation = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || 'null');
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const paymentMethod = localStorage.getItem('selectedPaymentMethod') || 'UPI';

    console.log('Confirmation - Pending Order:', pendingOrder);

    if (!pendingOrder) {
      console.log('No pending order found, redirecting to cart');
      navigate('/cart');
      return;
    }

    const processPayment = setTimeout(() => {
      const orderId = `ORD${Date.now()}`;
      
      const orderDetails = {
        orderId,
        items: pendingOrder.items || [],
        total: pendingOrder.total || {
          subtotal: 0,
          discountAmount: 0,
          gstAmount: 0,
          finalTotal: 0,
          deliveryFee: 0
        },
        address: {
          fullName: userInfo.name || 'Customer',
          mobileNumber: userInfo.mobile || '+91 9876543210',
          houseBuilding: userInfo.address?.split(',')[0] || 'Address not specified',
          areaName: userInfo.address || '',
          city: 'Bangalore',
          district: 'Bangalore Urban',
          state: 'Karnataka',
          pinCode: '560001',
          country: 'India'
        },
        payment: {
          method: paymentMethod,
          finalAmount: pendingOrder.total?.finalTotal || 0,
          coupon: pendingOrder.couponCode ? {
            code: pendingOrder.couponCode,
            discount: pendingOrder.total?.discountAmount || 0
          } : null
        },
        status: 'confirmed',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timestamp: new Date().toISOString(),
        deliverySlot: localStorage.getItem('deliverySlot') || '10:00 AM - 12:00 PM'
      };

      setOrderDetails(orderDetails);
      setPaymentSuccess(true);
      setLoading(false);

      // Clear checkout data
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem('selectedPaymentMethod');
      localStorage.removeItem('deliverySlot');
      
      // Save to orders history
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const orderToSave = {
        id: orderId,
        date: new Date().toISOString(),
        status: 'confirmed',
        items: pendingOrder.items || [],
        total: pendingOrder.total || { subtotal: 0, discountAmount: 0, gstAmount: 0, finalTotal: 0 },
        deliveryAddress: userInfo.address || '',
        deliverySlot: localStorage.getItem('deliverySlot') || '10:00 AM - 12:00 PM',
        paymentMethod: paymentMethod,
        customer: {
          name: userInfo.name || 'Customer',
          mobile: userInfo.mobile || '+91 9876543210',
          email: userInfo.email || ''
        },
        trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}`.padStart(10, '0'),
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      localStorage.setItem('orders', JSON.stringify([orderToSave, ...existingOrders]));
      
      // Clear cart
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));

    }, 2000);

    return () => clearTimeout(processPayment);
  }, [navigate]);

  if (loading) {
    return (
      <div className="checkout-confirmation-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Processing your payment...</p>
          <p className="loading-subtext">Please don't close this window</p>
        </div>
      </div>
    );
  }

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleContinueShopping = () => {
    navigate('/user-dashboard');
  };

  return (
    <div className="checkout-confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <h1>✅ Order Confirmation</h1>
          <div className="confirmation-steps">
            <span className="step completed">1. Cart</span>
            <span className="step completed">2. Checkout</span>
            <span className="step active">3. Confirmation</span>
          </div>
        </div>

        {paymentSuccess && orderDetails && (
          <div className="confirmation-content">
            <div className="success-animation">
              <div className="success-icon">🎉</div>
            </div>
            
            <div className="success-message">
              <h2>Payment Successful!</h2>
              <p>Your order has been placed successfully and is being processed</p>
              <div className="order-id">Order ID: <strong>{orderDetails.orderId}</strong></div>
            </div>

            <div className="order-details-grid">
              <div className="detail-card">
                <h3>📦 Order Summary</h3>
                <div className="order-items-list">
                  {orderDetails.items.map((item, index) => (
                    <div key={item.id || `item-${index}`} className="order-item-confirm">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">{item.quantity} {item.unit || 'kg'}</span>
                      </div>
                      <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>₹{orderDetails.total.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {orderDetails.total.discountAmount > 0 && (
                    <div className="price-row discount">
                      <span>Discount:</span>
                      <span>-₹{orderDetails.total.discountAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                  <div className="price-row">
                    <span>GST (5%):</span>
                    <span>₹{orderDetails.total.gstAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="price-row">
                    <span>Delivery:</span>
                    <span>{orderDetails.total.deliveryFee === 0 ? 'FREE' : `₹${orderDetails.total.deliveryFee?.toFixed(2) || '0.00'}`}</span>
                  </div>
                  <div className="price-row total">
                    <span><strong>Total Amount:</strong></span>
                    <span><strong>₹{orderDetails.total.finalTotal?.toFixed(2) || '0.00'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h3>📍 Delivery Address</h3>
                <div className="address-details">
                  <p>
                    <strong>{orderDetails.address.fullName}</strong><br/>
                    {orderDetails.address.houseBuilding}<br/>
                    {orderDetails.address.areaName && `${orderDetails.address.areaName}, `}
                    {orderDetails.address.city}, {orderDetails.address.district}<br/>
                    {orderDetails.address.state} - {orderDetails.address.pinCode}<br/>
                    {orderDetails.address.country}
                  </p>
                  <p className="contact-info">
                    <strong>📱 {orderDetails.address.mobileNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="detail-card">
                <h3>💳 Payment Details</h3>
                <div className="payment-details">
                  <p>
                    <strong>Payment Method:</strong><br/>
                    <span className="payment-method">{orderDetails.payment.method.toUpperCase()}</span>
                  </p>
                  <p>
                    <strong>Amount Paid:</strong><br/>
                    <span className="amount-paid">₹{orderDetails.payment.finalAmount.toFixed(2)}</span>
                  </p>
                  {orderDetails.payment.coupon && (
                    <p>
                      <strong>Coupon Applied:</strong><br/>
                      <span className="coupon-applied">
                        {orderDetails.payment.coupon.code} 
                        (₹{orderDetails.payment.coupon.discount.toFixed(2)} off)
                      </span>
                    </p>
                  )}
                  <p className="payment-status success">✅ Payment Successful</p>
                </div>
              </div>

              <div className="detail-card">
                <h3>🚚 Delivery Information</h3>
                <div className="delivery-info">
                  <p>
                    <strong>Status:</strong><br/>
                    <span className="status-confirmed">Order Confirmed</span>
                  </p>
                  <p>
                    <strong>Delivery Slot:</strong><br/>
                    <span className="delivery-slot">{orderDetails.deliverySlot}</span>
                  </p>
                  <p>
                    <strong>Estimated Delivery:</strong><br/>
                    <span className="delivery-date">{orderDetails.estimatedDelivery}</span>
                  </p>
                  <p>
                    <strong>Tracking Number:</strong><br/>
                    <span className="tracking-number">{orderDetails.trackingNumber}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="confirmation-actions">
              <button onClick={handleViewOrders} className="btn btn-primary view-orders-btn">
                📋 View My Orders
              </button>
              <button onClick={handleContinueShopping} className="btn btn-outline continue-shopping-btn">
                🛍️ Continue Shopping
              </button>
              <button onClick={handlePrintReceipt} className="btn btn-secondary print-receipt-btn">
                🖨️ Print Receipt
              </button>
            </div>

            <div className="support-info">
              <div className="support-card">
                <h4>📞 Need Help?</h4>
                <p>Contact our support team at <strong>+91-9876543210</strong></p>
                <p>Email: <strong>support@farmermarket.com</strong></p>
                <p>🕒 Support available: 8:00 AM - 10:00 PM</p>
              </div>
              <div className="email-confirmation">
                <p>✉️ Order confirmation has been sent to your registered email address</p>
                <p>📱 You will receive SMS updates about your order status</p>
              </div>
            </div>

            <div className="farmer-support-message">
              <h4>👨‍🌾 Supporting Local Farmers</h4>
              <p>Thank you for supporting local farmers from Karnataka. Your purchase helps sustain traditional farming practices and rural livelihoods.</p>
            </div>
          </div>
        )}

        {!paymentSuccess && !loading && (
          <div className="payment-failed">
            <div className="error-icon">❌</div>
            <h2>Payment Processing Failed</h2>
            <p>There was an issue processing your payment. Please try again.</p>
            <button onClick={() => navigate('/checkout')} className="btn btn-primary">
              Return to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutConfirmation;