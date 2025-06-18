import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import "./NoMovie.scss";

const NoMovie = ({
  message = "This movie is currently unavailable.",
  autoRedirect = true,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [navigate, autoRedirect]);

  return (
    <div className="no-movie-container">
      <div className="no-movie-content">
        <div className="icon">🎬</div>
        <h2>Movie Unavailable</h2>
        <p>{message}</p>
        <div className="info-text">
          {autoRedirect
            ? "You will be redirected to the homepage in a few seconds..."
            : "Please check the movie ID or try again later."}
        </div>
        <Link to="/" className="home-button">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NoMovie;
