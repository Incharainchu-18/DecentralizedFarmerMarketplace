import React, { useState, useEffect } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Mock notifications data
    const mockNotifications = [
      {
        id: 1,
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #2845 has been successfully delivered',
        time: '2 hours ago',
        read: false,
        icon: '🚚'
      },
      {
        id: 2,
        type: 'promotion',
        title: 'Special Offer',
        message: 'Get 25% off on organic vegetables this weekend',
        time: '5 hours ago',
        read: false,
        icon: '🎁'
      },
      {
        id: 3,
        type: 'system',
        title: 'Profile Updated',
        message: 'Your profile information has been updated successfully',
        time: '1 day ago',
        read: true,
        icon: '✅'
      },
      {
        id: 4,
        type: 'order',
        title: 'Order Shipped',
        message: 'Your order #2841 is out for delivery',
        time: '2 days ago',
        read: true,
        icon: '📦'
      },
      {
        id: 5,
        type: 'farm',
        title: 'New Products Available',
        message: 'Fresh mangoes from Happy Farms are now available',
        time: '3 days ago',
        read: true,
        icon: '🥭'
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    return notif.type === activeTab;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="container">
          <h1 className="page-title">
            <i className="bi bi-bell"></i>
            Notifications
          </h1>
          <p className="page-subtitle">
            Stay updated with your orders and promotions
          </p>
        </div>
      </div>

      <div className="container">
        <div className="notifications-content">
          {/* Header Actions */}
          <div className="notifications-actions">
            <div className="tabs-container">
              <button 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button 
                className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              <button 
                className={`tab ${activeTab === 'order' ? 'active' : ''}`}
                onClick={() => setActiveTab('order')}
              >
                Orders
              </button>
              <button 
                className={`tab ${activeTab === 'promotion' ? 'active' : ''}`}
                onClick={() => setActiveTab('promotion')}
              >
                Promotions
              </button>
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn-outline-primary"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <i className="bi bi-check-all"></i>
                Mark All as Read
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {filteredNotifications.length === 0 ? (
              <div className="empty-notifications">
                <div className="empty-icon">
                  <i className="bi bi-bell-slash"></i>
                </div>
                <h3>No notifications</h3>
                <p>
                  {activeTab === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-icon">
                    {notification.icon}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                  </div>

                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        className="btn-mark-read"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <i className="bi bi-check"></i>
                      </button>
                    )}
                    <button 
                      className="btn-delete"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notification Preferences */}
          <div className="preferences-section">
            <h3>Notification Preferences</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <label>Order Updates</label>
                <div className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </div>
              </div>
              <div className="preference-item">
                <label>Promotional Offers</label>
                <div className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </div>
              </div>
              <div className="preference-item">
                <label>Farm Updates</label>
                <div className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </div>
              </div>
              <div className="preference-item">
                <label>Price Alerts</label>
                <div className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;