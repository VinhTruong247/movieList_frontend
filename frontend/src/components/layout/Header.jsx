import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Header.scss';

const Header = () => {
  return (
    <header className="main-header">
      <div className="container">
        <nav className="nav-wrapper">
          <Link to="/" className="logo">
            🎬 Movie Collection
          </Link>

          <Link to="/favorites" className="favorites-link">
            ❤️ Favorites
          </Link>

          <Link to="/login" className="login-link">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;