// src/components/DashboardRedirect.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log("🔄 DashboardRedirect: Checking user role:", user.role);
    
    if (user.role === 'farmer') {
      console.log("🚜 Redirecting to farmer dashboard");
      navigate('/dashboard/farmer', { replace: true });
    } else {
      console.log("👤 Redirecting to user dashboard");
      navigate('/dashboard/user', { replace: true });
    }
  }, [navigate]);
  
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
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <p style={{ color: '#666', margin: 0 }}>Redirecting to your dashboard...</p>
    </div>
  );
};

// Make sure this line exists for default export
export default DashboardRedirect;