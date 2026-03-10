// Orders.jsx (enhanced)
// Assumes Orders.css is imported in the parent or same folder.
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

/**
 * NOTE: I used the uploaded screenshot as a temporary product image placeholder.
 * Path: /mnt/data/17dbc047-1ba7-4998-83e2-4e2094c443e8.png
 * Replace with your CDN or real image URLs as needed.
 */
const DEFAULT_IMG = '/mnt/data/17dbc047-1ba7-4998-83e2-4e2094c443e8.png';

/* ---------- Helpers ---------- */
const currency = (v) => `₹${(Number(v) || 0).toFixed(2)}`;
const confirmAction = (message) => window.confirm(message);
const notify = (msg) => window.alert(msg);

/* ---------- Static config ---------- */
const ORDER_STATUSES = {
  confirmed: { label: 'Confirmed', color: '#3498db', icon: '✅', description: 'Your order has been confirmed', progress: 20 },
  processing: { label: 'Processing', color: '#f39c12', icon: '🔄', description: 'Preparing for shipment', progress: 40 },
  packed: { label: 'Packed', color: '#9b59b6', icon: '📦', description: 'Packed and ready', progress: 60 },
  shipped: { label: 'Shipped', color: '#8e44ad', icon: '🚚', description: 'Dispatched', progress: 80 },
  'out-for-delivery': { label: 'Out for Delivery', color: '#e67e22', icon: '🏍️', description: 'Out for delivery', progress: 90 },
  delivered: { label: 'Delivered', color: '#27ae60', icon: '🎉', description: 'Delivered', progress: 100 },
  cancelled: { label: 'Cancelled', color: '#e74c3c', icon: '❌', description: 'Order cancelled', progress: 0 },
  returned: { label: 'Returned', color: '#95a5a6', icon: '↩️', description: 'Returned', progress: 0 },
  refunded: { label: 'Refunded', color: '#2ecc71', icon: '💸', description: 'Refund processed', progress: 100 }
};

const DELIVERY_AGENTS = [
  { id: 1, name: 'Rajesh Kumar', phone: '+91 9876543210', vehicle: 'Bike', rating: 4.8, photo: '👨‍💼', completedDeliveries: 1247, area: 'Whitefield' },
  { id: 2, name: 'Priya Sharma', phone: '+91 9876543211', vehicle: 'Scooter', rating: 4.9, photo: '👩‍💼', completedDeliveries: 892, area: 'Koramangala' },
  { id: 3, name: 'Amit Patel', phone: '+91 9876543212', vehicle: 'Van', rating: 4.7, photo: '👨‍🚚', completedDeliveries: 1563, area: 'Electronic City' }
];

const RETURN_REASONS = [
  'Product damaged', 'Wrong item received', 'Quality not as expected', 'Changed my mind', 'Delivery too late', 'Missing items', 'Expired product', 'Other'
];

