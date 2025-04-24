import React from 'react';
import { Link, useNavigate } from 'react-router';
import { logoutUser, getCurrentUser } from '../../../utils/UserListAPI';
import './styles/Header.scss';

const AdminHeader = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
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
            <span className="username">Admin: {currentUser?.username}</span>
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
