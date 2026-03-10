import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./CheckoutPayment.css";

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState({
    bank: '',
    accountNumber: '',
    reAccountNumber: '',
    ifscCode: '',
    accountName: ''
  });
  const [showUPIScanner, setShowUPIScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const banks = [
    'HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank',
    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank'
  ];

  const availableOffers = [
    { code: 'FARM25', discount: 25, type: 'percentage', minAmount: 500, description: '25% off on farm fresh products' },
    { code: 'WELCOME10', discount: 10, type: 'percentage', minAmount: 200, description: '10% off on your first order' },
    { code: 'FREESHIP', discount: 40, type: 'fixed', minAmount: 300, description: 'Free shipping on orders above ₹300' },
    { code: 'VEGGIE50', discount: 50, type: 'fixed', minAmount: 1000, description: '₹50 off on vegetable orders' }
  ];

  const paymentMethods = [
    { id: 'upi', name: 'UPI Payment', icon: '📱', description: 'PhonePe, Google Pay, Paytm', popular: true },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer', popular: false },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, RuPay', popular: false },
    { id: 'wallet', name: 'Digital Wallet', icon: '💰', description: 'MetaMask', popular: false },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive', popular: false }
  ];

  // Safe calculation functions
  const calculateSubtotal = () => {
    if (!orderSummary?.items) return 0;
    return orderSummary.items.reduce((total, item) => {
      const price = item?.price || 0;
      const quantity = item?.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateGST = (subtotal) => {
    return subtotal * 0.05;
  };

  const calculateDeliveryFee = (subtotal) => {
    return subtotal > 300 ? 0 : 40;
  };

  const calculateFinalTotal = (subtotal, deliveryFee, gstAmount, discountAmount = 0) => {
    return subtotal + deliveryFee + gstAmount - discountAmount; // Fixed typo: subttotal -> subtotal
  };

  useEffect(() => {
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (!pendingOrder) {
      console.log('No pending order found, redirecting to cart');
      navigate('/cart');
      return;
    }

    try {
      const order = JSON.parse(pendingOrder);
      console.log('Payment - Parsed order:', order);
      
      // Calculate values safely
      const subtotal = calculateSubtotal();
      const deliveryFee = calculateDeliveryFee(subtotal);
      const gstAmount = calculateGST(subtotal);
      const finalTotal = calculateFinalTotal(subtotal, deliveryFee, gstAmount);

      const safeOrder = {
        ...order,
        items: order?.items || [],
        total: {
          subtotal: order?.total?.subtotal || subtotal,
          deliveryFee: order?.total?.deliveryFee || deliveryFee,
          gstAmount: order?.total?.gstAmount || gstAmount,
          discountAmount: order?.total?.discountAmount || 0,
          finalTotal: order?.total?.finalTotal || finalTotal
        },
        couponCode: order?.couponCode || null
      };

      setOrderSummary(safeOrder);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing order:', error);
      navigate('/cart');
    }
  }, [navigate]);

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    const offer = availableOffers.find(o => o.code.toLowerCase() === couponCode.toLowerCase().trim());
    if (!offer) {
      alert('Invalid coupon code. Please check and try again.');
      return;
    }

    const subtotal = calculateSubtotal();
    if (subtotal < offer.minAmount) {
      alert(`Minimum order amount of ₹${offer.minAmount} required for this coupon`);
      return;
    }

    setAppliedCoupon(offer);
    const discountAmount = offer.type === 'percentage' 
      ? (subtotal * offer.discount) / 100 
      : offer.discount;

    const deliveryFee = calculateDeliveryFee(subtotal);
    const gstAmount = calculateGST(subtotal);
    const finalTotal = calculateFinalTotal(subtotal, deliveryFee, gstAmount, discountAmount);

    const updatedOrder = {
      ...orderSummary,
      total: {
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        gstAmount: gstAmount,
        discountAmount: discountAmount,
        finalTotal: finalTotal
      },
      couponCode: offer.code
    };

    setOrderSummary(updatedOrder);
    localStorage.setItem('pendingOrder', JSON.stringify(updatedOrder));
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee(subtotal);
    const gstAmount = calculateGST(subtotal);
    const finalTotal = calculateFinalTotal(subtotal, deliveryFee, gstAmount);

    const updatedOrder = {
      ...orderSummary,
      total: {
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        gstAmount: gstAmount,
        discountAmount: 0,
        finalTotal: finalTotal
      },
      couponCode: null
    };

    setOrderSummary(updatedOrder);
    localStorage.setItem('pendingOrder', JSON.stringify(updatedOrder));
  };

  const handleBankChange = (field, value) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleUPIPayment = () => {
    setShowUPIScanner(true);
    
    const finalTotal = orderSummary?.total?.finalTotal || calculateSubtotal();
    const upiLinks = [
      `upi://pay?pa=farmermarket@upi&pn=FarmerMarket&am=${finalTotal}&cu=INR`,
      `tez://upi/pay?pa=farmermarket@upi&pn=FarmerMarket`,
      `paytmmp://upi/pay?pa=farmermarket@upi&pn=FarmerMarket`
    ];
    
    setTimeout(() => {
      upiLinks.forEach(link => {
        window.open(link, '_blank');
      });
    }, 500);
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        setIsProcessing(true);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
        handlePayment();
        
      } catch (error) {
        console.error('MetaMask payment failed:', error);
        alert(`Crypto payment failed: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert('Please install MetaMask to pay with cryptocurrency!');
    }
  };

  const validateForm = () => {
    if (paymentMethod === 'bank') {
      if (!bankDetails.bank || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountName) {
        alert('Please fill all bank details');
        return false;
      }
      if (bankDetails.accountNumber !== bankDetails.reAccountNumber) {
        alert('Account numbers do not match');
        return false;
      }
    }
    return true;
  };

  const handlePayment = () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    localStorage.setItem('selectedPaymentMethod', paymentMethod);
    
    if (paymentMethod === 'bank') {
      localStorage.setItem('bankDetails', JSON.stringify(bankDetails));
    }

    setTimeout(() => {
      setIsProcessing(false);
      navigate('/checkout/confirmation');
    }, 2000);
  };

  const getPaymentInstructions = () => {
    switch (paymentMethod) {
      case 'upi':
        return (
          <div className="payment-instructions">
            {showUPIScanner ? (
              <div className="upi-scanner-active">
                <div className="qr-code-container">
                  <div className="qr-code">
                    <div className="qr-placeholder">
                      <span>📱</span>
                      <p>Scan to Pay</p>
                      <small>UPI QR Code</small>
                    </div>
                  </div>
                </div>
                <div className="upi-details">
                  <div className="upi-id-section">
                    <p><strong>UPI ID:</strong></p>
                    <p className="upi-id-value">farmermarket@upi</p>
                    <button className="copy-upi-btn" onClick={() => navigator.clipboard.writeText('farmermarket@upi')}>
                      Copy UPI ID
                    </button>
                  </div>
                </div>
                <button className="simulate-payment-btn" onClick={handlePayment}>
                  Simulate UPI Payment
                </button>
              </div>
            ) : (
              <div className="upi-initial">
                <button className="upi-scan-btn" onClick={handleUPIPayment}>
                  📱 Scan QR Code to Pay
                </button>
                <p className="upi-alternative">
                  or use UPI ID: <strong>farmermarket@upi</strong>
                </p>
              </div>
            )}
          </div>
        );
      
      case 'bank':
        return (
          <div className="payment-instructions">
            <div className="bank-transfer-form">
              <div className="form-group">
                <label>Select Bank *</label>
                <select value={bankDetails.bank} onChange={(e) => handleBankChange('bank', e.target.value)} required>
                  <option value="">Choose your bank</option>
                  {banks.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => handleBankChange('accountName', e.target.value)}
                  placeholder="Enter account holder name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Re-enter Account Number *</label>
                <input
                  type="text"
                  value={bankDetails.reAccountNumber}
                  onChange={(e) => handleBankChange('reAccountNumber', e.target.value)}
                  placeholder="Re-enter account number"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>IFSC Code *</label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => handleBankChange('ifscCode', e.target.value)}
                  placeholder="Enter IFSC code"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 'wallet':
        return (
          <div className="payment-instructions">
            <div className="wallet-options">
              <button className="wallet-btn metamask" onClick={connectMetaMask}>
                Pay with MetaMask
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="payment-instructions">
            <p>Select {paymentMethod} to proceed with payment</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!orderSummary) {
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

  // Calculate safe values
  const subtotal = calculateSubtotal();
  const deliveryFee = orderSummary?.total?.deliveryFee || calculateDeliveryFee(subtotal);
  const gstAmount = orderSummary?.total?.gstAmount || calculateGST(subtotal);
  const discountAmount = orderSummary?.total?.discountAmount || 0;
  const finalTotal = orderSummary?.total?.finalTotal || calculateFinalTotal(subtotal, deliveryFee, gstAmount, discountAmount);

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>💳 Payment Method</h1>
          <div className="checkout-steps">
            <span className="step completed">1. Cart</span>
            <span className="step completed">2. Address</span>
            <span className="step active">3. Payment</span>
            <span className="step">4. Confirmation</span>
          </div>
        </div>

        <div className="payment-content">
          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            
            <div className="payment-options-grid">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`payment-option ${paymentMethod === method.id ? 'selected' : ''} ${method.popular ? 'popular' : ''}`}
                  onClick={() => {
                    setPaymentMethod(method.id);
                    setShowUPIScanner(false);
                  }}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-info">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                  {method.popular && <span className="popular-badge">Popular</span>}
                  {paymentMethod === method.id && <div className="method-selected">✓</div>}
                </div>
              ))}
            </div>

            <div className="payment-instructions-section">
              {getPaymentInstructions()}
            </div>

            <div className="coupon-section">
              <h3>🎁 Apply Coupon Code</h3>
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                  onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                />
                {appliedCoupon ? (
                  <button type="button" onClick={removeCoupon} className="remove-coupon-btn">
                    Remove
                  </button>
                ) : (
                  <button type="button" onClick={applyCoupon} className="apply-coupon-btn">
                    Apply
                  </button>
                )}
              </div>

              {appliedCoupon && (
                <div className="applied-coupon">
                  <span>✅ Coupon Applied: {appliedCoupon.code}</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-summary-payment">
            <div className="summary-card">
              <h3>📋 Order Summary</h3>
              
              <div className="order-items-list">
                {orderSummary.items?.map((item, index) => (
                  <div key={item.id || `item-${index}`} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.name || `Item ${index + 1}`}</span>
                      <span className="item-quantity">{item.quantity || 1} {item.unit || 'kg'}</span>
                    </div>
                    <span className="item-price">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                )) || <p>No items in order</p>}
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="price-row">
                  <span>Delivery Fee:</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      `₹${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="price-row discount">
                    <span>Discount ({orderSummary.couponCode}):</span>
                    <span className="text-success">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="price-row">
                  <span>GST (5%):</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                
                <div className="price-row total">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>₹{finalTotal.toFixed(2)}</strong></span>
                </div>
              </div>

              <button className={`pay-now-btn ${isProcessing ? 'processing' : ''}`} onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <div className="processing-spinner"></div>
                    Processing...
                  </>
                ) : (
                  paymentMethod === 'cod' ? 
                  `Place Order - ₹${finalTotal.toFixed(2)}` : 
                  `Pay ₹${finalTotal.toFixed(2)}`
                )}
              </button>

              <button onClick={() => navigate('/checkout/address')} className="back-to-address">
                ← Back to Address
              </button>

              <div className="security-badge">
                <span>🔒 Secure Payment • SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;