/* ---------- Main Component ---------- */
const Orders = () => {
  const navigate = useNavigate();

  // Data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrders, setSelectedOrders] = useState(() => new Set());

  // local refs
  const searchTimer = useRef(null);

  /* --- Load orders once on mount and listen to storage changes --- */
  useEffect(() => {
    loadOrders();

    const onStorage = (e) => {
      if (e.key === 'orders') loadOrders();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Data loaders & generators ---------- */
  const loadOrders = useCallback(() => {
    setLoading(true);
    try {
      const raw = localStorage.getItem('orders');
      const data = raw ? JSON.parse(raw) : [];
      if (!data || !data.length) {
        const sample = generateSampleOrders();
        setOrders(sample);
        localStorage.setItem('orders', JSON.stringify(sample));
      } else {
        // ensure normalized and sorted
        const normalized = data.map(normalizeOrder);
        normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(normalized);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      const sample = generateSampleOrders();
      setOrders(sample);
      localStorage.setItem('orders', JSON.stringify(sample));
    } finally {
      setLoading(false);
    }
  }, []);

  const normalizeOrder = (order = {}) => {
    // keep stable ID and defaults
    const id = order.id || `ORD${Date.now() + Math.floor(Math.random() * 1000)}`;
    return {
      id,
      date: order.date || new Date().toISOString(),
      status: order.status || 'confirmed',
      items: Array.isArray(order.items) ? order.items : (order.items ? [order.items] : []),
      total: order.total || { subtotal: 0, discountAmount: 0, gstAmount: 0, deliveryCharge: 0, finalTotal: 0 },
      deliveryAddress: order.deliveryAddress || {},
      deliverySlot: order.deliverySlot || '',
      paymentMethod: order.paymentMethod || '',
      paymentDetails: order.paymentDetails || {},
      customer: order.customer || {},
      couponUsed: order.couponUsed || null,
      trackingNumber: order.trackingNumber || `TRK${Math.floor(Math.random() * 1000000)}`.padStart(10, '0'),
      estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      deliveryAgent: order.deliveryAgent || DELIVERY_AGENTS[Math.floor(Math.random() * DELIVERY_AGENTS.length)],
      tracking: order.tracking || generateTrackingData(order.status || 'confirmed'),
      createdAt: order.createdAt || order.date || new Date().toISOString(),
      updatedAt: order.updatedAt || new Date().toISOString(),
      rating: order.rating || null,
      review: order.review || null,
      refund: order.refund || null
    };
  };

  const generateSampleOrders = () => {
    const baseNow = Date.now();
    const sample = [
      {
        id: `ORD${baseNow}`,
        date: new Date(baseNow - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered',
        items: [
          { name: 'Organic Tomatoes', farmer: 'Green Farms Co.', price: 42, quantity: 2, unit: 'kg', images: [DEFAULT_IMG], organic: true, category: 'Vegetables', farmerRating: 4.8, farmerContact: '+91 9876543201' },
          { name: 'Fresh Carrots', farmer: 'Happy Farms', price: 32, quantity: 1, unit: 'kg', images: [DEFAULT_IMG], organic: true, category: 'Vegetables', farmerRating: 4.6, farmerContact: '+91 9876543202' }
        ],
        total: { subtotal: 116, discountAmount: 10, gstAmount: 5.3, deliveryCharge: 0, finalTotal: 111.3 },
        deliveryAddress: { fullName: 'Inchara', address: '123 Farm Street', city: 'Bangalore', state: 'Karnataka', pincode: '560001', phone: '+91 7892399975' },
        deliverySlot: '9:00 AM - 12:00 PM',
        paymentMethod: 'UPI',
        paymentDetails: { method: 'Google Pay', transactionId: `TXN${Math.floor(Math.random() * 1000000)}`, status: 'completed' },
        trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}`,
        estimatedDelivery: new Date(baseNow - 24 * 60 * 60 * 1000).toISOString(),
        liveTracking: null,
        deliveryAgent: DELIVERY_AGENTS[0],
        rating: 5,
        review: 'Fresh and good quality vegetables!'
      },
      {
        id: `ORD${baseNow + 1}`,
        date: new Date(baseNow - 1 * 60 * 60 * 1000).toISOString(),
        status: 'out-for-delivery',
        items: [
          { name: 'Fresh Apples', farmer: 'Coorg Orchards', price: 115, quantity: 1, unit: 'kg', images: [DEFAULT_IMG], organic: true, category: 'Fruits', farmerRating: 4.9, farmerContact: '+91 9876543204' }
        ],
        total: { subtotal: 115, discountAmount: 0, gstAmount: 5.75, deliveryCharge: 0, finalTotal: 120.75 },
        deliveryAddress: { fullName: 'Inchara', address: '123 Farm Street', city: 'Bangalore', state: 'Karnataka', pincode: '560001', phone: '+91 7892399975' },
        deliverySlot: '2:00 PM - 5:00 PM',
        paymentMethod: 'Credit Card',
        paymentDetails: { method: 'Visa', transactionId: `TXN${Math.floor(Math.random() * 1000000)}`, status: 'completed' },
        trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}`,
        estimatedDelivery: new Date(baseNow + 4 * 60 * 60 * 1000).toISOString(),
        liveTracking: { lat: 12.9716, lng: 77.5946, lastUpdated: new Date().toISOString(), eta: '45 minutes' },
        deliveryAgent: DELIVERY_AGENTS[1]
      }
    ];
    return sample.map(normalizeOrder);
  };

  const generateTrackingData = (status) => {
    const now = new Date();
    const steps = [
      { status: 'Order Placed', timestamp: now.toLocaleString('en-IN'), location: 'Farmers Market', icon: '🛒', completed: true, description: 'Order placed' }
    ];
    if (['processing', 'packed', 'shipped', 'out-for-delivery', 'delivered'].includes(status)) {
      steps.push({ status: 'Processing', timestamp: new Date(now.getTime() + 60 * 60 * 1000).toLocaleString('en-IN'), location: 'Packaging', icon: '🏭', completed: true, description: 'Being packed' });
    }
    if (['packed', 'shipped', 'out-for-delivery', 'delivered'].includes(status)) {
      steps.push({ status: 'Packed', timestamp: new Date(now.getTime() + 2 * 60 * 60 * 1000).toLocaleString('en-IN'), location: 'Quality', icon: '📦', completed: true, description: 'Packed & QC' });
    }
    if (['shipped', 'out-for-delivery', 'delivered'].includes(status)) {
      steps.push({ status: 'Shipped', timestamp: new Date(now.getTime() + 3 * 60 * 60 * 1000).toLocaleString('en-IN'), location: 'Distribution Hub', icon: '🚚', completed: true, description: 'Dispatched' });
    }
    if (['out-for-delivery', 'delivered'].includes(status)) {
      steps.push({ status: 'Out for Delivery', timestamp: new Date(now.getTime() + 4 * 60 * 60 * 1000).toLocaleString('en-IN'), location: 'Local', icon: '🏍️', completed: status === 'delivered', description: 'On the way' });
    }
    if (status === 'delivered') {
      steps.push({ status: 'Delivered', timestamp: new Date(now.getTime() + 6 * 60 * 60 * 1000).toLocaleString('en-IN'), location: 'Your Address', icon: '🎉', completed: true, description: 'Delivered' });
    }
    return steps;
  };

  /* ---------- Memoized analytics & filtered list ---------- */
  const analytics = useMemo(() => {
    const totalSpent = orders.reduce((s, o) => s + (Number(o.total?.finalTotal) || 0), 0);
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const avgOrderValue = delivered > 0 ? totalSpent / delivered : 0;

    // favourite category
    const catCount = {};
    orders.forEach(o => o.items.forEach(it => {
      const c = it.category || 'General';
      catCount[c] = (catCount[c] || 0) + (Number(it.quantity) || 0);
    }));
    const favouriteCategory = Object.keys(catCount).length ? Object.keys(catCount).reduce((a, b) => (catCount[a] > catCount[b] ? a : b)) : 'Vegetables';

    // monthly spend
    const monthly = {};
    orders.forEach(o => {
      const key = new Date(o.date).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      monthly[key] = (monthly[key] || 0) + (Number(o.total?.finalTotal) || 0);
    });

    return { totalSpent, deliveredOrders: delivered, avgOrderValue, favouriteCategory, monthlySpending: monthly };
  }, [orders]);

  // Debounced searchTerm (to avoid excessive re-renders)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 220);
    return () => clearTimeout(searchTimer.current);
  }, [searchTerm]);

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      const matchesFilter = filter === 'all' || order.status === filter;
      const q = debouncedSearch.toLowerCase();
      const matchesSearch = !q || (
        (order.id || '').toLowerCase().includes(q) ||
        (order.trackingNumber || '').toLowerCase().includes(q) ||
        order.items.some(it => (it.name || '').toLowerCase().includes(q))
      );
      return matchesFilter && matchesSearch;
    });

    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.date) - new Date(a.date);
        case 'oldest': return new Date(a.date) - new Date(b.date);
        case 'price-high': return (b.total?.finalTotal || 0) - (a.total?.finalTotal || 0);
        case 'price-low': return (a.total?.finalTotal || 0) - (b.total?.finalTotal || 0);
        case 'status': return (a.status || '').localeCompare(b.status || '');
        default: return new Date(b.date) - new Date(a.date);
      }
    });

    return sorted;
  }, [orders, filter, debouncedSearch, sortBy]);

  /* ---------- Actions (useCallback for stable refs) ---------- */
  const saveOrders = useCallback((newOrders) => {
    setOrders(newOrders);
    localStorage.setItem('orders', JSON.stringify(newOrders));
    window.dispatchEvent(new Event('ordersUpdated'));
  }, []);

  const cancelOrder = useCallback((orderId, reason = 'Customer requested') => {
    if (!confirmAction('Are you sure you want to cancel this order?')) return;
    const updated = orders.map(o => o.id === orderId ? {
      ...o,
      status: 'cancelled',
      cancellation: { reason, timestamp: new Date().toISOString(), refundStatus: 'processing' },
      tracking: [...(o.tracking || []), { status: 'Cancelled', timestamp: new Date().toLocaleString('en-IN'), location: 'System', icon: '❌', completed: true, description: `Cancelled: ${reason}` }]
    } : o);
    saveOrders(updated);
  }, [orders, saveOrders]);

  const reorder = useCallback((order) => {
    const cartItems = (order.items || []).map(it => ({ ...it, addedAt: new Date().toISOString(), market: 'Reorder' }));
    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  }, [navigate]);

  const requestReturn = useCallback((orderId, reason, comments = '') => {
    if (!confirmAction('Submit return request?')) return;
    const updated = orders.map(o => o.id === orderId ? {
      ...o,
      status: 'returned',
      return: { reason, comments, requestedAt: new Date().toISOString(), status: 'pending', pickupScheduled: false },
      tracking: [...(o.tracking || []), { status: 'Return Requested', timestamp: new Date().toLocaleString('en-IN'), location: 'System', icon: '↩️', completed: true, description: `Return: ${reason}` }]
    } : o);
    saveOrders(updated);
    notify('Return request submitted. Our team will contact you.');
  }, [orders, saveOrders]);

  const downloadInvoice = useCallback((order) => {
    const invoice = generateInvoiceContent(order);
    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invoice-${order.id}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }, []);

  const submitReview = useCallback((orderId, rating, review, packagingRating, deliveryRating) => {
    const updated = orders.map(o => o.id === orderId ? ({ ...o, rating, review, packaging: { rating: packagingRating }, delivery: { rating: deliveryRating }, reviewedAt: new Date().toISOString() }) : o);
    saveOrders(updated);
    notify('Thanks for your review!');
  }, [orders, saveOrders]);

  const contactFarmer = useCallback((phone, name) => {
    if (confirmAction(`Call ${name} at ${phone}?`)) window.open(`tel:${phone}`);
  }, []);

  const contactDeliveryAgent = useCallback((agent) => {
    if (!agent) return notify('No agent assigned.');
    if (confirmAction(`Call ${agent.name} at ${agent.phone}?`)) window.open(`tel:${agent.phone}`);
  }, []);

  const trackOnMap = useCallback((order) => {
    if (!order?.liveTracking) return notify('Live tracking not available.');
    const { lat, lng } = order.liveTracking;
    window.open(`https://maps.google.com?q=${lat},${lng}`, '_blank');
  }, []);

  /* Bulk actions */
  const toggleOrderSelection = useCallback((orderId) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedOrders.size === filteredAndSortedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredAndSortedOrders.map(o => o.id)));
    }
  }, [selectedOrders, filteredAndSortedOrders]);

  const bulkReorder = useCallback(() => {
    const ordersData = orders.filter(o => selectedOrders.has(o.id));
    const items = ordersData.flatMap(o => (o.items || []).map(i => ({ ...i, addedAt: new Date().toISOString() })));
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
    setSelectedOrders(new Set());
    navigate('/cart');
  }, [orders, selectedOrders, navigate]);

  const bulkDownloadInvoices = useCallback(() => {
    selectedOrders.forEach(id => {
      const order = orders.find(o => o.id === id);
      if (order) downloadInvoice(order);
    });
  }, [selectedOrders, orders, downloadInvoice]);

  /* ---------- Small util view functions ---------- */
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  /* ---------- Invoice generator (string) ---------- */
  const generateInvoiceContent = (order) => {
    return [
      'FARMERS MARKET - TAX INVOICE',
      '==============================',
      `Invoice No: ${order.id}`,
      `Date: ${formatDateTime(order.date)}`,
      `Order Status: ${order.status.toUpperCase()}`,
      '',
      'BILL TO:',
      order.deliveryAddress.fullName,
      order.deliveryAddress.address,
      `${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`,
      `Phone: ${order.deliveryAddress.phone}`,
      '',
      'ITEMS:',
      ...(order.items || []).map(it => [
        `  ${it.name}`,
        `    Farmer: ${it.farmer}`,
        `    Quantity: ${it.quantity} ${it.unit}`,
        `    Rate: ${currency(it.price)}/${it.unit}`,
        `    Amount: ${currency(it.price * it.quantity)}`,
        `    ${it.organic ? '🌱 Organic' : ''}`
      ].join('\n')),
      '',
      'PRICE BREAKDOWN:',
      `Subtotal: ${currency(order.total?.subtotal)}`,
      `Discount: -${currency(order.total?.discountAmount)}`,
      `GST (5%): ${currency(order.total?.gstAmount)}`,
      `Delivery: ${currency(order.total?.deliveryCharge)}`,
      `TOTAL: ${currency(order.total?.finalTotal)}`,
      '',
      `Payment Method: ${order.paymentMethod}`,
      `Transaction ID: ${order.paymentDetails?.transactionId || '-'}`,
      `Delivery Slot: ${order.deliverySlot}`,
      `Tracking Number: ${order.trackingNumber}`,
      '',
      'Thank you for your purchase!',
      '=============================='
    ].join('\n');
  };

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div className="orders-loading" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Header & Stats */}
      <div className="orders-header card" aria-hidden={false}>
        <h1>📦 Your Orders</h1>
        <p>Track, manage and re-order your purchases</p>

        <div className="orders-stats" role="region" aria-label="Order stats">
          <div className="stat-card card">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card card">
            <div className="stat-value">{orders.filter(o => o.status === 'delivered').length}</div>
            <div className="stat-label">Delivered</div>
          </div>
          <div className="stat-card card">
            <div className="stat-value">{currency(analytics.totalSpent)}</div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card card">
            <div className="stat-value">{analytics.favouriteCategory}</div>
            <div className="stat-label">Favourite Category</div>
          </div>
        </div>
      </div>

      {/* Analytics */}
      {orders.length > 0 && (
        <div className="analytics-section card">
          <h3>📊 Order Analytics</h3>
          <div className="analytics-cards">
            <div className="analytics-card">
              <div className="analytics-icon">💰</div>
              <div className="analytics-content">
                <div className="analytics-value">{currency(analytics.avgOrderValue)}</div>
                <div className="analytics-label">Average Order Value</div>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">📈</div>
              <div className="analytics-content">
                <div className="analytics-value">{analytics.deliveredOrders}</div>
                <div className="analytics-label">Successful Deliveries</div>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">⭐</div>
              <div className="analytics-content">
                <div className="analytics-value">
                  {(() => {
                    const rated = orders.filter(o => o.rating);
                    if (!rated.length) return '0.0';
                    const avg = (rated.reduce((s, o) => s + o.rating, 0) / rated.length).toFixed(1);
                    return avg;
                  })()}
                </div>
                <div className="analytics-label">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="orders-controls card" role="region" aria-label="Order controls">
        <div className="controls-top">
          <div className="search-sort-container">
            <div className="search-box">
              <input
                aria-label="Search orders"
                type="text"
                placeholder="🔍 Search orders, products, or tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select aria-label="Sort orders" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="status">By Status</option>
            </select>
          </div>

          {/* bulk actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={selectAll} aria-pressed={selectedOrders.size === filteredAndSortedOrders.length}>
              {selectedOrders.size === filteredAndSortedOrders.length ? 'Unselect All' : `Select All (${filteredAndSortedOrders.length})`}
            </button>
            {selectedOrders.size > 0 && (
              <>
                <button className="btn btn--sm" onClick={bulkReorder}>🔄 Reorder All</button>
                <button className="btn btn--sm" onClick={bulkDownloadInvoices}>📄 Download Invoices</button>
                <button className="btn btn--sm" onClick={() => setSelectedOrders(new Set())}>❌ Clear</button>
              </>
            )}
          </div>
        </div>

        <div className="orders-filters" role="tablist" aria-label="Order filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Orders ({orders.length})</button>
          {Object.entries(ORDER_STATUSES).map(([k, info]) => (
            <button
              key={k}
              className={`filter-btn ${filter === k ? 'active' : ''}`}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
            >
              <span aria-hidden>{info.icon}</span> {info.label} ({orders.filter(o => o.status === k).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-list" role="list">
        {filteredAndSortedOrders.map(order => {
          const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.confirmed;
          const progress = statusInfo.progress || 0;
          return (
            <article key={order.id} className="order-card card" role="listitem" aria-labelledby={`order-${order.id}`}>
              <header className="order-header" role="group" aria-labelledby={`order-${order.id}`}>
                <div className="order-selection">
                  <input
                    aria-label={`Select ${order.id}`}
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => toggleOrderSelection(order.id)}
                    className="order-checkbox"
                  />
                </div>

                <div className="order-info" style={{ minWidth: 0 }}>
                  <div id={`order-${order.id}`} className="order-id" style={{ fontWeight: 700 }}>Order #{order.id}</div>
                  <div className="order-date">{formatDate(order.date)} at {formatTime(order.date)}</div>
                </div>

                <div className="order-status" style={{ color: statusInfo.color, borderColor: statusInfo.color }}>
                  <span aria-hidden>{statusInfo.icon}</span> {statusInfo.label}
                </div>
              </header>

              {/* Progress */}
              {!['cancelled','returned','refunded'].includes(order.status) && (
                <div className="progress-section">
                  <div className="progress-bar" aria-hidden>
                    <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: statusInfo.color }} />
                  </div>
                  <div className="progress-text">
                    <span>{Math.round(progress)}% Complete • {statusInfo.description}</span>
                    {order.liveTracking && <button className="btn btn--sm" onClick={() => trackOnMap(order)}>📍 Live Location</button>}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="order-items" aria-label={`Items in ${order.id}`}>
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="item-image">
                      {item.images?.[0] && typeof item.images[0] === 'string' && item.images[0].startsWith('http') ? (
                        <img src={item.images[0]} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div className="item-emoji">{item.images?.[0] || '🌱'}</div>
                      )}
                    </div>

                    <div className="item-details">
                      <h4 className="item-name" style={{ margin: 0 }}>{item.name}</h4>
                      <p className="item-farmer" style={{ margin: 0 }}>
                        By {item.farmer || 'Local Farmer'}
                        <span className="farmer-rating" aria-hidden> ⭐ {item.farmerRating || 4.5}</span>
                      </p>
                      <p className="item-quantity" style={{ margin: 0 }}>Quantity: {item.quantity} {item.unit}</p>
                      <div className="item-tags">
                        {item.organic && <span className="organic-badge">🌱 Organic</span>}
                        <span className="category-tag">{item.category || 'General'}</span>
                      </div>
                    </div>

                    <div style={{ marginLeft: 12, fontWeight: 700 }}>{currency(item.price * (item.quantity || 1))}</div>

                    <button className="contact-farmer-btn" aria-label={`Call farmer ${item.farmer}`} onClick={() => contactFarmer(item.farmerContact, item.farmer)}>📞</button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="order-summary">
                <div className="delivery-info">
                  <div className="info-item">
                    <span className="label">📅 Delivery Slot:</span>
                    <span className="value">{order.deliverySlot || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">📦 Tracking:</span>
                    <span className="value">{order.trackingNumber}</span>
                  </div>
                  {order.deliveryAgent && (
                    <div className="info-item">
                      <span className="label">🚚 Agent:</span>
                      <span className="value">
                        {order.deliveryAgent.name} ({order.deliveryAgent.vehicle})
                        <button className="contact-agent-btn" onClick={() => contactDeliveryAgent(order.deliveryAgent)}>📞</button>
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-total">
                  <div className="total-label">Order Total:</div>
                  <div className="total-amount">{currency(order.total?.finalTotal)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="order-actions">
                {order.status === 'confirmed' && <button className="cancel-btn" onClick={() => cancelOrder(order.id)}>❌ Cancel Order</button>}
                {order.status === 'delivered' && <><button className="reorder-btn" onClick={() => reorder(order)}>🔄 Reorder</button><button className="return-btn" onClick={() => setSelectedOrder({...order, showReturn: true})}>↩️ Return</button></>}
                {order.status === 'out-for-delivery' && order.liveTracking && <button className="track-live-btn" onClick={() => trackOnMap(order)}>🗺️ Live Track</button>}
                <button className="track-btn" onClick={() => setTrackingModal(order)}>📍 Track Order</button>
                <button className="details-btn" onClick={() => setSelectedOrder(order)}>👁️ View Details</button>
                <button className="invoice-btn" onClick={() => downloadInvoice(order)}>📄 Invoice</button>
              </div>

              {/* Review */}
              {order.rating && (
                <div className="review-section">
                  <div className="rating-overview">
                    <div className="rating-stars" aria-hidden>{'⭐'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}<span className="rating-value">{order.rating}/5</span></div>
                    {order.review && <p className="review-text">"{order.review}"</p>}
                    <div className="review-date">Reviewed on {formatDate(order.reviewedAt || order.date)}</div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* No results */}
      {filteredAndSortedOrders.length === 0 && (
        <div className="no-orders-filter card">
          <div className="no-orders-icon">🔍</div>
          <h3>No orders found</h3>
          <p>No orders match the current filter / search.</p>
          <button className="clear-filter-btn" onClick={() => { setFilter('all'); setSearchTerm(''); }}>Show All Orders</button>
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          submitReview={submitReview}
          requestReturn={requestReturn}
          returnReasons={RETURN_REASONS}
          contactFarmer={contactFarmer}
          contactDeliveryAgent={contactDeliveryAgent}
          trackOnMap={trackOnMap}
          formatDate={formatDate}
          formatTime={formatTime}
          formatDateTime={formatDateTime}
        />
      )}

      {trackingModal && (
        <TrackingModal order={trackingModal} onClose={() => setTrackingModal(null)} formatDateTime={formatDateTime} />
      )}
    </div>
  );
};

/* ---------- OrderDetailsModal (kept inline for simplicity) ---------- */
const OrderDetailsModal = ({ order, onClose, submitReview, requestReturn, returnReasons, contactFarmer, contactDeliveryAgent, trackOnMap, formatDate, formatTime, formatDateTime }) => {
  const [showReviewForm, setShowReviewForm] = useState(order?.showReview || false);
  const [showReturnForm, setShowReturnForm] = useState(order?.showReturn || false);
  const [rating, setRating] = useState(order.rating || 0);
  const [reviewText, setReviewText] = useState(order.review || '');
  const [packagingRating, setPackagingRating] = useState(order.packaging?.rating || 0);
  const [deliveryRating, setDeliveryRating] = useState(order.delivery?.rating || 0);
  const [returnReason, setReturnReason] = useState('');
  const [returnComments, setReturnComments] = useState('');

  if (!order) return null;

  const handleSubmitReview = () => {
    if (!rating) return notify('Please select a rating.');
    submitReview(order.id, rating, reviewText, packagingRating, deliveryRating);
    onClose();
  };

  const handleSubmitReturn = () => {
    if (!returnReason) return notify('Please select a return reason.');
    requestReturn(order.id, returnReason, returnComments);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={`modal-${order.id}`}>
        <div className="modal-header">
          <h3 id={`modal-${order.id}`}>Order Details - #{order.id}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <div className="modal-body">
          {/* Order info */}
          <div className="detail-section">
            <h4>📋 Order Information</h4>
            <div className="detail-grid">
              <div className="detail-item"><span className="label">Order Date:</span><span className="value">{formatDateTime(order.date)}</span></div>
              <div className="detail-item"><span className="label">Status:</span><span className="value status-badge">{ORDER_STATUSES[order.status]?.icon} {ORDER_STATUSES[order.status]?.label}</span></div>
              <div className="detail-item"><span className="label">Payment Method:</span><span className="value">{order.paymentMethod}</span></div>
              <div className="detail-item"><span className="label">Transaction ID:</span><span className="value">{order.paymentDetails?.transactionId || '-'}</span></div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="detail-section">
            <h4>🚚 Delivery Information</h4>
            <div className="detail-grid">
              <div className="detail-item"><span className="label">Delivery Slot:</span><span className="value">{order.deliverySlot || '-'}</span></div>
              <div className="detail-item"><span className="label">Estimated Delivery:</span><span className="value">{formatDate(order.estimatedDelivery)}</span></div>
              {order.actualDelivery && <div className="detail-item"><span className="label">Actual Delivery:</span><span className="value">{formatDateTime(order.actualDelivery)}</span></div>}
              {order.deliveryAgent && <>
                <div className="detail-item"><span className="label">Delivery Agent:</span><span className="value">{order.deliveryAgent.photo} {order.deliveryAgent.name} <button className="contact-btn-small" onClick={() => contactDeliveryAgent(order.deliveryAgent)}>📞</button></span></div>
                <div className="detail-item"><span className="label">Vehicle:</span><span className="value">{order.deliveryAgent.vehicle}</span></div>
                <div className="detail-item"><span className="label">Agent Rating:</span><span className="value">⭐ {order.deliveryAgent.rating}</span></div>
              </>}
              <div className="detail-item full-width"><span className="label">Delivery Address:</span><span className="value">{order.deliveryAddress.fullName}<br/>{order.deliveryAddress.address}<br/>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}<br/>📞 {order.deliveryAddress.phone}</span></div>
            </div>
          </div>

          {/* Items */}
          <div className="detail-section">
            <h4>🛒 Order Items ({order.items.length})</h4>
            <div className="items-list">
              {order.items.map((it, i) => (
                <div key={i} className="item-detail">
                  <div className="item-image">{it.images?.[0] ? <img src={it.images[0]} alt={it.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} /> : <div className="item-emoji">🌱</div>}</div>
                  <div className="item-info">
                    <h5>{it.name}</h5>
                    <p>By {it.farmer} <span className="farmer-rating">⭐ {it.farmerRating || 4.5}</span><button className="contact-btn-small" onClick={() => contactFarmer(it.farmerContact, it.farmer)}>📞</button></p>
                    <p>Quantity: {it.quantity} {it.unit}</p>
                    <div className="item-tags">{it.organic && <span className="organic-badge">🌱 Organic</span>}<span className="category-tag">{it.category || 'General'}</span></div>
                  </div>
                  <div className="item-pricing"><div className="price">{currency(it.price)}/{it.unit}</div><div className="total">{currency(it.price * it.quantity)}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="detail-section">
            <h4>💰 Price Breakdown</h4>
            <div className="price-breakdown">
              <div className="price-row"><span>Subtotal:</span><span>{currency(order.total?.subtotal)}</span></div>
              {order.couponUsed && <div className="price-row discount"><span>Discount ({order.couponUsed.code}):</span><span>-{currency(order.total?.discountAmount)}</span></div>}
              <div className="price-row"><span>GST (5%):</span><span>{currency(order.total?.gstAmount)}</span></div>
              <div className="price-row"><span>Delivery:</span><span>{currency(order.total?.deliveryCharge)}</span></div>
              <div className="price-row total"><span>Total Amount:</span><span>{currency(order.total?.finalTotal)}</span></div>
            </div>
          </div>

          {/* Refund / review / return forms */}
          {order.refund && <div className="detail-section"><h4>💸 Refund Info</h4><div className="detail-grid"><div className="detail-item"><span className="label">Amount:</span><span className="value">{currency(order.refund.amount)}</span></div><div className="detail-item"><span className="label">Date:</span><span className="value">{formatDateTime(order.refund.date)}</span></div><div className="detail-item full-width"><span className="label">Reason:</span><span className="value">{order.refund.reason}</span></div></div></div>}

          {!order.rating && order.status === 'delivered' && !showReviewForm && <div className="detail-section"><h4>⭐ Rate Your Order</h4><button className="add-review-btn" onClick={() => setShowReviewForm(true)}>Write a Review</button></div>}

          {showReviewForm && (
            <div className="detail-section">
              <h4>⭐ Write a Review</h4>
              <div className="review-form">
                <label>Overall Rating</label>
                <div className="star-rating">{[1,2,3,4,5].map(s => <button key={s} className={`star-btn ${s <= rating ? 'active' : ''}`} onClick={() => setRating(s)}>{'⭐'}</button>)}</div>
                <label>Packaging</label>
                <div className="star-rating">{[1,2,3,4,5].map(s => <button key={s} className={`star-btn ${s <= packagingRating ? 'active' : ''}`} onClick={() => setPackagingRating(s)}>📦</button>)}</div>
                <label>Delivery</label>
                <div className="star-rating">{[1,2,3,4,5].map(s => <button key={s} className={`star-btn ${s <= deliveryRating ? 'active' : ''}`} onClick={() => setDeliveryRating(s)}>🚚</button>)}</div>
                <label>Comments</label>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows="3" />
                <div className="review-actions">
                  <button className="submit-review-btn" onClick={handleSubmitReview}>Submit Review</button>
                  <button className="cancel-review-btn" onClick={() => setShowReviewForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showReturnForm && (
            <div className="detail-section">
              <h4>↩️ Request Return</h4>
              <div className="return-form">
                <label>Reason</label>
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
                  <option value="">Select</option>
                  {returnReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <label>Comments</label>
                <textarea value={returnComments} onChange={(e) => setReturnComments(e.target.value)} rows="3" />
                <div className="return-actions">
                  <button className="submit-return-btn" onClick={handleSubmitReturn}>Submit Return</button>
                  <button className="cancel-return-btn" onClick={() => setShowReturnForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {order.liveTracking && <button className="live-track-btn" onClick={() => trackOnMap(order)}>🗺️ Live Tracking</button>}
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ---------- TrackingModal (kept inline) ---------- */
const TrackingModal = ({ order, onClose, formatDateTime }) => {
  if (!order) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tracking-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header"><h3>📍 Track Order - #{order.id}</h3><button className="close-btn" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div className="tracking-info">
            <div><strong>Tracking Number:</strong> {order.trackingNumber}</div>
            <div><strong>Current Status:</strong> <span className="status-badge">{ORDER_STATUSES[order.status]?.icon} {ORDER_STATUSES[order.status]?.label}</span></div>
            {order.deliveryAgent && <div><strong>Agent:</strong> {order.deliveryAgent.photo} {order.deliveryAgent.name} ({order.deliveryAgent.vehicle}) • ⭐ {order.deliveryAgent.rating}</div>}
            {order.liveTracking && <div><strong>Live Status:</strong> <span className="live-indicator">● Live</span><br/><small>Last: {formatDateTime(order.liveTracking.lastUpdated)}</small><br/><small>ETA: {order.liveTracking.eta}</small></div>}
          </div>

          <div className="tracking-timeline">
            <h4>Order Timeline</h4>
            <div className="timeline">
              {order.tracking.map((step, idx) => (
                <div key={idx} className={`timeline-step ${step.completed ? 'completed' : ''} ${idx === order.tracking.length - 1 ? 'current' : ''}`}>
                  <div className="timeline-icon">{step.icon}</div>
                  <div className="timeline-content">
                    <div className="timeline-status">{step.status}</div>
                    <div className="timeline-location">{step.location}</div>
                    <div className="timeline-time">{step.timestamp}</div>
                    <div className="timeline-description">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
