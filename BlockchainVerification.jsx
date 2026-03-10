// src/pages/BlockchainVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  FileText,
  Copy,
  Download,
  Plus,
  Hash,
  User,
  MapPin,
  Calendar,
  Scale,
  Star
} from 'lucide-react';
import './BlockchainVerification.css';

const BlockchainVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactionId, setTransactionId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [generatedTxId, setGeneratedTxId] = useState('');

  const [newProduct, setNewProduct] = useState({
    productName: '',
    farmerName: '',
    farmLocation: '',
    harvestDate: '',
    quantity: '',
    quality: 'Grade A'
  });

  // Initialize sample data and load from localStorage
  useEffect(() => {
    initializeSampleData();
    const savedVerifications = localStorage.getItem('recentVerifications');
    
    if (savedVerifications) {
      setRecentVerifications(JSON.parse(savedVerifications));
    }

    // Check if product data was passed from Products page
    if (location.state?.productVerificationId) {
      setTransactionId(location.state.productVerificationId);
      // Auto-verify the product
      setTimeout(() => {
        handlePreloadedVerification(location.state.productVerificationId, location.state.productDetails);
      }, 500);
    }
  }, [location]);

  // Initialize sample data if not exists
  const initializeSampleData = () => {
    const savedUser = localStorage.getItem('farmerProfile');
    const user = savedUser ? JSON.parse(savedUser) : { id: 1, name: 'John Farmer' };
    
    // Initialize registered products if empty
    const registeredProducts = JSON.parse(localStorage.getItem('registeredProducts') || '{}');
    if (Object.keys(registeredProducts).length === 0) {
      const sampleProducts = {
        'KRISHI-001': {
          productName: 'Organic Wheat Sharbati',
          farmerName: user.name,
          farmLocation: 'Punjab, India',
          harvestDate: '2024-01-15',
          quantity: '500 kg',
          quality: 'Grade A',
          batchNumber: 'BATCH-WHE-240115-ABC123',
          transactionId: 'KRISHI-001',
          timestamp: new Date().toISOString(),
          status: 'registered'
        },
        'KRISHI-002': {
          productName: 'Premium Basmati Rice',
          farmerName: user.name,
          farmLocation: 'Haryana, India',
          harvestDate: '2024-01-10',
          quantity: '300 kg',
          quality: 'Premium',
          batchNumber: 'BATCH-RIC-240110-DEF456',
          transactionId: 'KRISHI-002',
          timestamp: new Date().toISOString(),
          status: 'registered'
        }
      };
      localStorage.setItem('registeredProducts', JSON.stringify(sampleProducts));
    }

    // Initialize recent verifications if empty
    const savedRecent = localStorage.getItem('recentVerifications');
    if (!savedRecent) {
      const sampleVerifications = [
        {
          id: 'KRISHI-001',
          product: 'Organic Wheat Sharbati',
          farmer: user.name,
          date: new Date().toLocaleDateString(),
          status: 'verified',
          hash: '0x1a2b3c4d5e6f7890...'
        },
        {
          id: 'KRISHI-002',
          product: 'Premium Basmati Rice',
          farmer: user.name,
          date: new Date().toLocaleDateString(),
          status: 'verified',
          hash: '0x2b3c4d5e6f789012...'
        }
      ];
      setRecentVerifications(sampleVerifications);
      localStorage.setItem('recentVerifications', JSON.stringify(sampleVerifications));
    }
  };

  const handlePreloadedVerification = async (verificationId, productDetails) => {
    setLoading(true);
    
    // Simulate API call to blockchain
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockResult = {
      success: true,
      transaction: {
        id: verificationId,
        product: productDetails.name,
        farmer: productDetails.farmerName,
        farmLocation: productDetails.location,
        harvestDate: productDetails.harvestDate,
        quantity: productDetails.quantity,
        quality: productDetails.quality,
        batchNumber: productDetails.batchNumber,
        timestamp: productDetails.createdAt,
        blockNumber: Math.floor(Math.random() * 1000000),
        hash: productDetails.blockchainHash,
        status: 'verified'
      },
      supplyChain: generateSupplyChain(productDetails)
    };

    setVerificationResult(mockResult);
    setLoading(false);
  };

  const generateSupplyChain = (product) => {
    const harvestDate = new Date(product.harvestDate || new Date());
    return [
      {
        step: 'Seed Sowing',
        timestamp: new Date(harvestDate.getTime() - 120 * 86400000).toISOString().split('T')[0] + ' 08:00:00',
        location: product.location || 'Farm Field',
        verified: true
      },
      {
        step: 'Crop Growth',
        timestamp: new Date(harvestDate.getTime() - 60 * 86400000).toISOString().split('T')[0] + ' 10:30:00',
        location: product.location || 'Farm Field',
        verified: true
      },
      {
        step: 'Harvesting',
        timestamp: (product.harvestDate || new Date().toISOString().split('T')[0]) + ' 08:00:00',
        location: product.location || 'Farm Field',
        verified: true
      },
      {
        step: 'Quality Check',
        timestamp: new Date(harvestDate.getTime() + 86400000).toISOString().split('T')[0] + ' 10:30:00',
        location: 'Quality Lab',
        verified: true
      },
      {
        step: 'Packaging',
        timestamp: new Date(harvestDate.getTime() + 172800000).toISOString().split('T')[0] + ' 14:15:00',
        location: 'Packaging Unit',
        verified: true
      },
      {
        step: 'Storage',
        timestamp: new Date(harvestDate.getTime() + 259200000).toISOString().split('T')[0] + ' 09:45:00',
        location: product.location || 'Warehouse',
        verified: true
      }
    ];
  };

  const generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `KRISHI-${timestamp}${random}`.toUpperCase();
  };

  const generateBatchNumber = (product) => {
    const categoryCode = product.productName ? product.productName.substring(0, 3).toUpperCase() : 'PRO';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `BATCH-${categoryCode}-${date}-${random}`;
  };

  const handleVerify = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!transactionId.trim()) return;

    setLoading(true);
    
    // Get registered products from localStorage
    const registeredProducts = JSON.parse(localStorage.getItem('registeredProducts') || '{}');
    const product = registeredProducts[transactionId];

    // Also check user's products
    const savedUser = localStorage.getItem('farmerProfile');
    const user = savedUser ? JSON.parse(savedUser) : { id: 1 };
    const userProducts = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]');
    const userProduct = userProducts.find(p => p.verificationId === transactionId);

    // Simulate API call to blockchain
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (product || userProduct) {
      const productData = product || userProduct;
      const mockResult = {
        success: true,
        transaction: {
          id: transactionId,
          product: productData.productName || productData.name,
          farmer: productData.farmerName,
          farmLocation: productData.farmLocation || productData.location,
          harvestDate: productData.harvestDate,
          quantity: productData.quantity,
          quality: productData.quality,
          batchNumber: productData.batchNumber,
          timestamp: productData.timestamp || productData.createdAt,
          blockNumber: Math.floor(Math.random() * 1000000),
          hash: productData.hash || productData.blockchainHash,
          status: 'verified'
        },
        supplyChain: generateSupplyChain(productData)
      };
      setVerificationResult(mockResult);

      // Add to recent verifications if not already there
      if (!recentVerifications.find(v => v.id === transactionId)) {
        const newVerification = {
          id: transactionId,
          product: productData.productName || productData.name,
          farmer: productData.farmerName,
          date: new Date().toLocaleDateString(),
          status: 'verified',
          hash: (productData.hash || productData.blockchainHash).substring(0, 16) + '...'
        };
        const updatedVerifications = [newVerification, ...recentVerifications.slice(0, 9)];
        setRecentVerifications(updatedVerifications);
        localStorage.setItem('recentVerifications', JSON.stringify(updatedVerifications));
      }
    } else {
      // Product not found
      setVerificationResult({
        success: false,
        error: 'Product not found in blockchain registry. Please check the Verification ID.',
        transaction: {
          id: transactionId,
          status: 'failed'
        }
      });
    }
    
    setLoading(false);
  };

  const handleRegisterProduct = async (e) => {
    e.preventDefault();
    setRegistrationLoading(true);

    try {
      // Generate unique transaction ID and batch number
      const transactionId = generateTransactionId();
      const batchNumber = generateBatchNumber(newProduct);
      
      // Create product data
      const productData = {
        ...newProduct,
        batchNumber,
        transactionId,
        timestamp: new Date().toISOString(),
        status: 'registered',
        registrationDate: new Date().toLocaleDateString()
      };

      // Simulate blockchain registration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save to localStorage
      const existingProducts = JSON.parse(localStorage.getItem('registeredProducts') || '{}');
      existingProducts[transactionId] = productData;
      localStorage.setItem('registeredProducts', JSON.stringify(existingProducts));

      // Set generated transaction ID
      setGeneratedTxId(transactionId);

      // Reset form
      setNewProduct({
        productName: '',
        farmerName: '',
        farmLocation: '',
        harvestDate: '',
        quantity: '',
        quality: 'Grade A'
      });

      setShowRegistration(false);

    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCopyTxId = () => {
    if (generatedTxId) {
      navigator.clipboard.writeText(generatedTxId);
      alert('Transaction ID copied to clipboard!');
    }
  };

  const handleInputChange = (field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-fill farmer name from user profile
  useEffect(() => {
    const savedUser = localStorage.getItem('farmerProfile');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setNewProduct(prev => ({
        ...prev,
        farmerName: user.name
      }));
    }
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={20} className="status-icon verified" />;
      case 'pending':
        return <Clock size={20} className="status-icon pending" />;
      case 'failed':
        return <XCircle size={20} className="status-icon failed" />;
      default:
        return <Clock size={20} className="status-icon pending" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Verification Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="blockchain-verification">
      {/* Header */}
      <div className="verification-header">
        <div className="header-content">
          <div className="header-main">
            <button
              onClick={() => navigate('/dashboard/farmer')}
              className="back-button"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <div className="header-title">
              <Shield className="header-icon" />
              <div>
                <h1>Blockchain Verification</h1>
                <p className="header-subtitle">
                  Verify product authenticity and track supply chain using blockchain technology
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="view-products-btn"
          >
            View My Products
          </button>
        </div>
      </div>

      <div className="verification-content">
        {/* Success Message */}
        {generatedTxId && (
          <div className="success-section">
            <div className="success-card">
              <div className="success-header">
                <CheckCircle className="success-icon" />
                <h3>Product Registered Successfully!</h3>
              </div>
              <p className="success-subtitle">Use the Verification ID below to verify authenticity</p>
              
              <div className="tx-id-display">
                <div className="tx-id-header">
                  <Hash size={20} />
                  <span>Verification ID</span>
                </div>
                <div className="tx-id-value">{generatedTxId}</div>
                <div className="tx-id-actions">
                  <button onClick={handleCopyTxId} className="copy-txid-btn">
                    <Copy size={16} />
                    Copy Verification ID
                  </button>
                  <button 
                    onClick={() => {
                      setTransactionId(generatedTxId);
                      setGeneratedTxId('');
                      handleVerify();
                    }} 
                    className="verify-now-btn"
                  >
                    <Search size={16} />
                    Verify Now
                  </button>
                </div>
              </div>

              <div className="registration-details">
                <div className="detail-row">
                  <span className="detail-label">Registration Date:</span>
                  <span className="detail-value">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="status-badge verified">Registered on Blockchain</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card" onClick={() => setShowRegistration(true)}>
            <Plus className="action-icon" />
            <div className="action-content">
              <h3>Register New Product</h3>
              <p>Add a new product to blockchain for verification</p>
            </div>
          </div>
          <div className="action-card" onClick={() => navigate('/products')}>
            <FileText className="action-icon" />
            <div className="action-content">
              <h3>My Products</h3>
              <p>View and manage your registered products</p>
            </div>
          </div>
        </div>

        {/* Product Registration Section */}
        {showRegistration && (
          <div className="registration-section">
            <div className="registration-form-card">
              <div className="form-header">
                <h2>Register New Product on Blockchain</h2>
                <button 
                  onClick={() => setShowRegistration(false)}
                  className="close-form"
                >
                  ×
                </button>
              </div>
              <p className="form-description">
                Register your agricultural product to create a permanent, tamper-proof record on the blockchain.
                A unique Verification ID will be generated for authentication.
              </p>
              
              <form onSubmit={handleRegisterProduct} className="registration-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="e.g., Organic Wheat Sharbati"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Farmer Name *</label>
                    <input
                      type="text"
                      value={newProduct.farmerName}
                      onChange={(e) => handleInputChange('farmerName', e.target.value)}
                      placeholder="e.g., Rajesh Kumar"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Farm Location *</label>
                    <input
                      type="text"
                      value={newProduct.farmLocation}
                      onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                      placeholder="e.g., Punjab, India"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Harvest Date *</label>
                    <input
                      type="date"
                      value={newProduct.harvestDate}
                      onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Quantity *</label>
                    <input
                      type="text"
                      value={newProduct.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="e.g., 500 kg"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Quality Grade</label>
                    <select 
                      value={newProduct.quality}
                      onChange={(e) => handleInputChange('quality', e.target.value)}
                    >
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Grade C">Grade C</option>
                      <option value="Premium">Premium</option>
                      <option value="Organic">Organic</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="register-button" 
                  disabled={registrationLoading}
                >
                  {registrationLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Registering on Blockchain...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Register Product
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <div className="verification-form-section">
          <div className="form-card">
            <h2>Verify Product Authenticity</h2>
            <p className="form-description">
              Enter your product's Verification ID to verify its authenticity 
              and view the complete supply chain history.
            </p>
            
            <form onSubmit={handleVerify} className="verification-form">
              <div className="input-group">
                <label htmlFor="transactionId">Verification ID</label>
                <div className="input-with-button">
                  <input
                    id="transactionId"
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter Verification ID (e.g., KRISHI-001)"
                    className="transaction-input"
                  />
                  <button 
                    type="submit" 
                    className="verify-button" 
                    disabled={loading || !transactionId.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        Verify
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="example-ids">
              <p>Try these sample Verification IDs:</p>
              <div className="example-list">
                <span onClick={() => setTransactionId('KRISHI-001')}>KRISHI-001</span>
                <span onClick={() => setTransactionId('KRISHI-002')}>KRISHI-002</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="verification-result">
            <div className="result-card">
              <div className="result-header">
                <div className="result-status">
                  {getStatusIcon(verificationResult.transaction.status)}
                  <div>
                    <h3>Verification Result</h3>
                    <p className={`status-text ${verificationResult.transaction.status}`}>
                      {getStatusText(verificationResult.transaction.status)}
                    </p>
                  </div>
                </div>
                {verificationResult.success && (
                  <button className="download-report">
                    <Download size={18} />
                    Download Certificate
                  </button>
                )}
              </div>

              {verificationResult.success ? (
                <>
                  {/* Product Details */}
                  <div className="details-section">
                    <h4>
                      <FileText size={20} />
                      Product Information
                    </h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <User size={16} />
                        <div>
                          <span className="detail-label">Product Name:</span>
                          <span className="detail-value">{verificationResult.transaction.product}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <User size={16} />
                        <div>
                          <span className="detail-label">Farmer:</span>
                          <span className="detail-value">{verificationResult.transaction.farmer}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} />
                        <div>
                          <span className="detail-label">Farm Location:</span>
                          <span className="detail-value">{verificationResult.transaction.farmLocation}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} />
                        <div>
                          <span className="detail-label">Harvest Date:</span>
                          <span className="detail-value">{verificationResult.transaction.harvestDate}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Scale size={16} />
                        <div>
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{verificationResult.transaction.quantity}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Star size={16} />
                        <div>
                          <span className="detail-label">Quality Grade:</span>
                          <span className="detail-value">{verificationResult.transaction.quality}</span>
                        </div>
                      </div>
                      <div className="detail-item full-width">
                        <Hash size={16} />
                        <div>
                          <span className="detail-label">Batch Number:</span>
                          <span className="detail-value batch-number">{verificationResult.transaction.batchNumber}</span>
                        </div>
                      </div>
                      <div className="detail-item full-width">
                        <Shield size={16} />
                        <div>
                          <span className="detail-label">Verification ID:</span>
                          <span className="detail-value tx-id">{verificationResult.transaction.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Details */}
                  <div className="details-section">
                    <h4>
                      <Shield size={20} />
                      Blockchain Information
                    </h4>
                    <div className="blockchain-details">
                      <div className="blockchain-item">
                        <span className="blockchain-label">Transaction Hash:</span>
                        <div className="hash-container">
                          <code className="transaction-hash">
                            {verificationResult.transaction.hash}
                          </code>
                          <button 
                            onClick={() => navigator.clipboard.writeText(verificationResult.transaction.hash)}
                            className="copy-button"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="blockchain-item">
                        <span className="blockchain-label">Block Number:</span>
                        <span className="blockchain-value">#{verificationResult.transaction.blockNumber}</span>
                      </div>
                      <div className="blockchain-item">
                        <span className="blockchain-label">Timestamp:</span>
                        <span className="blockchain-value">{verificationResult.transaction.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Supply Chain */}
                  <div className="supply-chain-section">
                    <h4>Supply Chain History</h4>
                    <div className="supply-chain">
                      {verificationResult.supplyChain.map((step, index) => (
                        <div key={index} className="supply-chain-step">
                          <div className="step-indicator">
                            <div className={`step-dot ${step.verified ? 'verified' : 'pending'}`}>
                              {step.verified ? <CheckCircle size={12} /> : <Clock size={12} />}
                            </div>
                            {index < verificationResult.supplyChain.length - 1 && (
                              <div className="step-connector"></div>
                            )}
                          </div>
                          <div className="step-details">
                            <div className="step-title">{step.step}</div>
                            <div className="step-info">
                              <span className="step-time">{step.timestamp}</span>
                              <span className="step-location">{step.location}</span>
                            </div>
                            <div className={`step-status ${step.verified ? 'verified' : 'pending'}`}>
                              {step.verified ? 'Verified' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="error-section">
                  <XCircle size={48} className="error-icon" />
                  <h4>Verification Failed</h4>
                  <p>{verificationResult.error}</p>
                  <p className="error-help">
                    Please check the Verification ID and try again. If you believe this is an error, 
                    contact our support team.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Verifications */}
        {recentVerifications.length > 0 && (
          <div className="recent-verifications">
            <h2>Recent Verifications</h2>
            <div className="recent-list">
              {recentVerifications.map((verification) => (
                <div 
                  key={verification.id} 
                  className="recent-item"
                  onClick={() => {
                    setTransactionId(verification.id);
                    handleVerify();
                  }}
                >
                  <div className="recent-info">
                    <div className="recent-product">{verification.product}</div>
                    <div className="recent-details">
                      <span>By {verification.farmer}</span>
                      <span>•</span>
                      <span>{verification.date}</span>
                      <span>•</span>
                      <span className="tx-id-small">{verification.id}</span>
                    </div>
                  </div>
                  <div className="recent-status">
                    {getStatusIcon(verification.status)}
                    <span className={`status-text ${verification.status}`}>
                      {getStatusText(verification.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainVerification;