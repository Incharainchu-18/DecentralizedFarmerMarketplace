// src/components/CartBadge.jsx
import React, { useState, useEffect, useCallback } from 'react';

// Utility function to get cart count
const getCartCount = () => {
  try {
    // Try cartManager first
    if (window.cartManager && typeof window.cartManager.getCartCount === 'function') {
      return window.cartManager.getCartCount();
    }
    
    // Fallback to localStorage
    const cartData = localStorage.getItem('cart');
    
    if (!cartData) {
      return 0;
    }
    
    const cart = JSON.parse(cartData);
    
    // Validate that cart is an array
    if (!Array.isArray(cart)) {
      return 0;
    }
    
    // Calculate total quantity
    const count = cart.reduce((total, item) => {
      if (!item || typeof item !== 'object') {
        return total;
      }
      const quantity = Number(item.quantity) || 1;
      return total + quantity;
    }, 0);
    
    return count;
    
  } catch (error) {
    console.error('Error reading cart count:', error);
    return 0;
  }
};

// Animation helper
const triggerBadgeAnimation = () => {
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.classList.remove('updated', 'pulse');
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        badge.classList.add('updated', 'pulse');
        
        setTimeout(() => {
          badge.classList.remove('pulse');
        }, 600);
      });
    });
  });
};

const CartBadge = () => {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = useCallback(() => {
    const count = getCartCount();
    
    setCartCount(prevCount => {
      if (prevCount !== count) {
        if (count > 0) {
          triggerBadgeAnimation();
        }
        return count;
      }
      return prevCount;
    });
  }, []);

  useEffect(() => {
    // Initial load
    updateCartCount();
    
    // Subscribe to cart updates
    let unsubscribe;
    if (window.cartManager && typeof window.cartManager.subscribe === 'function') {
      unsubscribe = window.cartManager.subscribe(updateCartCount);
    }

    // Event handlers with debouncing
    let updateTimeout;
    const handleCartUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateCartCount();
      }, 50);
    };

    const handleCartCountUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateCartCount();
      }, 50);
    };

    // Add event listeners
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartCountUpdated', handleCartCountUpdate);

    // Cleanup
    return () => {
      clearTimeout(updateTimeout);
      
      if (unsubscribe) {
        unsubscribe();
      }
      
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate);
    };
  }, [updateCartCount]);

  // Don't show badge if count is 0
  if (!cartCount || cartCount === 0) {
    return null;
  }
  
  return (
    <span 
      className="cart-badge"
      aria-label={`${cartCount} items in cart`}
      role="status"
      title={`${cartCount} items in cart`}
      data-count={cartCount}
    >
      {cartCount > 99 ? '99+' : cartCount}
    </span>
  );
};

export default CartBadge;