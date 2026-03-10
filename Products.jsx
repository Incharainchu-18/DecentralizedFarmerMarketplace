import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, ShoppingCart, Star, TrendingUp, X,
  CheckCircle, Clock, AlertCircle, ExternalLink, Eye, Trash2
} from 'lucide-react';
import Web3 from 'web3';
import './Products.css';

const FARMER_MARKET_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_farmer", "type": "string"},
      {"internalType": "string", "name": "_batchNumber", "type": "string"},
      {"internalType": "string", "name": "_category", "type": "string"},
      {"internalType": "uint256", "name": "_price", "type": "uint256"},
      {"internalType": "uint256", "name": "_quantity", "type": "uint256"},
      {"internalType": "string", "name": "_unit", "type": "string"},
      {"internalType": "string", "name": "_location", "type": "string"}
    ],
    "name": "registerProduct",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBlockchainPage, setShowBlockchainPage] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [transactionId, setTransactionId] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'poultry', label: 'Poultry' },
    { value: 'spices', label: 'Spices' }
  ];

  useEffect(() => {
    initializeWeb3();
    const savedProducts = localStorage.getItem('blockchainProducts');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  useEffect(() => {
    localStorage.setItem('blockchainProducts', JSON.stringify(products));
  }, [products]);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const chainId = await web3Instance.eth.getChainId();
        setNetwork(getNetworkName(chainId));
        
        if (chainId === 80002) {
          const contractInstance = new web3Instance.eth.Contract(FARMER_MARKET_ABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
        }

        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) setAccount(accounts[0]);

        window.ethereum.on('accountsChanged', (accounts) => {
          setAccount(accounts[0] || '');
        });
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    }
  };

  const getNetworkName = (chainId) => {
    switch (chainId.toString()) {
      case '1': return 'Ethereum Mainnet';
      case '80002': return 'Polygon Amoy';
      case '137': return 'Polygon Mainnet';
      default: return `Network (${chainId})`;
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    setIsConnecting(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  };

  const generateBatchNumber = () => {
    return `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, cartQuantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Delete this product?')) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const handleAddProduct = async (productData) => {
    if (!account) {
      alert('Connect your wallet first!');
      connectWallet();
      return;
    }

    const batchNumber = generateBatchNumber();
    const pendingProductData = {
      id: Date.now(),
      ...productData,
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity),
      rating: Math.random() * 5,
      reviews: Math.floor(Math.random() * 100),
      batchNumber: batchNumber,
      transactionHash: '',
      status: 'pending',
      verificationStatus: 'pending'
    };

    setPendingProduct(pendingProductData);
    setShowAddForm(false);
    setShowBlockchainPage(true);
    setVerificationStatus('pending');
  };

  const verifyOnBlockchain = async () => {
    if (!web3 || !contract || !account) {
      alert('Connect your wallet first.');
      return;
    }

    setLoading(true);
    setVerificationStatus('verifying');

    try {
      const priceInWei = web3.utils.toWei(pendingProduct.price.toString(), 'ether');
      
      const transaction = await contract.methods
        .registerProduct(
          pendingProduct.name,
          pendingProduct.farmer,
          pendingProduct.batchNumber,
          pendingProduct.category,
          priceInWei,
          pendingProduct.quantity,
          pendingProduct.unit,
          pendingProduct.location
        )
        .send({ from: account, gas: 500000 });

      const transactionHash = transaction.transactionHash;
      setTransactionId(transactionHash);
      setVerificationStatus('verified');
      
      const verifiedProduct = {
        ...pendingProduct,
        status: 'active',
        verificationStatus: 'verified',
        transactionHash: transactionHash,
        explorerUrl: `https://amoy.polygonscan.com/tx/${transactionHash}`
      };

      setProducts(prev => [verifiedProduct, ...prev]);
      
      setTimeout(() => {
        setShowBlockchainPage(false);
        setPendingProduct(null);
        alert('Product registered on Polygon!');
      }, 2000);

    } catch (error) {
      console.error('Transaction failed:', error);
      setVerificationStatus('failed');
      alert('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`star ${star <= rating ? 'filled' : ''}`}
          />
        ))}
        <span>({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (showBlockchainPage) {
    return (
      <div className="blockchain-page">
        <div className="blockchain-container">
          <div className="blockchain-header">
            <h1>Polygon Blockchain Registration</h1>
            <p>Registering your product on Polygon Amoy Testnet</p>
            {account && (
              <div className="wallet-info">
                <span>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                <span>Network: {network}</span>
              </div>
            )}
          </div>

          <div className="verification-steps">
            <div className={`step ${verificationStatus !== 'pending' ? 'completed' : 'active'}`}>
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Product Details Prepared</h3>
                <p>Ready for blockchain</p>
              </div>
              <CheckCircle className="step-icon" />
            </div>

            <div className={`step ${verificationStatus === 'verified' ? 'completed' : verificationStatus === 'verifying' ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Blockchain Registration</h3>
                <p>Registering on Polygon</p>
              </div>
              {verificationStatus === 'verified' ? <CheckCircle className="step-icon" /> : 
               verificationStatus === 'verifying' ? <Clock className="step-icon verifying" /> : 
               <div className="step-icon pending">2</div>}
            </div>

            <div className={`step ${verificationStatus === 'verified' ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Product Listed</h3>
                <p>Successfully added</p>
              </div>
              {verificationStatus === 'verified' ? <CheckCircle className="step-icon" /> : <div className="step-icon pending">3</div>}
            </div>
          </div>

          <div className="verification-details">
            <div className="detail-card">
              <h3>Product Information</h3>
              {pendingProduct && (
                <div className="product-preview">
                  <div className="preview-row"><span>Name:</span><strong>{pendingProduct.name}</strong></div>
                  <div className="preview-row"><span>Batch:</span><strong>{pendingProduct.batchNumber}</strong></div>
                  <div className="preview-row"><span>Category:</span><strong>{pendingProduct.category}</strong></div>
                  <div className="preview-row"><span>Price:</span><strong>₹{pendingProduct.price}/{pendingProduct.unit}</strong></div>
                  <div className="preview-row"><span>Quantity:</span><strong>{pendingProduct.quantity} {pendingProduct.unit}</strong></div>
                </div>
              )}
            </div>

            <div className="detail-card">
              <h3>Transaction</h3>
              <div className="transaction-info">
                <div className="info-row"><span>Network:</span><strong>{network}</strong></div>
                <div className="info-row">
                  <span>Transaction ID:</span>
                  <div className="transaction-hash">
                    <code>{transactionId ? `${transactionId.substring(0, 10)}...` : 'Pending...'}</code>
                    {transactionId && (
                      <button onClick={() => window.open(`https://amoy.polygonscan.com/tx/${transactionId}`, '_blank')}>
                        <ExternalLink />
                      </button>
                    )}
                  </div>
                </div>
                <div className="info-row">
                  <span>Status:</span>
                  <span className={`status ${verificationStatus}`}>{verificationStatus}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="verification-actions">
            {verificationStatus === 'pending' && (
              <>
                <button onClick={verifyOnBlockchain} disabled={loading || !account}>
                  {!account ? 'Connect Wallet' : loading ? 'Processing...' : 'Register on Polygon'}
                </button>
                <button onClick={() => setShowBlockchainPage(false)}>Cancel</button>
              </>
            )}
            {verificationStatus === 'verifying' && (
              <div className="verifying">
                <div className="spinner"></div>
                <p>Registering on Blockchain...</p>
              </div>
            )}
            {verificationStatus === 'verified' && (
              <div className="verified">
                <CheckCircle />
                <h3>Success!</h3>
                <button onClick={() => setShowBlockchainPage(false)}>Continue</button>
              </div>
            )}
            {verificationStatus === 'failed' && (
              <div className="failed">
                <AlertCircle />
                <h3>Failed</h3>
                <button onClick={verifyOnBlockchain}>Retry</button>
                <button onClick={() => setShowBlockchainPage(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="header-content">
          <h1>Farm Products Marketplace</h1>
          <p>Blockchain-verified farm products</p>
        </div>
        
        <div className="header-actions">
          {!account ? (
            <button onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="wallet-connected">
              <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
              <span className="network">{network}</span>
            </div>
          )}
          
          <button onClick={() => setShowAddForm(true)} disabled={!account}>
            <Plus />
            Add Product
          </button>
        </div>
      </div>

      <div className="products-controls">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="products-stats">
        <div className="stat-card">
          <ShoppingCart />
          <div>
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        
        <div className="stat-card">
          <CheckCircle />
          <div>
            <h3>{products.filter(p => p.verificationStatus === 'verified').length}</h3>
            <p>Verified</p>
          </div>
        </div>
        
        <div className="stat-card">
          <TrendingUp />
          <div>
            <h3>{products.filter(p => p.rating > 4).length}</h3>
            <p>Top Rated</p>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart />
            <h3>No products found</h3>
            <p>Add a new product to get started</p>
            <button onClick={() => setShowAddForm(true)} disabled={!account}>
              <Plus />
              Add First Product
            </button>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image || '/api/placeholder/300/200'} alt={product.name}/>
                {product.verificationStatus === 'verified' && (
                  <div className="verified-badge">
                    <CheckCircle />
                    Verified
                  </div>
                )}
              </div>
              
              <div className="product-content">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <span>{product.category}</span>
                </div>
                
                <p>{product.description}</p>
                
                <div className="product-meta">
                  <span><strong>Farmer:</strong> {product.farmer}</span>
                  <span><strong>Batch:</strong> {product.batchNumber}</span>
                </div>
                
                {renderStars(product.rating)}
                <span>{product.reviews} reviews</span>
                
                <div className="product-price">
                  <span>₹{product.price}</span>
                  <span>/{product.unit}</span>
                </div>
                
                <div className="product-quantity">
                  <span>Available: {product.quantity} {product.unit}</span>
                </div>
                
                <div className="product-actions">
                  <button onClick={() => handleAddToCart(product)}>
                    <ShoppingCart />
                    Add to Cart
                  </button>
                  
                  <Link to={`/product/${product.id}`}>
                    <Eye />
                    Details
                  </Link>
                  
                  <button onClick={() => handleDeleteProduct(product.id)}>
                    <Trash2 />
                  </button>
                </div>
                
                {product.transactionHash && (
                  <div className="blockchain-info">
                    <button onClick={() => window.open(product.explorerUrl, '_blank')}>
                      <ExternalLink />
                      View on PolygonScan
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <AddProductForm 
          onClose={() => setShowAddForm(false)}
          onProductAdded={handleAddProduct}
          loading={loading}
          account={account}
          onConnectWallet={connectWallet}
        />
      )}
    </div>
  );
};

const AddProductForm = ({ onClose, onProductAdded, loading, account, onConnectWallet }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', farmer: '', category: 'vegetables',
    price: '', quantity: '', unit: 'kg', location: '', image: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!account) {
      alert('Connect wallet first!');
      onConnectWallet();
      return;
    }
    onProductAdded(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Farmer Name *</label>
              <input type="text" name="farmer" value={formData.farmer} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="grains">Grains</option>
                <option value="dairy">Dairy</option>
                <option value="poultry">Poultry</option>
                <option value="spices">Spices</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" />
            </div>

            <div className="form-group">
              <label>Unit *</label>
              <select name="unit" value={formData.unit} onChange={handleChange} required>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="piece">piece</option>
                <option value="liter">liter</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
            </div>

            <div className="form-group full-width">
              <label>Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required />
            </div>

            <div className="form-group full-width">
              <label>Image URL</label>
              <input type="url" name="image" value={formData.image} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading || !account}>
              {loading ? 'Adding...' : !account ? 'Connect Wallet' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;