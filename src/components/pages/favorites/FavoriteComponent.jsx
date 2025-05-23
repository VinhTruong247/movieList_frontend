import { Link } from "react-router";
import MovieCard from "../home/movieCard/MovieCard";

const FavoriteComponent = ({ syncedFavorites = [] }) => {
  return (
    <>
      {!syncedFavorites || syncedFavorites.length === 0 ? (
        <div className="empty-state">
          <h3>No favorite movies yet</h3>
          <p>Start adding movies to your favorites to see them here!</p>
          <Link to="/" className="browse-button">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {syncedFavorites.map((movie) => (
            <div key={movie.id} className="favorite-item">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoriteComponent;
