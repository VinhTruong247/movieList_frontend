import { useNavigate } from "react-router";
import { useContext } from "react";
import { useFavorites } from "../../../hooks/useFavorites";
import { MovieContext } from "../../../context/MovieContext";
import FavoriteComponent from "./FavoriteComponent";
import NotFound from "../../common/NotFound";
import NotLogin from "../../common/NotLogin";
import "./Favorites.scss";

const Favorites = () => {
  const { syncedFavorites, loadingFavorites } = useFavorites();
  const navigate = useNavigate();
  const { currentUser } = useContext(MovieContext);

  if (!currentUser) {
    return <NotLogin />;
  }

  if (currentUser?.role === "admin") {
    return <NotFound />;
  }

  if (loadingFavorites) {
    return (
      <div className="favorites-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <button
          className="back-button"
          onClick={() => navigate("/")}
          title="Back to Home"
        >
          <svg
            viewBox="0 0 24 24"
            className="home-icon"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>
        <div className="page-title-section">
          <h1 className="page-title">My Favorites</h1>
          <p className="page-subtitle">Your personal movie collection</p>
        </div>
      </div>

      <FavoriteComponent syncedFavorites={syncedFavorites} />
    </div>
  );
};

export default Favorites;
