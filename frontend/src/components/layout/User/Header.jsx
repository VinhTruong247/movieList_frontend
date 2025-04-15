import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../../../utils/UserListAPI';
import './styles/Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="container">
        <nav className="nav-wrapper">
          <Link to="/" className="logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">Movie Collection</span>
          </Link>

          <div className="nav-links">
            {currentUser && (
              <Link to="/favorites" className="nav-link">
                <span className="icon">❤️</span>
                <span className="text">Favorites</span>
              </Link>
            )}

            {currentUser ? (
              <div className="user-menu">
                <span className="username">
                  Welcome, {currentUser.username}
                </span>
                {currentUser.role === 'admin' ? (
                  <Link to="/admin" className="nav-link admin-link">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/profile" className="nav-link profile-link">
                    My Profile
                  </Link>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-link login-link">
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;