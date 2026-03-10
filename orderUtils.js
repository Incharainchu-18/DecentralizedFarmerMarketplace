import React, { useState, useEffect } from 'react';
import './Orders.css';

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null);
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Error parsing orders:', error);
        // Load sample orders if localStorage is corrupted
        setOrders(getSampleOrders());
      }
    } else {
      // Load sample orders if no orders in localStorage
      setOrders(getSampleOrders());
    }
  }, []);

  // Sample orders fallback
  const getSampleOrders = () => {
    return [
      {
        id: 'ORD-2845',
        date: '2025-11-15',
        status: 'delivered',
        total: 1845,
        items: [
          { name: 'Alphonso Mangoes', quantity: 2, price: 300, category: 'Fruits' },
          { name: 'Organic Tomatoes', quantity: 3, price: 80, category: 'Vegetables' },
          { name: 'Farm Fresh Milk', quantity: 2, price: 60, category: 'Dairy' },
          { name: 'Country Eggs', quantity: 1, price: 120, category: 'Dairy' }
        ],
        farmer: 'Happy Fruit Farms',
        deliveryAddress: 'Bus stand Road, Kumta, Karnataka - 581332',
        estimatedDelivery: '2025-11-16',
        actualDelivery: '2025-11-16 14:30',
        paymentMethod: 'UPI',
        trackingNumber: 'TRK784521369',
        tracking: [
          { status: 'Order Placed', timestamp: '2024-01-15 10:30', location: 'Farm' },
          { status: 'Processing', timestamp: '2024-01-15 14:15', location: 'Packing Center' },
          { status: 'Shipped', timestamp: '2024-01-16 09:00', location: 'Bangalore Hub' },
          { status: 'Out for Delivery', timestamp: '2024-01-16 12:45', location: 'Local Center' },
          { status: 'Delivered', timestamp: '2024-01-16 14:30', location: 'Your Address' }
        ]
      }
      // ... other sample orders
    ];
  };

  // Function to add new order (call this when user clicks Buy Now)
  const addNewOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      total: orderData.total,
      items: orderData.items,
      farmer: orderData.farmer || 'Multiple Farmers',
      deliveryAddress: orderData.deliveryAddress || 'Your default address',
      estimatedDelivery: getEstimatedDeliveryDate(),
      actualDelivery: null,
      paymentMethod: orderData.paymentMethod || 'UPI',
      trackingNumber: `TRK${Math.random().toString().slice(2, 11)}`,
      tracking: [
        { 
          status: 'Order Placed', 
          timestamp: new Date().toLocaleString(), 
          location: 'Farm' 
        }
      ]
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    return newOrder;
  };

  const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  };

  // Rest of your existing functions remain the same...
  const filterOrders = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  // ... keep all your existing functions (getStatusIcon, getStatusText, handleCancelOrder, etc.)

  const filteredOrders = filterOrders(activeFilter);

  return (
    <div className="orders-page">
      {/* Your existing JSX remains the same */}
    </div>
  );
};

export default Orders;