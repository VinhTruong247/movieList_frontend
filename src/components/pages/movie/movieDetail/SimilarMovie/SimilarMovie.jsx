import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { getMovies } from "../../../../../services/MovieListAPI";
import Loader from "../../../../common/Loader";
import "./SimilarMovie.scss";

const SimilarMovie = ({ currentMovie }) => {
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAdmin = currentUser?.role === "admin";

  const getGenreNames = (movie) => {
    if (!movie.MovieGenres || !Array.isArray(movie.MovieGenres)) {
      return [];
    }
    return movie.MovieGenres.filter(
      (mg) => mg.Genres && (isAdmin || !mg.Genres.isDisabled)
    ).map((mg) => mg.Genres.name);
  };

  const getGenreNamesWithDisabled = (movie) => {
    if (!movie.MovieGenres || !Array.isArray(movie.MovieGenres)) {
      return [];
    }
    return movie.MovieGenres.filter((mg) => mg.Genres).map((mg) => ({
      name: mg.Genres.name,
      isDisabled: mg.Genres.isDisabled || false,
    }));
  };

  useEffect(() => {
    const getSimilarMovies = async () => {
      try {
        if (!currentMovie) {
          setSimilarMovies([]);
          setLoading(false);
          return;
        }

        const currentMovieGenres = getGenreNames(currentMovie);

        if (currentMovieGenres.length === 0) {
          setSimilarMovies([]);
          setLoading(false);
          return;
        }

        const allMovies = await getMovies();

        const filtered = allMovies.filter((movie) => {
          if (movie.id === currentMovie.id) return false;

          const movieGenres = getGenreNames(movie);
          return movieGenres.some((genre) =>
            currentMovieGenres.includes(genre)
          );
        });

        const sorted = filtered.sort((a, b) => {
          const aGenres = getGenreNames(a);
          const bGenres = getGenreNames(b);

          const aMatches = aGenres.filter((genre) =>
            currentMovieGenres.includes(genre)
          ).length;

          const bMatches = bGenres.filter((genre) =>
            currentMovieGenres.includes(genre)
          ).length;

          if (bMatches !== aMatches) {
            return bMatches - aMatches;
          }
          return b.imdb_rating - a.imdb_rating;
        });

        setSimilarMovies(sorted.slice(0, 4));
      } catch (err) {
        console.error("Error fetching similar movies:", err);
        setError(err.message || "Failed to load similar movies");
      } finally {
        setLoading(false);
      }
    };

    getSimilarMovies();
  }, [currentMovie, isAdmin]);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (similarMovies.length === 0) return null;

  return (
    <div className="similar-movies-section">
      <h2>Similar Movies</h2>
      <div className="similar-movies-grid">
        {similarMovies.map((movie) => {
          const genresWithStatus = getGenreNamesWithDisabled(movie);
          const visibleGenres = isAdmin
            ? genresWithStatus
            : genresWithStatus.filter((genre) => !genre.isDisabled);

          const remainingGenres = visibleGenres.slice(2);

          return (
            <Link
              to={`/movies/${movie.id}`}
              key={movie.id}
              className="similar-movie-card"
            >
              <div className="similar-movie-poster">
                <img
                  src={
                    movie.poster_url ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019"
                  }
                  alt={movie.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019";
                  }}
                />
                <div className="movie-type">{movie.type}</div>
              </div>
              <div className="similar-movie-info">
                <h3 className="similar-movie-title">{movie.title}</h3>
                <div className="similar-movie-genre">
                  {visibleGenres.slice(0, 2).map((genre, index) => (
                    <span
                      key={`${movie.id}-genre-${genre.name}-${index}`}
                      className={`genre-tag ${
                        isAdmin && genre.isDisabled ? "disabled-genre" : ""
                      }`}
                    >
                      {genre.name}
                      {isAdmin && genre.isDisabled && (
                        <span className="disabled-indicator"> (disabled)</span>
                      )}
                    </span>
                  ))}
                  {visibleGenres.length > 2 && (
                    <span className="more-genres-wrapper">
                      <span className="more-genres">
                        +{visibleGenres.length - 2}
                      </span>
                      <div className="genre-tooltip">
                        <div className="tooltip-content">
                          <div className="tooltip-genres">
                            {remainingGenres.map((genre, index) => (
                              <span
                                key={`tooltip-${movie.id}-${genre.name}-${index}`}
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
                <div className="similar-movie-meta">
                  <span className="year">{movie.year}</span>
                  <span className="rating">⭐ {movie.imdb_rating}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarMovie;
