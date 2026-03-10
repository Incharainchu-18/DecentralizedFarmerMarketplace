// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Search, Filter, Download } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingVerifications: 0,
    pendingOrders: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuth');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    
    loadDashboardData();
    loadPendingProducts();
    loadPendingOrders();
  }, [navigate]);

  const loadDashboardData = async () => {
    // Mock data
    setStats({
      totalUsers: 1247,
      totalFarmers: 356,
      totalProducts: 892,
      totalOrders: 2341,
      pendingVerifications: 23,
      pendingOrders: 15
    });

    setRecentActivities([
      { id: 1, action: 'New product pending verification', user: 'Green Farms', time: '2 mins ago', type: 'product' },
      { id: 2, action: 'New order placed', user: 'Customer #1234', time: '5 mins ago', type: 'order' },
      { id: 3, action: 'Farmer registration', user: 'Raj Kumar', time: '15 mins ago', type: 'user' },
      { id: 4, action: 'Product verification approved', user: 'Organic Valley', time: '1 hour ago', type: 'verification' }
    ]);
  };

  const loadPendingProducts = async () => {
    // Mock pending products data
    const mockProducts = [
      {
        id: 1,
        name: 'Organic Tomatoes',
        farmer: 'Green Farms',
        category: 'vegetables',
        price: '₹120/kg',
        quantity: '50 kg',
        location: 'Punjab',
        submittedDate: '2024-01-15',
        status: 'pending',
        image: '/api/placeholder/100/100',
        description: 'Fresh organic tomatoes from our farm'
      },
      {
        id: 2,
        name: 'Basmati Rice',
        farmer: 'Punjab Rice Mills',
        category: 'grains',
        price: '₹80/kg',
        quantity: '200 kg',
        location: 'Haryana',
        submittedDate: '2024-01-14',
        status: 'pending',
        image: '/api/placeholder/100/100',
        description: 'Premium quality basmati rice'
      },
      {
        id: 3,
        name: 'Fresh Milk',
        farmer: 'Dairy Delight',
        category: 'dairy',
        price: '₹60/liter',
        quantity: '100 liters',
        location: 'Gujarat',
        submittedDate: '2024-01-13',
        status: 'pending',
        image: '/api/placeholder/100/100',
        description: 'Fresh pasteurized milk'
      }
    ];
    setPendingProducts(mockProducts);
  };

  const loadPendingOrders = async () => {
    // Mock pending orders data
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
        customer: 'Rahul Sharma',
        products: ['Organic Tomatoes (2 kg)', 'Basmati Rice (5 kg)'],
        totalAmount: '₹640',
        orderDate: '2024-01-15',
        status: 'pending',
        deliveryAddress: '123 Main St, Delhi',
        paymentMethod: 'UPI'
      },
      {
        id: 2,
        orderNumber: 'ORD-002',
        customer: 'Priya Patel',
        products: ['Fresh Milk (2 liters)'],
        totalAmount: '₹120',
        orderDate: '2024-01-15',
        status: 'pending',
        deliveryAddress: '456 Park Ave, Mumbai',
        paymentMethod: 'Credit Card'
      },
      {
        id: 3,
        orderNumber: 'ORD-003',
        customer: 'Amit Kumar',
        products: ['Organic Tomatoes (1 kg)', 'Fresh Milk (1 liter)'],
        totalAmount: '₹180',
        orderDate: '2024-01-14',
        status: 'pending',
        deliveryAddress: '789 Gandhi Rd, Bangalore',
        paymentMethod: 'Cash on Delivery'
      }
    ];
    setPendingOrders(mockOrders);
  };

  const handleProductAction = async (productId, action) => {
    // Approve or reject product
    if (action === 'approve') {
      if (window.confirm('Are you sure you want to approve this product?')) {
        setPendingProducts(prev => prev.filter(p => p.id !== productId));
        setStats(prev => ({ ...prev, pendingVerifications: prev.pendingVerifications - 1 }));
        alert('Product approved successfully!');
      }
    } else if (action === 'reject') {
      const reason = prompt('Please enter reason for rejection:');
      if (reason) {
        setPendingProducts(prev => prev.filter(p => p.id !== productId));
        setStats(prev => ({ ...prev, pendingVerifications: prev.pendingVerifications - 1 }));
        alert('Product rejected successfully!');
      }
    }
  };

  const handleOrderAction = async (orderId, action) => {
    // Approve or reject order
    if (action === 'approve') {
      if (window.confirm('Are you sure you want to approve this order?')) {
        setPendingOrders(prev => prev.filter(o => o.id !== orderId));
        setStats(prev => ({ ...prev, pendingOrders: prev.pendingOrders - 1 }));
        alert('Order approved successfully!');
      }
    } else if (action === 'reject') {
      const reason = prompt('Please enter reason for rejection:');
      if (reason) {
        setPendingOrders(prev => prev.filter(o => o.id !== orderId));
        setStats(prev => ({ ...prev, pendingOrders: prev.pendingOrders - 1 }));
        alert('Order rejected successfully!');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminLoginTime');
    navigate('/admin/login');
  };

  const filteredProducts = pendingProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.farmer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = pendingOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminTabs = {
    overview: { name: '📊 Overview', component: <OverviewTab stats={stats} activities={recentActivities} /> },
    products: { name: '📦 Product Verification', component: <ProductVerificationTab 
      products={filteredProducts}
      onProductAction={handleProductAction}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    /> },
    orders: { name: '🛒 Order Approval', component: <OrderApprovalTab 
      orders={filteredOrders}
      onOrderAction={handleOrderAction}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    /> }
  };

  const adminEmail = localStorage.getItem('adminEmail');
  const adminRole = localStorage.getItem('adminRole');

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <h1>Admin Dashboard</h1>
              <p className="admin-subtitle">FarmerMarket Platform Management</p>
            </div>
            <div className="col-auto">
              <div className="admin-info">
                <span className="admin-email">{adminEmail}</span>
                <span className={`admin-role badge ${adminRole === 'superadmin' ? 'bg-danger' : 'bg-warning'}`}>
                  {adminRole}
                </span>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav">
        <div className="container-fluid">
          <div className="nav-scroll">
            {Object.entries(adminTabs).map(([key, tab]) => (
              <button
                key={key}
                className={`nav-tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        <div className="container-fluid">
          {adminTabs[activeTab]?.component}
        </div>
      </main>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ stats, activities }) => (
  <div className="overview-tab">
    <div className="row">
      {/* Stats Cards */}
      <div className="col-md-2 mb-4">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>
      <div className="col-md-2 mb-4">
        <div className="stat-card farmers">
          <div className="stat-icon">👨‍🌾</div>
          <div className="stat-info">
            <h3>{stats.totalFarmers}</h3>
            <p>Farmers</p>
          </div>
        </div>
      </div>
      <div className="col-md-2 mb-4">
        <div className="stat-card products">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.totalProducts}</h3>
            <p>Products</p>
          </div>
        </div>
      </div>
      <div className="col-md-2 mb-4">
        <div className="stat-card orders">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>{stats.totalOrders}</h3>
            <p>Orders</p>
          </div>
        </div>
      </div>
      <div className="col-md-2 mb-4">
        <div className="stat-card verification">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.pendingVerifications}</h3>
            <p>Pending Products</p>
          </div>
        </div>
      </div>
      <div className="col-md-2 mb-4">
        <div className="stat-card pending-orders">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
      </div>
    </div>

    <div className="row">
      {/* Recent Activities */}
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h5>Recent Activities</h5>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'user' && '👤'}
                    {activity.type === 'product' && '📦'}
                    {activity.type === 'order' && '🛒'}
                    {activity.type === 'verification' && '✅'}
                  </div>
                  <div className="activity-content">
                    <strong>{activity.action}</strong>
                    <span>by {activity.user}</span>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5>Quick Actions</h5>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="btn btn-primary mb-2 w-100" onClick={() => window.location.hash = 'products'}>
                Verify Products ({stats.pendingVerifications})
              </button>
              <button className="btn btn-warning mb-2 w-100" onClick={() => window.location.hash = 'orders'}>
                Approve Orders ({stats.pendingOrders})
              </button>
              <button className="btn btn-info mb-2 w-100">View Reports</button>
              <button className="btn btn-success mb-2 w-100">System Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductVerificationTab = ({ products, onProductAction, searchTerm, onSearchChange }) => (
  <div className="verification-tab">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3>Product Verification Queue</h3>
        <p className="text-muted">Approve or reject products uploaded by farmers</p>
      </div>
      <div className="search-box">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search products or farmers..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
    </div>

    {products.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h4>No Pending Verifications</h4>
        <p>All products have been verified.</p>
      </div>
    ) : (
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-verification-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-details">
              <h5>{product.name}</h5>
              <p className="product-description">{product.description}</p>
              
              <div className="product-meta">
                <div className="meta-item">
                  <strong>Farmer:</strong> {product.farmer}
                </div>
                <div className="meta-item">
                  <strong>Category:</strong> {product.category}
                </div>
                <div className="meta-item">
                  <strong>Price:</strong> {product.price}
                </div>
                <div className="meta-item">
                  <strong>Quantity:</strong> {product.quantity}
                </div>
                <div className="meta-item">
                  <strong>Location:</strong> {product.location}
                </div>
                <div className="meta-item">
                  <strong>Submitted:</strong> {product.submittedDate}
                </div>
              </div>

              <div className="verification-actions">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => onProductAction(product.id, 'approve')}
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => onProductAction(product.id, 'reject')}
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button className="btn btn-outline-primary btn-sm">
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const OrderApprovalTab = ({ orders, onOrderAction, searchTerm, onSearchChange }) => (
  <div className="orders-tab">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3>Order Approval Queue</h3>
        <p className="text-muted">Approve or reject orders placed by users</p>
      </div>
      <div className="search-box">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search orders or customers..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
    </div>

    {orders.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">🛒</div>
        <h4>No Pending Orders</h4>
        <p>All orders have been processed.</p>
      </div>
    ) : (
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h5>{order.orderNumber}</h5>
                <span className="customer-name">Customer: {order.customer}</span>
              </div>
              <div className="order-amount">
                <strong>{order.totalAmount}</strong>
              </div>
            </div>

            <div className="order-details">
              <div className="detail-row">
                <strong>Products:</strong>
                <span>{order.products.join(', ')}</span>
              </div>
              <div className="detail-row">
                <strong>Order Date:</strong>
                <span>{order.orderDate}</span>
              </div>
              <div className="detail-row">
                <strong>Delivery Address:</strong>
                <span>{order.deliveryAddress}</span>
              </div>
              <div className="detail-row">
                <strong>Payment Method:</strong>
                <span>{order.paymentMethod}</span>
              </div>
            </div>

            <div className="order-actions">
              <button 
                className="btn btn-success btn-sm"
                onClick={() => onOrderAction(order.id, 'approve')}
              >
                <CheckCircle size={16} />
                Approve Order
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => onOrderAction(order.id, 'reject')}
              >
                <XCircle size={16} />
                Reject Order
              </button>
              <button className="btn btn-outline-primary btn-sm">
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AdminDashboard;