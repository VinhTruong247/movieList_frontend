import "./styles/Footer.scss";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-logo">🎬 Movie Collection</div>
        <p className="copyright">
          © {new Date().getFullYear()} Movie Collection. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="/about" className="footer-link">
            About
          </a>
          <a href="/contact" className="footer-link">
            Contact
          </a>
          <a href="/privacy" className="footer-link">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
