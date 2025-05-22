import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import "./NotFound.scss";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/");
    }, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <p className="error-message">Page Not Found</p>
        <p className="countdown">
          Redirecting to homepage in {countdown} seconds...
        </p>
        <p className="helper-text">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="action-buttons">
          <Link to="/" className="home-button">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
