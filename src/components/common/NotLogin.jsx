import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import "./NotLogin.scss";

const NotLogin = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/login");
    }, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="not-login-container">
      <div className="not-login-content">
        <h1>🔒 Login Required</h1>
        <p className="error-message">
          You need to be logged in to access this feature
        </p>
        <p className="helper-text">
          Please sign in to your account to continue
        </p>
        <p className="countdown">
          Redirecting to login page in {countdown} seconds...
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

export default NotLogin;
