import { useContext } from "react";
import { Link } from "react-router";
import { useFavorites } from "../../../../hooks/useFavorites";
import { MovieContext } from "../../../../context/MovieContext";
import "./MovieCard.scss";

const MovieCard = ({ movie }) => {
  const { toggleFavorite, isFavorite, isAdmin } = useFavorites();
  const { currentUser } = useContext(MovieContext);
  const favorite = currentUser ? isFavorite(movie.id) : false;

  const formattedRuntime = () => {
    if (!movie.runtime) return "";

    if (
      typeof movie.runtime === "string" &&
      (movie.runtime.includes("min") || movie.runtime.includes("episodes"))
    ) {
      return movie.runtime;
    }

    return movie.type === "Movie"
      ? `${movie.runtime} mins`
      : `${movie.runtime} episodes`;
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      return;
    }

    try {
      await toggleFavorite(movie.id);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <div className="movie-poster">
          <img src={movie.poster_url} alt={movie.title} />
          <div className="movie-type">{movie.type}</div>
        </div>
        <div className="movie-content">
          <h3 className="movie-title">{movie.title}</h3>
          <div className="movie-meta">
            <span className="movie-rating">⭐ {movie.imdb_rating}/10</span>
            <span className="movie-year">{movie.year}</span>
          </div>
          <div className="movie-genres">
            {movie.MovieGenres?.filter(
              (genre) => isAdmin || !genre.Genres?.isDisabled
            ).map((genre) => (
              <span
                key={genre.genre_id}
                className={`genre-badge ${isAdmin && genre.Genres?.isDisabled ? "disabled-genre" : ""}`}
              >
                {genre.Genres?.name}
                {isAdmin && genre.Genres?.isDisabled && (
                  <span
                    key={`disabled-${genre.genre_id}`}
                    className="disabled-indicator"
                  >
                    (disabled)
                  </span>
                )}
              </span>
            ))}
          </div>
          <p className="movie-runtime">{formattedRuntime()}</p>
        </div>
      </Link>
      <div className="movie-actions">
        <Link to={`/movie/${movie.id}`} className="view-button">
          View Details
        </Link>
        {currentUser && currentUser.role !== "admin" && (
          <button
            className={`favorite-button ${favorite ? "is-favorite" : ""}`}
            onClick={handleFavorite}
          >
            {favorite ? "❤️ Favorited" : "🤍 Favorite"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
