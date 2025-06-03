import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { getCurrentUser } from '../services/UserListAPI';

const ProtectedRoute = ({ children, requireAdmin = false, allowGuest = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        
        if (userData && userData.userData) {
          if (userData.userData.isDisabled) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setLoading(false);
            return;
          }

          setUser(userData.userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-box checking-session">
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }
  if (allowGuest) {
    return children;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  if (!requireAdmin && user.role === 'admin' && window.location.pathname === '/favorites') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;