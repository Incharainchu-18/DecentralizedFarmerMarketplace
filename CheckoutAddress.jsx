import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./CheckoutAddress.css";

const CheckoutAddress = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    houseBuilding: '',
    areaName: '',
    nearByLocation: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pinCode: ''
  });
  const [deliverySlot, setDeliverySlot] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const deliverySlots = [
    { id: 1, time: '9:00 AM - 11:00 AM', available: true },
    { id: 2, time: '11:00 AM - 1:00 PM', available: true },
    { id: 3, time: '1:00 PM - 3:00 PM', available: true },
    { id: 4, time: '3:00 PM - 5:00 PM', available: true },
    { id: 5, time: '5:00 PM - 7:00 PM', available: true }
  ];

  const states = [
    'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh',
    'Telangana', 'Goa', 'Delhi', 'Uttar Pradesh', 'West Bengal',
    'Gujarat', 'Rajasthan', 'Punjab', 'Haryana', 'Madhya Pradesh'
  ];

  useEffect(() => {
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (!pendingOrder) {
      alert('No order found! Please add items to cart first.');
      navigate('/cart');
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser.name) {
      setUserInfo(savedUser);
      setFormData(prev => ({
        ...prev,
        fullName: savedUser.name || '',
        mobileNumber: savedUser.mobile || '',
        email: savedUser.email || '',
        ...parseAddress(savedUser.address || '')
      }));
    }

    const availableSlot = deliverySlots.find(slot => slot.available);
    if (availableSlot) {
      setDeliverySlot(availableSlot.time);
    }
  }, [navigate]);

  const parseAddress = (address) => {
    if (!address) return {};
    
    const parts = address.split(',');
    return {
      houseBuilding: parts[0]?.trim() || '',
      areaName: parts[1]?.trim() || '',
      city: parts[2]?.trim() || 'Bangalore',
      district: parts[2]?.trim() || 'Bangalore Urban',
      state: 'Karnataka',
      pinCode: '560001'
    };
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'mobileNumber', 'houseBuilding', 'areaName', 'city', 'district', 'state', 'pinCode'];
    
    for (let field of requiredFields) {
      if (!formData[field]?.trim()) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }

    if (formData.mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (formData.pinCode.length !== 6) {
      alert('Please enter a valid 6-digit PIN code');
      return false;
    }

    if (!deliverySlot) {
      alert('Please select a delivery slot');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      name: formData.fullName,
      mobile: formData.mobileNumber,
      email: formData.email,
      address: `${formData.houseBuilding}, ${formData.areaName}, ${formData.city}, ${formData.district}, ${formData.state} - ${formData.pinCode}`
    };
    localStorage.setItem('user', JSON.stringify(userData));

    localStorage.setItem('deliverySlot', deliverySlot);

    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
    const updatedOrder = {
      ...pendingOrder,
      deliveryAddress: userData.address,
      customer: {
        name: formData.fullName,
        mobile: formData.mobileNumber,
        email: formData.email
      }
    };
    localStorage.setItem('pendingOrder', JSON.stringify(updatedOrder));

    navigate('/checkout/payment');
  };

  const formatAddressPreview = () => {
    if (!formData.houseBuilding || !formData.areaName) return null;
    
    return `${formData.houseBuilding}, ${formData.areaName}, ${formData.city}, ${formData.state} - ${formData.pinCode}`;
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-to-cart-btn" onClick={() => navigate('/cart')}>
            ← Back to Cart
          </button>
          <h1>📍 Delivery Information</h1>
          <div className="checkout-steps">
            <span className="step completed">1. Cart</span>
            <span className="step active">2. Address</span>
            <span className="step">3. Payment</span>
            <span className="step">4. Confirmation</span>
          </div>
        </div>

        <div className="address-content">
          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-section">
              <h3>👤 Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    maxLength="10"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email for updates"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>🏠 Delivery Address</h3>
              <div className="form-group">
                <label>House/Building No. *</label>
                <input
                  type="text"
                  name="houseBuilding"
                  value={formData.houseBuilding}
                  onChange={handleChange}
                  required
                  placeholder="House no. and building name"
                />
              </div>
              <div className="form-group">
                <label>Area Name *</label>
                <input
                  type="text"
                  name="areaName"
                  value={formData.areaName}
                  onChange={handleChange}
                  required
                  placeholder="Area/Locality name"
                />
              </div>
              <div className="form-group">
                <label>Nearby Location (Landmark)</label>
                <input
                  type="text"
                  name="nearByLocation"
                  value={formData.nearByLocation}
                  onChange={handleChange}
                  placeholder="Nearby landmark for easy delivery"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>District *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    placeholder="District"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <select name="state" value={formData.state} onChange={handleChange} required>
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    required
                    maxLength="6"
                    placeholder="6-digit PIN code"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled
                  className="disabled-input"
                />
              </div>

              {formatAddressPreview() && (
                <div className="address-preview">
                  <h4>📍 Address Preview:</h4>
                  <p>{formatAddressPreview()}</p>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>⏰ Choose Delivery Slot</h3>
              <div className="delivery-slots">
                {deliverySlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`delivery-slot ${deliverySlot === slot.time ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
                    onClick={() => slot.available && setDeliverySlot(slot.time)}
                  >
                    <span className="slot-time">{slot.time}</span>
                    {!slot.available && <span className="slot-status">Full</span>}
                    {deliverySlot === slot.time && <span className="slot-selected">✓</span>}
                  </div>
                ))}
              </div>
              <p className="slot-note">
                🚚 Free delivery on orders above ₹500 • Same-day delivery available
              </p>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/cart')} className="btn btn-outline back-btn">
                ← Back to Cart
              </button>
              <button type="submit" className="btn btn-primary continue-btn" disabled={!deliverySlot}>
                Continue to Payment →
              </button>
            </div>
          </form>

          <div className="order-summary-sidebar">
            <div className="summary-card">
              <h3>📋 Order Summary</h3>
              <div className="delivery-info-preview">
                <p><strong>Delivery Slot:</strong></p>
                <p className="selected-slot">{deliverySlot || 'Not selected'}</p>
                {formatAddressPreview() && (
                  <>
                    <p><strong>Delivery To:</strong></p>
                    <p className="address-preview-text">
                      {formData.fullName}<br/>
                      {formatAddressPreview()}
                    </p>
                  </>
                )}
              </div>
              <div className="security-badge">
                <span>🔒 Your information is secure and encrypted</span>
              </div>
            </div>

            <div className="support-card">
              <h4>📞 Need Help?</h4>
              <p>Contact us: <strong>+91-9876543210</strong></p>
              <p>Email: <strong>support@farmermarket.com</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddress;