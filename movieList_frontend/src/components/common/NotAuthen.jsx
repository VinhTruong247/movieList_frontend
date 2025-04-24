import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import './NotAuthen.scss';

const NotAuthen = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate('/');
    }, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="not-authen-container">
      <div className="not-authen-content">
        <h1>🚫 Access Denied</h1>
        <p className="error-message">
          You are not authorized to access this page.
        </p>
        <p className="helper-text">
          Please check your permissions or contact the administrator.
        </p>
        <p className="countdown">
          Redirecting to homepage in {countdown} seconds...
        </p>
        <div className="action-buttons">
          <Link to="/" className="home-button">
            Return to Home
          </Link>
          <Link to="/login" className="login-button">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotAuthen;
