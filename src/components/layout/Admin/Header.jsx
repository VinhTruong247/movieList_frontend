import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { logoutUser, getCurrentUser } from '../../../utils/UserListAPI';
import './styles/Header.scss';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setUserData(user?.userData);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="admin-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/admin" className="admin-logo">
            🎬 Admin Dashboard
          </Link>
        </div>

        <nav className="admin-nav">
          <Link to="/" className="nav-link">
            View Site
          </Link>
          <div className="admin-user">
            <span className="username">Admin: {userData?.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
