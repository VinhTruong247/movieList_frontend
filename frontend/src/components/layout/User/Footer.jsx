import React from 'react';
import './styles/Footer.scss';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-logo">🎬 Movie Collection</div>
        <p className="copyright">
          © {new Date().getFullYear()} Movie Collection. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="/" className="footer-link">
            About
          </a>
          <a href="/" className="footer-link">
            Contact
          </a>
          <a href="/" className="footer-link">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
