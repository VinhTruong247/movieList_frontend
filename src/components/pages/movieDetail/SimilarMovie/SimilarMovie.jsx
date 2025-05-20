import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMovies } from "../../../../utils/MovieListAPI";
import Loader from "../../../common/Loader";
import "./SimilarMovie.scss";

const SimilarMovie = ({ currentMovie }) => {
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSimilarMovies = async () => {
      try {
        if (
          !currentMovie ||
          !currentMovie.genre ||
          currentMovie.genre.length === 0
        ) {
          setSimilarMovies([]);
          return;
        }

        const allMovies = await getMovies();
        const filtered = allMovies.filter(
          (movie) =>
            movie.id !== currentMovie.id &&
            movie.genre.some((genre) => currentMovie.genre.includes(genre))
        );

        const sorted = filtered.sort((a, b) => {
          const aMatches = a.genre.filter((genre) =>
            currentMovie.genre.includes(genre)
          ).length;
          const bMatches = b.genre.filter((genre) =>
            currentMovie.genre.includes(genre)
          ).length;
          if (bMatches !== aMatches) {
            return bMatches - aMatches;
          }
          return b.imdb_rating - a.imdb_rating;
        });
        setSimilarMovies(sorted.slice(0, 4));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSimilarMovies();
  }, [currentMovie]);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (similarMovies.length === 0) return null;

  return (
    <div className="similar-movies-section">
      <h2>Similar Movies</h2>
      <div className="similar-movies-grid">
        {similarMovies.map((movie) => (
          <Link
            to={`/movie/${movie.id}`}
            key={movie.id}
            className="similar-movie-card"
          >
            <div className="similar-movie-poster">
              <img src={movie.poster} alt={movie.title} />
              <div className="movie-type">{movie.type}</div>
            </div>
            <div className="similar-movie-info">
              <h3 className="similar-movie-title">{movie.title}</h3>
              <div className="similar-movie-genre">
                {movie.genre.slice(0, 2).map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre}
                  </span>
                ))}
                {movie.genre.length > 2 && (
                  <span className="more-genres">+{movie.genre.length - 2}</span>
                )}
              </div>
              <div className="similar-movie-meta">
                <span className="year">{movie.year}</span>
                <span className="rating">⭐ {movie.imdb_rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarMovie;
