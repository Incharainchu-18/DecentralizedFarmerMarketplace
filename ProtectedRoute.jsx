// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const [state, setState] = useState({
    loading: true,
    ok: false,
    user: null,
    isAdmin: false
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const isAdmin = localStorage.getItem('adminAuth') === 'true';
      const adminEmail = localStorage.getItem('adminEmail');
      
      console.log("🔐 ProtectedRoute Check:", {
        hasToken: !!token,
        hasUser: !!userStr,
        isAdmin: isAdmin,
        allowedRole: allowedRole,
        currentPath: window.location.pathname
      });

      // Handle admin access
      if (allowedRole === 'admin') {
        if (isAdmin && adminEmail) {
          console.log("✅ Admin access granted");
          setState({ 
            loading: false, 
            ok: true, 
            user: { role: 'admin', email: adminEmail }, 
            isAdmin: true 
          });
          return;
        } else {
          console.log("❌ Admin access denied - not authenticated as admin");
          setState({ loading: false, ok: false, user: null, isAdmin: false });
          return;
        }
      }

      // Handle farmer access - STRICT AUTH REQUIRED
      if (allowedRole === 'farmer') {
        if (!token || !userStr) {
          console.log("❌ Farmer access denied - no auth data");
          setState({ loading: false, ok: false, user: null, isAdmin: false });
          return;
        }

        try {
          const user = JSON.parse(userStr);
          console.log("👤 Farmer check - User from storage:", user);
          
          if (user.role !== 'farmer') {
            console.log(`🚫 Farmer role required, but user is: ${user.role}`);
            setState({ loading: false, ok: false, user: null, isAdmin: false });
            return;
          }

          console.log("✅ Farmer access granted");
          setState({ 
            loading: false, 
            ok: true, 
            user,
            isAdmin: false 
          });
          
        } catch (error) {
          console.error("❌ Error parsing farmer user data:", error);
          setState({ loading: false, ok: false, user: null, isAdmin: false });
        }
        return;
      }

      // Handle user access - FOR CHECKOUT, ALLOW WITHOUT STRICT AUTH
      if (allowedRole === 'user') {
        if (!token || !userStr) {
          console.log("⚠️ No auth data for user route, but allowing for checkout flow");
          
          // Only create temporary session for checkout-related routes
          const isCheckoutRoute = window.location.pathname.includes('/checkout');
          
          if (isCheckoutRoute) {
            const tempUser = {
              name: 'Guest User',
              email: 'guest@example.com',
              role: 'user',
              temporary: true
            };
            
            localStorage.setItem('user', JSON.stringify(tempUser));
            localStorage.setItem('token', 'temp-token-' + Date.now());
            
            setState({ 
              loading: false, 
              ok: true, 
              user: tempUser,
              isAdmin: false 
            });
            return;
          } else {
            // For non-checkout user routes, require proper auth
            console.log("❌ User access denied - no auth data for non-checkout route");
            setState({ loading: false, ok: false, user: null, isAdmin: false });
            return;
          }
        }

        try {
          const user = JSON.parse(userStr);
          console.log("👤 User check - User from storage:", user);
          
          if (user.role !== 'user') {
            console.log(`🚫 User role required, but user is: ${user.role}`);
            setState({ loading: false, ok: false, user: null, isAdmin: false });
            return;
          }

          console.log("✅ User access granted");
          setState({ 
            loading: false, 
            ok: true, 
            user,
            isAdmin: false 
          });
          
        } catch (error) {
          console.error("❌ Error parsing user data:", error);
          setState({ loading: false, ok: false, user: null, isAdmin: false });
        }
        return;
      }

      // Handle no specific role (general protected routes)
      if (!token || !userStr) {
        console.log("❌ General protected route - no auth data");
        setState({ loading: false, ok: false, user: null, isAdmin: false });
        return;
      }

      try {
        const user = JSON.parse(userStr);
        console.log("👤 General access - User from storage:", user);
        
        console.log("✅ General protected access granted");
        setState({ 
          loading: false, 
          ok: true, 
          user,
          isAdmin: false 
        });
        
      } catch (error) {
        console.error("❌ Error parsing user data for general route:", error);
        setState({ loading: false, ok: false, user: null, isAdmin: false });
      }
    };

    checkAuth();
  }, [allowedRole]);

  if (state.loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #28a745',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <style>
          {`@keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`}
        </style>
        <p style={{ color: '#666', margin: 0 }}>
          {allowedRole === 'admin' ? 'Checking admin access...' : 'Checking access...'}
        </p>
      </div>
    );
  }

  if (!state.ok) {
    console.log("🔒 Access denied. Redirecting...");
    
    // Show detailed redirect reason
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    console.log("Redirect details:", {
      allowedRole,
      currentUserRole: user?.role,
      hasToken: !!localStorage.getItem('token'),
      path: window.location.pathname
    });
    
    // Redirect to appropriate login based on attempted access
    if (allowedRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  console.log("🎉 ProtectedRoute - Rendering children for:", 
    state.isAdmin ? 'admin' : (state.user?.role || 'guest'),
    "on route:", window.location.pathname
  );
  return children;
}