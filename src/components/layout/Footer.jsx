import React from 'react';
import './styles/Footer.scss';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <p className="copyright">
          © {new Date().getFullYear()} Movie Collection. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;