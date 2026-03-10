import React, { useState, useRef, useEffect } from 'react';
import './Profile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  // Load user data from localStorage or use default
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userProfile');
    return savedUser ? JSON.parse(savedUser) : {
      name: 'Inchara',
      email: 'inchuinchara950@gmail.com',
      phone: '+91 7892399975',
      address: 'Bhadravathi, Shivamogga, Karnataka, India-577301',
      avatar: '👧',
      avatarType: 'emoji',
      membership: 'Premium Member',
      joinDate: '2024-01-15'
    };
  });

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(user));
  }, [user]);

  // Avatar options
  const cartoonAvatars = [
    'https://cdn-icons-png.flaticon.com/512/4333/4333607.png',
    'https://cdn-icons-png.flaticon.com/512/4333/4333609.png',
    'https://cdn-icons-png.flaticon.com/512/4333/4333612.png',
    'https://cdn-icons-png.flaticon.com/512/4333/4333614.png',
    'https://cdn-icons-png.flaticon.com/512/4333/4333604.png',
    'https://cdn-icons-png.flaticon.com/512/4333/4333605.png',
  ];

  const emojiAvatars = ['👧', '👦', '👩', '👨', '🐰', '🐻', '🐯', '🐶'];

  // Mock data
  const [coupons] = useState([
    { id: 1, code: 'FARM25', discount: '25% OFF', expiry: '2024-08-30', used: false, description: 'Farm Fresh Products' },
    { id: 2, code: 'WELCOME10', discount: '10% OFF', expiry: '2024-12-31', used: false, description: 'First Order' },
    { id: 3, code: 'FREESHIP', discount: 'Free Shipping', expiry: '2024-07-15', used: true, description: 'Free Delivery' }
  ]);

  const [rewards, setRewards] = useState({
    points: 850,
    level: 'Gold',
    benefits: ['Free Shipping', 'Early Access to New Products', 'Bonus Points', 'Exclusive Farmer Markets']
  });

  const [history] = useState([
    { id: 1, order: '#2845', date: '2024-06-15', amount: '₹124.99', status: 'Delivered', items: ['Organic Tomatoes', 'Fresh Basil'] },
    { id: 2, order: '#2841', date: '2024-06-10', amount: '₹89.99', status: 'Delivered', items: ['Farm Eggs', 'Whole Wheat Bread'] },
    { id: 3, order: '#2835', date: '2024-06-01', amount: '₹199.99', status: 'Processing', items: ['Organic Chicken', 'Fresh Milk'] }
  ]);

  const [payments] = useState([
    { id: 1, type: 'Visa', number: '**** 4567', expiry: '12/25', default: true },
    { id: 2, type: 'PayPal', email: 'inchuinchara950@gmail.com', default: false }
  ]);

  const [cryptoBalance, setCryptoBalance] = useState({
    btc: 0.025,
    eth: 0.15,
    usd: 1250.00
  });

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      // Set stream to video element after a brief delay
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const photoDataUrl = canvas.toDataURL('image/png');
      setUser(prev => ({
        ...prev,
        avatar: photoDataUrl,
        avatarType: 'photo'
      }));
      
      stopCamera();
      setShowPhotoOptions(false);
    }
  };

  // File handling
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser(prev => ({
          ...prev,
          avatar: e.target.result,
          avatarType: 'photo'
        }));
      };
      reader.readAsDataURL(file);
    }
    setShowPhotoOptions(false);
  };

  // Avatar handling
  const handleAvatarChange = (avatar, type = 'emoji') => {
    setUser(prev => ({
      ...prev,
      avatar,
      avatarType: type
    }));
    setShowAvatarSelection(false);
  };

  // Wallet functions
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        // Simulate crypto balance update
        setCryptoBalance(prev => ({
          ...prev,
          btc: 0.025,
          eth: 0.15,
          usd: 1250.00
        }));
      } catch (error) {
        console.error('Wallet connection failed:', error);
        alert('Please connect your MetaMask wallet to continue.');
      }
    } else {
      alert('Please install MetaMask to use crypto features!');
    }
  };

  const buyCrypto = () => {
    alert('Redirecting to crypto purchase platform...');
  };

  const payWithCrypto = () => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    alert('Opening crypto payment interface...');
  };

  // Profile functions
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleEditField = (field, label) => {
    const currentValue = user[field];
    const newValue = prompt(`Edit ${label}:`, currentValue);
    if (newValue !== null && newValue.trim() !== '') {
      setUser(prev => ({ ...prev, [field]: newValue }));
    }
  };

  const applyCoupon = (id) => {
    alert(`Coupon ${id} applied successfully!`);
  };

  const redeemPoints = () => {
    if (rewards.points < 100) {
      alert('You need at least 100 points to redeem rewards!');
      return;
    }
    setRewards(prev => ({ ...prev, points: prev.points - 100 }));
    alert('100 points redeemed successfully!');
  };

  const viewOrderDetails = (order) => {
    alert(`Order Details:\nOrder #: ${order.order}\nDate: ${order.date}\nAmount: ${order.amount}\nStatus: ${order.status}\nItems: ${order.items.join(', ')}`);
  };

  // Render avatar based on type
  const renderAvatar = () => {
    switch (user.avatarType) {
      case 'photo':
        return <img src={user.avatar} alt="Profile" className="avatar-image" />;
      case 'cartoon':
        return <img src={user.avatar} alt="Avatar" className="avatar-image" />;
      default:
        return <span className="avatar-emoji">{user.avatar}</span>;
    }
  };

  // Tab content renderers
  const renderProfileContent = () => (
    <div className="profile-content">
      <div className="info-section">
        <h2 className="section-title">
          <i className="bi bi-person"></i>
          Personal Information
        </h2>
        <div className="info-grid">
          {[
            { icon: '📧', field: 'email', label: 'Email' },
            { icon: '📱', field: 'phone', label: 'Phone' },
            { icon: '📍', field: 'address', label: 'Address' },
            { icon: '🏆', field: 'membership', label: 'Membership', readOnly: true },
            { icon: '📅', field: 'joinDate', label: 'Member Since', readOnly: true }
          ].map((item, index) => (
            <div key={index} className="info-item">
              <span className="info-icon">{item.icon}</span>
              <span className="info-text">{user[item.field]}</span>
              {!item.readOnly && (
                <button 
                  className="edit-info"
                  onClick={() => handleEditField(item.field, item.label)}
                  title={`Edit ${item.label}`}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{coupons.filter(c => !c.used).length}</div>
          <div className="stat-label">Active Coupons</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rewards.points}</div>
          <div className="stat-label">Reward Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{history.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rewards.level}</div>
          <div className="stat-label">Membership</div>
        </div>
      </div>
    </div>
  );

  const renderCouponsContent = () => (
    <div className="coupons-content">
      <h2 className="section-title">
        <i className="bi bi-ticket-perforated"></i>
        My Coupons
      </h2>
      <div className="coupons-grid">
        {coupons.map(coupon => (
          <div key={coupon.id} className={`coupon-card ${coupon.used ? 'used' : 'active'}`}>
            <div className="coupon-header">
              <div className="coupon-discount">{coupon.discount}</div>
              <div className="coupon-status">{coupon.used ? 'Used' : 'Active'}</div>
            </div>
            <div className="coupon-code">{coupon.code}</div>
            <div className="coupon-description">{coupon.description}</div>
            <div className="coupon-expiry">Expires: {coupon.expiry}</div>
            {!coupon.used && (
              <button 
                className="apply-coupon-btn"
                onClick={() => applyCoupon(coupon.id)}
              >
                Apply Coupon
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderRewardsContent = () => (
    <div className="rewards-content">
      <h2 className="section-title">
        <i className="bi bi-star"></i>
        Rewards & Benefits
      </h2>
      <div className="rewards-header">
        <div className="points-display">
          <div className="points-value">{rewards.points}</div>
          <div className="points-label">Reward Points</div>
        </div>
        <div className="level-badge">{rewards.level} Member</div>
      </div>
      
      <div className="benefits-section">
        <h3>Your Benefits</h3>
        <div className="benefits-list">
          {rewards.benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <i className="bi bi-check-circle"></i>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rewards-actions">
        <button className="btn btn-primary" onClick={redeemPoints}>
          <i className="bi bi-gift"></i>
          Redeem 100 Points
        </button>
      </div>
    </div>
  );

  const renderHistoryContent = () => (
    <div className="history-content">
      <h2 className="section-title">
        <i className="bi bi-clock-history"></i>
        Order History
      </h2>
      <div className="history-list">
        {history.map(order => (
          <div key={order.id} className="order-item">
            <div className="order-main">
              <div className="order-number">Order {order.order}</div>
              <div className="order-date">{order.date}</div>
              <div className="order-items">{order.items.join(', ')}</div>
            </div>
            <div className="order-side">
              <div className="order-amount">{order.amount}</div>
              <div className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </div>
              <button 
                className="view-details-btn"
                onClick={() => viewOrderDetails(order)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentsContent = () => (
    <div className="payments-content">
      <h2 className="section-title">
        <i className="bi bi-credit-card"></i>
        Payment Methods
      </h2>

      <div className="crypto-section">
        <h3>Crypto Wallet</h3>
        <div className="wallet-connection">
          <button 
            className={`wallet-btn ${walletConnected ? 'connected' : ''}`}
            onClick={connectWallet}
          >
            <i className="bi bi-wallet2"></i>
            {walletConnected ? 'Wallet Connected' : 'Connect MetaMask'}
          </button>
          {walletConnected && (
            <div className="wallet-info">
              <span className="wallet-address">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="payment-methods">
        <h3>Payment Methods</h3>
        {payments.map(payment => (
          <div key={payment.id} className={`payment-method ${payment.default ? 'default' : ''}`}>
            <div className="payment-icon">
              {payment.type === 'PayPal' ? '💰' : '💳'}
            </div>
            <div className="payment-details">
              <div className="payment-type">{payment.type}</div>
              <div className="payment-info">
                {payment.number || payment.email}
                {payment.expiry && ` • Expires ${payment.expiry}`}
              </div>
            </div>
            {payment.default && <span className="default-badge">Default</span>}
          </div>
        ))}
      </div>

      <button className="add-payment-btn">
        <i className="bi bi-plus-circle"></i>
        Add Payment Method
      </button>
    </div>
  );

  const renderCryptoContent = () => (
    <div className="crypto-content">
      <h2 className="section-title">
        <i className="bi bi-currency-bitcoin"></i>
        Crypto Wallet
      </h2>

      <div className="crypto-balance-card">
        <div className="crypto-header">
          <div className="crypto-total">
            <div className="total-amount">${cryptoBalance.usd.toLocaleString()}</div>
            <div className="total-label">Total Balance</div>
          </div>
        </div>

        <div className="crypto-assets">
          <div className="crypto-asset">
            <div className="asset-icon">₿</div>
            <div className="asset-info">
              <div className="asset-amount">{cryptoBalance.btc} BTC</div>
              <div className="asset-value">${(cryptoBalance.btc * 45000).toLocaleString()}</div>
            </div>
          </div>
          <div className="crypto-asset">
            <div className="asset-icon">Ξ</div>
            <div className="asset-info">
              <div className="asset-amount">{cryptoBalance.eth} ETH</div>
              <div className="asset-value">${(cryptoBalance.eth * 3000).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="crypto-actions">
          <button className="crypto-action-btn" onClick={buyCrypto}>
            <i className="bi bi-arrow-down-circle"></i>
            Buy Crypto
          </button>
          <button className="crypto-action-btn" onClick={payWithCrypto}>
            <i className="bi bi-send"></i>
            Send Crypto
          </button>
          <button className="crypto-action-btn" onClick={connectWallet}>
            <i className="bi bi-wallet2"></i>
            {walletConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="settings-content">
      <h2 className="section-title">
        <i className="bi bi-gear"></i>
        Settings
      </h2>
      
      <div className="settings-grid">
        <div className="setting-item">
          <label>Email Notifications</label>
          <div className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </div>
        </div>
        
        <div className="setting-item">
          <label>Push Notifications</label>
          <div className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </div>
        </div>
        
        <div className="setting-item">
          <label>Crypto Payments</label>
          <div className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </div>
        </div>
        
        <div className="setting-item">
          <label>Two-Factor Authentication</label>
          <div className="toggle-switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-outline-primary">
          <i className="bi bi-download"></i>
          Export Data
        </button>
        <button className="btn btn-outline-danger">
          <i className="bi bi-trash"></i>
          Delete Account
        </button>
      </div>
    </div>
  );

  // Main render function
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileContent();
      case 'coupons': return renderCouponsContent();
      case 'rewards': return renderRewardsContent();
      case 'history': return renderHistoryContent();
      case 'payments': return renderPaymentsContent();
      case 'crypto': return renderCryptoContent();
      case 'settings': return renderSettingsContent();
      default: return renderProfileContent();
    }
  };

  return (
    <div className="profile-container">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-container">
            <div className="avatar">
              {renderAvatar()}
            </div>
            <button
              className="edit-avatar-btn"
              onClick={() => setShowPhotoOptions(!showPhotoOptions)}
              title="Change avatar"
            >
              <i className="bi bi-camera"></i>
            </button>
          </div>

          {/* Photo Options */}
          {showPhotoOptions && (
            <div className="photo-options">
              <button className="photo-option" onClick={startCamera}>
                <i className="bi bi-camera"></i>
                Take Photo
              </button>
              <button className="photo-option" onClick={handleFileSelect}>
                <i className="bi bi-image"></i>
                Choose Photo
              </button>
              <button 
                className="photo-option"
                onClick={() => {
                  setShowAvatarSelection(true);
                  setShowPhotoOptions(false);
                }}
              >
                <i className="bi bi-emoji-smile"></i>
                Choose Avatar
              </button>
              <button 
                className="photo-option close"
                onClick={() => setShowPhotoOptions(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1 className="user-name">{user.name}</h1>
          <p className="user-membership">{user.membership}</p>
          <div className="profile-stats">
            <span>{rewards.points} Points</span>
            <span>{coupons.filter(c => !c.used).length} Active Coupons</span>
            <span>{history.length} Orders</span>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="btn btn-primary"
            onClick={() => handleEditField('name', 'Name')}
          >
            <i className="bi bi-pencil"></i>
            Edit Profile
          </button>
          <button className="btn btn-outline-secondary">
            <i className="bi bi-share"></i>
            Share Profile
          </button>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="camera-modal">
          <div className="camera-modal-content">
            <div className="camera-header">
              <h3>Take a Photo</h3>
              <button className="close-camera" onClick={stopCamera}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <video 
              ref={videoRef} 
              className="camera-preview" 
              autoPlay 
              playsInline 
            />
            <div className="camera-controls">
              <button className="capture-btn" onClick={takePhoto}>
                <i className="bi bi-circle"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarSelection && (
        <div className="avatar-modal">
          <div className="avatar-modal-content">
            <div className="avatar-modal-header">
              <h3>Choose an Avatar</h3>
              <button 
                className="close-avatar"
                onClick={() => setShowAvatarSelection(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <div className="avatar-categories">
              <h4>Cartoon Avatars</h4>
              <div className="avatar-grid">
                {cartoonAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    className={`avatar-option ${
                      user.avatar === avatar && user.avatarType === 'cartoon' ? 'selected' : ''
                    }`}
                    onClick={() => handleAvatarChange(avatar, 'cartoon')}
                  >
                    <img src={avatar} alt={`Cartoon ${index + 1}`} />
                  </button>
                ))}
              </div>

              <h4>Emoji Avatars</h4>
              <div className="avatar-grid">
                {emojiAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    className={`avatar-option ${
                      user.avatar === avatar && user.avatarType === 'emoji' ? 'selected' : ''
                    }`}
                    onClick={() => handleAvatarChange(avatar, 'emoji')}
                  >
                    <span className="avatar-emoji">{avatar}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="profile-body">
        <nav className="profile-sidebar">
          {[
            { id: 'profile', icon: 'bi-person', label: 'Profile' },
            { id: 'coupons', icon: 'bi-ticket-perforated', label: 'Coupons' },
            { id: 'rewards', icon: 'bi-star', label: 'Rewards' },
            { id: 'history', icon: 'bi-clock-history', label: 'History' },
            { id: 'payments', icon: 'bi-credit-card', label: 'Payments' },
            { id: 'crypto', icon: 'bi-currency-bitcoin', label: 'Crypto' },
            { id: 'settings', icon: 'bi-gear', label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          
          <button className="sidebar-item logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </nav>

        <main className="profile-main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default UserProfile;