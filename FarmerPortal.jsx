// src/pages/FarmerPortal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowRight,
  Plus,
  Edit,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Settings,
  User,
  Shield,
  Star,
  Activity,
  Download,
  Upload,
  Bell,
  MessageSquare,
  HelpCircle,
  LogOut,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  TrendingDown,
  PieChart,
  Tag,
  Award,
  Truck as TruckIcon,
  Package as PackageIcon,
  ShoppingCart,
  RefreshCw,
  FileText,
  CreditCard,
  Smartphone,
  Globe
} from 'lucide-react';
import './FarmerPortal.css';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FarmerPortal = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState('monthly');
  const notificationsRef = useRef(null);

  // Enhanced farmer data
  const sampleFarmer = {
    id: 'FARMER001',
    name: 'Rajesh Kumar',
    farmName: 'Green Valley Organic Farm',
    location: 'Punjab, India',
    joinedDate: '2022-03-15',
    totalProducts: 8,
    totalSales: 154200,
    monthlyRevenue: 45200,
    customerRating: 4.7,
    verified: true,
    subscription: 'Premium',
    badges: ['Top Seller', 'Organic Certified', 'Fast Shipper'],
    farmSize: '25 acres',
    crops: ['Wheat', 'Rice', 'Vegetables'],
    contact: '+91 98765 43210',
    email: 'rajesh@greenvalleyfarm.com'
  };

  // Enhanced products data
  const sampleProducts = [
    {
      id: 1,
      name: 'Organic Wheat Sharbati',
      category: 'Grains',
      price: 25,
      unit: 'kg',
      stock: 450,
      sold: 1250,
      status: 'active',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300',
      description: 'Premium quality organic wheat',
      harvestDate: '2024-01-10',
      organicCertified: true,
      tags: ['Organic', 'Premium', 'Best Seller']
    },
    {
      id: 2,
      name: 'Premium Basmati Rice',
      category: 'Grains',
      price: 45,
      unit: 'kg',
      stock: 280,
      sold: 890,
      status: 'active',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w-300',
      description: 'Aromatic long grain basmati',
      harvestDate: '2024-01-05',
      organicCertified: true,
      tags: ['Aromatic', 'Export Quality']
    },
    {
      id: 3,
      name: 'Fresh Organic Tomatoes',
      category: 'Vegetables',
      price: 30,
      unit: 'kg',
      stock: 0,
      sold: 320,
      status: 'out-of-stock',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300',
      description: 'Freshly harvested organic tomatoes',
      harvestDate: '2024-01-12',
      organicCertified: true,
      tags: ['Fresh', 'Organic']
    },
    {
      id: 4,
      name: 'Golden Mustard Seeds',
      category: 'Spices',
      price: 120,
      unit: 'kg',
      stock: 150,
      sold: 450,
      status: 'active',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=300',
      description: 'High-quality mustard seeds',
      harvestDate: '2024-01-08',
      organicCertified: false,
      tags: ['Spice', 'Premium']
    }
  ];

  // Enhanced orders data
  const sampleOrders = [
    {
      id: 'ORD001',
      customer: 'Amit Sharma',
      product: 'Organic Wheat Sharbati',
      quantity: 25,
      total: 625,
      status: 'delivered',
      date: '2024-01-15',
      payment: 'Paid',
      deliveryDate: '2024-01-16',
      customerRating: 5
    },
    {
      id: 'ORD002',
      customer: 'Priya Patel',
      product: 'Premium Basmati Rice',
      quantity: 10,
      total: 450,
      status: 'shipped',
      date: '2024-01-14',
      payment: 'Paid',
      deliveryDate: '2024-01-17',
      customerRating: 4
    },
    {
      id: 'ORD003',
      customer: 'Rohan Verma',
      product: 'Organic Wheat Sharbati',
      quantity: 50,
      total: 1250,
      status: 'pending',
      date: '2024-01-14',
      payment: 'Pending',
      deliveryDate: '2024-01-18',
      customerRating: null
    },
    {
      id: 'ORD004',
      customer: 'Sunita Rao',
      product: 'Golden Mustard Seeds',
      quantity: 5,
      total: 600,
      status: 'delivered',
      date: '2024-01-13',
      payment: 'Paid',
      deliveryDate: '2024-01-15',
      customerRating: 4
    }
  ];

  // Enhanced notifications
  const sampleNotifications = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'ORD005 - ₹850 order from Ankit Gupta',
      time: '10 min ago',
      read: false
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: '₹1,250 payment for ORD003 has been credited',
      time: '2 hours ago',
      read: true
    },
    {
      id: 3,
      type: 'stock',
      title: 'Low Stock Alert',
      message: 'Organic Tomatoes is running low (50kg remaining)',
      time: '1 day ago',
      read: false
    },
    {
      id: 4,
      type: 'review',
      title: 'New 5-star Review',
      message: 'Amit Sharma gave 5 stars to Organic Wheat Sharbati',
      time: '2 days ago',
      read: true
    }
  ];

  // Sales data for charts
  const salesData = [
    { month: 'Jan', sales: 45200, orders: 47 },
    { month: 'Feb', sales: 52000, orders: 52 },
    { month: 'Mar', sales: 48000, orders: 48 },
    { month: 'Apr', sales: 61200, orders: 61 },
    { month: 'May', sales: 55000, orders: 55 },
    { month: 'Jun', sales: 68000, orders: 68 }
  ];

  const categoryData = [
    { name: 'Grains', value: 65, color: '#4CAF50' },
    { name: 'Vegetables', value: 20, color: '#2196F3' },
    { name: 'Spices', value: 15, color: '#FF9800' }
  ];

  // Quick stats
  const quickStats = {
    pendingOrders: 3,
    lowStockProducts: 2,
    unreadMessages: 5,
    upcomingDeliveries: 4
  };

  useEffect(() => {
    const loadFarmerData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setFarmer(sampleFarmer);
      setNotifications(sampleNotifications);
      setLoading(false);
    };

    loadFarmerData();
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return <CheckCircle size={16} className="status-icon delivered" />;
      case 'shipped':
        return <Truck size={16} className="status-icon shipped" />;
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'out-of-stock':
        return <AlertCircle size={16} className="status-icon out-of-stock" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'pending': return 'Pending';
      case 'out-of-stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingCart size={18} />;
      case 'payment': return <DollarSign size={18} />;
      case 'stock': return <Package size={18} />;
      case 'review': return <Star size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const handleAddProduct = () => {
    navigate('/products/new');
  };

  const handleExportData = (type) => {
    alert(`Exporting ${type} data...`);
    // Implement actual export logic
  };

  const handleMarkNotificationRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOrders = sampleOrders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="farmer-portal-loading">
        <div className="loading-spinner"></div>
        <p>Loading your farmer portal...</p>
      </div>
    );
  }

  return (
    <div className="farmer-portal">
      {/* Enhanced Header */}
      <div className="portal-header">
        <div className="header-top">
          <div className="header-left">
            <h1>👨‍🌾 Farmer Portal</h1>
            <div className="breadcrumb">
              <span>Dashboard</span>
              <ChevronRight size={14} />
              <span className="active">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>
          </div>
          
          <div className="header-right">
            {/* Search Bar */}
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search products, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Notifications */}
            <div className="notification-wrapper" ref={notificationsRef}>
              <button 
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="notification-badge">{unreadNotifications}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                    <button 
                      className="mark-all-read"
                      onClick={handleMarkAllRead}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="notification-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => handleMarkNotificationRead(notification.id)}
                      >
                        <div className="notification-icon">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                        {!notification.read && <div className="unread-dot"></div>}
                      </div>
                    ))}
                  </div>
                  <button 
                    className="view-all-notifications"
                    onClick={() => navigate('/notifications')}
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </div>

            {/* Messages */}
            <button className="header-icon-btn">
              <MessageSquare size={20} />
              <span className="message-count">5</span>
            </button>

            {/* Help */}
            <button className="header-icon-btn" onClick={() => navigate('/help')}>
              <HelpCircle size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="profile-dropdown">
              <div className="profile-summary">
                <div className="profile-avatar">
                  <User size={24} />
                </div>
                <div className="profile-name">{farmer?.name}</div>
                <ChevronRight size={16} />
              </div>
              <div className="profile-menu">
                <button onClick={() => navigate('/farmer/profile')}>
                  <User size={16} /> My Profile
                </button>
                <button onClick={() => navigate('/settings')}>
                  <Settings size={16} /> Settings
                </button>
                <button onClick={() => navigate('/help')}>
                  <HelpCircle size={16} /> Help & Support
                </button>
                <hr />
                <button className="logout-btn" onClick={() => navigate('/logout')}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Summary */}
        <div className="farm-summary">
          <div className="farm-badges">
            {farmer?.verified && (
              <span className="badge verified">
                <Shield size={14} /> Verified Farmer
              </span>
            )}
            <span className="badge premium">
              <Award size={14} /> {farmer?.subscription}
            </span>
            {farmer?.badges?.map((badge, index) => (
              <span key={index} className="badge achievement">
                <Star size={14} /> {badge}
              </span>
            ))}
          </div>
          <div className="farm-stats">
            <span><Activity size={14} /> {farmer?.farmSize}</span>
            <span><Tag size={14} /> {farmer?.crops?.join(', ')}</span>
            <span><Globe size={14} /> {farmer?.location}</span>
          </div>
        </div>
      </div>

      <div className="portal-layout">
        {/* Enhanced Sidebar */}
        <div className="portal-sidebar">
          <div className="sidebar-header">
            <div className="farm-mini-profile">
              <div className="mini-avatar">
                <User size={20} />
              </div>
              <div className="mini-info">
                <div className="mini-name">{farmer?.farmName}</div>
                <div className="mini-id">ID: {farmer?.id}</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={20} />
              <span>Dashboard</span>
              <ChevronRight size={16} className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={20} />
              <span>Products</span>
              <span className="nav-badge">{farmer?.totalProducts}</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart size={20} />
              <span>Orders</span>
              <span className="nav-badge">{sampleOrders.length}</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <TrendingUp size={20} />
              <span>Analytics</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <PackageIcon size={20} />
              <span>Inventory</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users size={20} />
              <span>Customers</span>
            </button>

            <div className="nav-divider">Financials</div>
            
            <button 
              className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveTab('revenue')}
            >
              <DollarSign size={20} />
              <span>Revenue</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <CreditCard size={20} />
              <span>Payments</span>
            </button>

            <div className="nav-divider">Settings</div>
            
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => navigate('/help')}
            >
              <HelpCircle size={20} />
              <span>Help & Support</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="storage-info">
              <div className="storage-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <span>65% storage used</span>
              </div>
            </div>
            <button className="upgrade-btn" onClick={() => navigate('/upgrade')}>
              <TrendingUp size={16} />
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="portal-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              {/* Quick Stats */}
              <div className="quick-stats-grid">
                <div className="quick-stat-card">
                  <div className="quick-stat-icon pending">
                    <Clock size={20} />
                  </div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{quickStats.pendingOrders}</div>
                    <div className="quick-stat-label">Pending Orders</div>
                  </div>
                  <button className="quick-stat-action">
                    View <ArrowRight size={14} />
                  </button>
                </div>
                
                <div className="quick-stat-card">
                  <div className="quick-stat-icon warning">
                    <AlertCircle size={20} />
                  </div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{quickStats.lowStockProducts}</div>
                    <div className="quick-stat-label">Low Stock</div>
                  </div>
                  <button className="quick-stat-action">
                    Restock <RefreshCw size={14} />
                  </button>
                </div>
                
                <div className="quick-stat-card">
                  <div className="quick-stat-icon message">
                    <MessageSquare size={20} />
                  </div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{quickStats.unreadMessages}</div>
                    <div className="quick-stat-label">Unread Messages</div>
                  </div>
                  <button className="quick-stat-action">
                    Reply <ArrowRight size={14} />
                  </button>
                </div>
                
                <div className="quick-stat-card">
                  <div className="quick-stat-icon delivery">
                    <TruckIcon size={20} />
                  </div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{quickStats.upcomingDeliveries}</div>
                    <div className="quick-stat-label">Upcoming Deliveries</div>
                  </div>
                  <button className="quick-stat-action">
                    Track <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Main Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon revenue">
                      <DollarSign size={24} />
                    </div>
                    <select 
                      className="period-select"
                      value={statsPeriod}
                      onChange={(e) => setStatsPeriod(e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">₹{farmer?.monthlyRevenue?.toLocaleString()}</div>
                    <div className="stat-label">Monthly Revenue</div>
                    <div className="stat-trend positive">
                      <TrendingUp size={16} />
                      <span>+12.5%</span>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon products">
                      <Package size={24} />
                    </div>
                    <button className="export-btn" onClick={() => handleExportData('products')}>
                      <Download size={16} />
                    </button>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{farmer?.totalProducts}</div>
                    <div className="stat-label">Active Products</div>
                    <div className="stat-trend positive">
                      <TrendingUp size={16} />
                      <span>+2 this month</span>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon sales">
                      <TrendingUp size={24} />
                    </div>
                    <button className="export-btn" onClick={() => handleExportData('sales')}>
                      <Download size={16} />
                    </button>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">₹{farmer?.totalSales?.toLocaleString()}</div>
                    <div className="stat-label">Total Sales</div>
                    <div className="stat-trend positive">
                      <TrendingUp size={16} />
                      <span>+18.3%</span>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon rating">
                      <Star size={24} />
                    </div>
                    <button className="details-btn" onClick={() => navigate('/reviews')}>
                      Details
                    </button>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{farmer?.customerRating}</div>
                    <div className="stat-label">Customer Rating</div>
                    <div className="rating-stars">
                      {'★'.repeat(Math.floor(farmer?.customerRating))}
                      {'☆'.repeat(5 - Math.floor(farmer?.customerRating))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-section">
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Sales Overview</h3>
                    <div className="chart-actions">
                      <button className="chart-action-btn">
                        <Filter size={16} />
                      </button>
                      <button className="chart-action-btn" onClick={() => handleExportData('sales-chart')}>
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#4CAF50" 
                          strokeWidth={2}
                          dot={{ stroke: '#4CAF50', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="orders" 
                          stroke="#2196F3" 
                          strokeWidth={2}
                          dot={{ stroke: '#2196F3', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Sales by Category</h3>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <div className="section-header">
                  <h2>Quick Actions</h2>
                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={() => handleAddProduct()}>
                      <Plus size={18} />
                      Add Product
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/orders/new')}>
                      <ShoppingCart size={18} />
                      Create Order
                    </button>
                  </div>
                </div>
                <div className="actions-grid">
                  <button 
                    className="action-card"
                    onClick={handleAddProduct}
                  >
                    <div className="action-icon">
                      <Plus size={32} />
                    </div>
                    <div className="action-content">
                      <h4>Add New Product</h4>
                      <p>List your farm products for sale</p>
                    </div>
                    <ArrowRight size={20} className="action-arrow" />
                  </button>
                  
                  <button 
                    className="action-card"
                    onClick={() => setActiveTab('inventory')}
                  >
                    <div className="action-icon">
                      <Package size={32} />
                    </div>
                    <div className="action-content">
                      <h4>Manage Inventory</h4>
                      <p>Update stock and manage supplies</p>
                    </div>
                    <ArrowRight size={20} className="action-arrow" />
                  </button>
                  
                  <button 
                    className="action-card"
                    onClick={() => setActiveTab('orders')}
                  >
                    <div className="action-icon">
                      <ShoppingCart size={32} />
                    </div>
                    <div className="action-content">
                      <h4>Process Orders</h4>
                      <p>Review and fulfill customer orders</p>
                    </div>
                    <ArrowRight size={20} className="action-arrow" />
                  </button>
                  
                  <button 
                    className="action-card"
                    onClick={() => navigate('/farmer/profile')}
                  >
                    <div className="action-icon">
                      <User size={32} />
                    </div>
                    <div className="action-content">
                      <h4>Update Profile</h4>
                      <p>Edit farm information and settings</p>
                    </div>
                    <ArrowRight size={20} className="action-arrow" />
                  </button>
                </div>
              </div>

              {/* Recent Orders & Products */}
              <div className="recent-section">
                <div className="section-columns">
                  <div className="column">
                    <div className="section-header">
                      <h2>Recent Orders</h2>
                      <button 
                        className="view-all-btn"
                        onClick={() => setActiveTab('orders')}
                      >
                        View All <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="orders-list">
                      {sampleOrders.slice(0, 4).map(order => (
                        <div key={order.id} className="order-card">
                          <div className="order-header">
                            <div className="order-id">{order.id}</div>
                            <div className={`order-payment ${order.payment.toLowerCase()}`}>
                              {order.payment}
                            </div>
                          </div>
                          <div className="order-info">
                            <div className="order-customer">
                              <User size={14} />
                              {order.customer}
                            </div>
                            <div className="order-product">{order.product}</div>
                          </div>
                          <div className="order-details">
                            <div className="order-quantity">{order.quantity} kg</div>
                            <div className="order-total">₹{order.total}</div>
                            <div className="order-status">
                              {getStatusIcon(order.status)}
                              <span className={`status-text ${order.status}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="column">
                    <div className="section-header">
                      <h2>Low Stock Products</h2>
                      <button 
                        className="view-all-btn"
                        onClick={() => setActiveTab('products')}
                      >
                        View All <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="products-list">
                      {sampleProducts.filter(p => p.stock < 100).map(product => (
                        <div key={product.id} className="stock-alert-card">
                          <div className="product-image">
                            <img src={product.image} alt={product.name} />
                          </div>
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            <div className="stock-info">
                              <span className="stock-label">Stock:</span>
                              <span className={`stock-value ${product.stock < 50 ? 'critical' : 'low'}`}>
                                {product.stock} {product.unit}
                              </span>
                            </div>
                          </div>
                          <button className="restock-btn">
                            <RefreshCw size={16} />
                            Restock
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="section-header">
                <div className="header-left">
                  <h2>Product Management</h2>
                  <span className="count-badge">{filteredProducts.length} products</span>
                </div>
                <div className="header-right">
                  <div className="filter-bar">
                    <select 
                      className="filter-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                    <button className="btn-primary" onClick={handleAddProduct}>
                      <Plus size={18} />
                      Add Product
                    </button>
                    <button className="btn-secondary" onClick={() => handleExportData('products')}>
                      <Download size={18} />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="products-management-grid">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-management-card">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      {product.organicCertified && (
                        <span className="organic-badge">
                          <Shield size={12} />
                          Organic
                        </span>
                      )}
                    </div>
                    
                    <div className="product-content">
                      <div className="product-header">
                        <div>
                          <h3 className="product-name">{product.name}</h3>
                          <span className="product-category">{product.category}</span>
                        </div>
                        <div className="product-price">
                          ₹{product.price}<span className="unit">/{product.unit}</span>
                        </div>
                      </div>
                      
                      <p className="product-description">{product.description}</p>
                      
                      <div className="product-tags">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                      
                      <div className="product-stats">
                        <div className="stat">
                          <span className="stat-label">Stock:</span>
                          <span className={`stat-value ${product.stock < 100 ? 'warning' : ''}`}>
                            {product.stock} {product.unit}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Sold:</span>
                          <span className="stat-value">{product.sold} {product.unit}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Revenue:</span>
                          <span className="stat-value">₹{(product.price * product.sold).toLocaleString()}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Rating:</span>
                          <span className="stat-value">⭐ {product.rating}</span>
                        </div>
                      </div>

                      <div className="product-footer">
                        <div className="product-status">
                          {getStatusIcon(product.status)}
                          <span className={`status-text ${product.status}`}>
                            {getStatusText(product.status)}
                          </span>
                        </div>
                        <div className="product-actions">
                          <button className="action-btn view">
                            <Eye size={16} />
                          </button>
                          <button className="action-btn edit">
                            <Edit size={16} />
                          </button>
                          <button className="action-btn more">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab - Similar enhancements as Products tab */}
          {/* Analytics Tab - Enhanced with more charts */}
          {/* Other tabs would follow similar patterns */}

        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <button 
          className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          className={`mobile-nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={20} />
          <span>Products</span>
        </button>
        <button 
          className={`mobile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingCart size={20} />
          <span>Orders</span>
        </button>
        <button 
          className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={20} />
          <span>Analytics</span>
        </button>
        <button 
          className="mobile-nav-item"
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default FarmerPortal;