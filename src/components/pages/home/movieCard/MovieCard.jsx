import { useContext } from "react";
import { Link } from "react-router";
import { useFavorites } from "../../../../hooks/useFavorites";
import { MovieContext } from "../../../../context/MovieContext";
import "./MovieCard.scss";

const MovieCard = ({ movie, viewMode = "grid" }) => {
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

  if (viewMode === "list") {
    return (
      <div className="movie-card list-view">
        <Link to={`/movie/${movie.id}`} className="movie-link">
          <div className="movie-poster-list">
            <img src={movie.poster_url} alt={movie.title} />
            <div className="movie-type">{movie.type}</div>
          </div>
          <div className="movie-content-list">
            <div className="movie-main-info">
              <h3 className="movie-title">{movie.title}</h3>
              <div className="movie-meta">
                <span className="movie-rating">⭐ {movie.imdb_rating}/10</span>
                <span className="movie-year">{movie.year}</span>
                <span className="movie-runtime">{formattedRuntime()}</span>
              </div>
              <div className="movie-genres">
                {movie.MovieGenres?.filter(
                  (genre) => isAdmin || !genre.Genres?.isDisabled
                ).slice(0, 3).map((genre) => (
                  <span
                    key={genre.genre_id}
                    className={`genre-badge ${isAdmin && genre.Genres?.isDisabled ? "disabled-genre" : ""}`}
                  >
                    {genre.Genres?.name}
                  </span>
                ))}
                {movie.MovieGenres?.length > 3 && (
                  <span className="genre-badge more">
                    +{movie.MovieGenres.length - 3} more
                  </span>
                )}
              </div>
            </div>
            <div className="movie-actions-list">
              <button className="quick-view-btn">Quick View</button>
              {currentUser && currentUser.role !== "admin" && (
                <button
                  className={`favorite-button-list ${favorite ? "is-favorite" : ""}`}
                  onClick={handleFavorite}
                >
                  {favorite ? "❤️" : "🤍"}
                </button>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="movie-card grid-view">
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <div className="movie-poster">
          <img src={movie.poster_url} alt={movie.title} />
          <div className="movie-type">{movie.type}</div>
          <div className="movie-overlay">
            <div className="overlay-content">
              <span className="play-icon">▶</span>
              <span className="overlay-text">View Details</span>
            </div>
          </div>
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
            ).slice(0, 2).map((genre) => (
              <span
                key={genre.genre_id}
                className={`genre-badge ${isAdmin && genre.Genres?.isDisabled ? "disabled-genre" : ""}`}
              >
                {genre.Genres?.name}
              </span>
            ))}
          </div>
          <p className="movie-runtime">{formattedRuntime()}</p>
        </div>
      </Link>
      <div className="movie-actions">
        <Link to={`/movie/${movie.id}`} className="view-button">
          Watch Now
        </Link>
        {currentUser && currentUser.role !== "admin" && (
          <button
            className={`favorite-button ${favorite ? "is-favorite" : ""}`}
            onClick={handleFavorite}
          >
            {favorite ? "❤️" : "🤍"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
