import { Link } from "react-router";
import { useSelector } from "react-redux";
import MovieCard from "../home/movieCard/MovieCard";
import "./FavoriteComponent.scss";

const FavoriteComponent = () => {
  const syncedFavorites = useSelector((state) => state.favorites.syncedItems);

  console.log("Synced Favorites:", syncedFavorites);

  return (
    <div className="favorite-component">
      {!syncedFavorites || syncedFavorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-animation">
            <div className="heart-container">
              <div className="heart-icon">💔</div>
              <div className="floating-hearts">
                <span className="floating-heart">💙</span>
                <span className="floating-heart">💚</span>
                <span className="floating-heart">💜</span>
                <span className="floating-heart">🧡</span>
              </div>
            </div>
          </div>
          <div className="empty-content">
            <h3>No favorite movies yet</h3>
            <p>
              Start building your personal movie collection by adding movies to
              your favorites!
            </p>
            <Link to="/" className="browse-button">
              <span className="button-icon">🎬</span>
              <span className="button-text">Browse Movies</span>
              <div className="button-shine"></div>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="favorites-stats">
            <div className="stats-card">
              <div className="stats-icon">❤️</div>
              <div className="stats-content">
                <div className="stats-number">{syncedFavorites.length}</div>
                <div className="stats-label">
                  {syncedFavorites.length === 1
                    ? "Favorite Movie"
                    : "Favorite Movies"}
                </div>
              </div>
            </div>
          </div>

          <div className="favorites-grid">
            {syncedFavorites.map((movie, index) => (
              <div
                key={movie.id}
                className="favorite-item"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  "--animation-order": index,
                }}
              >
                <MovieCard movie={movie} viewMode="grid" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FavoriteComponent;
