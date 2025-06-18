import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useFavorites } from "../../../../hooks/useFavorites";
import "./MovieCard.scss";

const MovieCard = ({ movie, viewMode = "grid" }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { toggleFavorite, isFavorite, isAdmin } = useFavorites();
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

  const getGenresWithStatus = () => {
    if (!movie.MovieGenres || !Array.isArray(movie.MovieGenres)) {
      return [];
    }
    return movie.MovieGenres.map((mg) => ({
      id: mg.genre_id,
      name: mg.Genres?.name,
      isDisabled: mg.Genres?.isDisabled || false,
    })).filter((genre) => genre.name);
  };

  const getVisibleGenres = () => {
    const genresWithStatus = getGenresWithStatus();
    return isAdmin
      ? genresWithStatus
      : genresWithStatus.filter((genre) => !genre.isDisabled);
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
    const visibleGenres = getVisibleGenres();
    const displayedGenres = visibleGenres.slice(0, 3);
    const remainingGenres = visibleGenres.slice(3);

    return (
      <div className="movie-card list-view">
        <Link to={`/movies/${movie.id}`} className="movie-link">
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
                {displayedGenres.map((genre) => (
                  <span
                    key={genre.id}
                    className={`genre-badge ${isAdmin && genre.isDisabled ? "disabled-genre" : ""}`}
                  >
                    {genre.name}
                    {isAdmin && genre.isDisabled && (
                      <span className="disabled-indicator"> (disabled)</span>
                    )}
                  </span>
                ))}
                {remainingGenres.length > 0 && (
                  <span className="more-genres-wrapper">
                    <span className="genre-badge more">
                      +{remainingGenres.length} more
                    </span>
                    <div className="genre-tooltip">
                      <div className="tooltip-content">
                        <h4>Remaining Genres:</h4>
                        <div className="tooltip-genres">
                          {remainingGenres.map((genre) => (
                            <span
                              key={`tooltip-${genre.id}`}
                              className={`tooltip-genre-tag ${
                                isAdmin && genre.isDisabled
                                  ? "disabled-genre"
                                  : ""
                              }`}
                            >
                              {genre.name}
                              {isAdmin && genre.isDisabled && (
                                <span className="disabled-indicator">
                                  {" "}
                                  (disabled)
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
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

  const visibleGenres = getVisibleGenres();
  const displayedGenres = visibleGenres.slice(0, 2);
  const remainingGenres = visibleGenres.slice(2);

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
            {displayedGenres.map((genre) => (
              <span
                key={genre.id}
                className={`genre-badge ${isAdmin && genre.isDisabled ? "disabled-genre" : ""}`}
              >
                {genre.name}
                {isAdmin && genre.isDisabled && (
                  <span className="disabled-indicator"> (disabled)</span>
                )}
              </span>
            ))}
            {remainingGenres.length > 0 && (
              <span className="more-genres-wrapper">
                <span className="genre-badge more">
                  +{remainingGenres.length} more
                </span>
                <div className="genre-tooltip">
                  <div className="tooltip-content">
                    <h4>Remaining Genres:</h4>
                    <div className="tooltip-genres">
                      {remainingGenres.map((genre) => (
                        <span
                          key={`tooltip-${genre.id}`}
                          className={`tooltip-genre-tag ${
                            isAdmin && genre.isDisabled ? "disabled-genre" : ""
                          }`}
                        >
                          {genre.name}
                          {isAdmin && genre.isDisabled && (
                            <span className="disabled-indicator">
                              {" "}
                              (disabled)
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </span>
            )}
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
