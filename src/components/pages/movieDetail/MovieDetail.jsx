import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { getMovieById } from "../../../services/MovieListAPI";
import Loader from "../../common/Loader";
import { useFavorites } from "../../../hooks/useFavorites";
import TrailerPopup from "./Trailer/TrailerPopup";
import SimilarMovie from "./SimilarMovie/SimilarMovie";
import NoMovie from "./NoMovie/NoMovie";
import "./MovieDetail.scss";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites();

  const formattedRuntime = (movie) => {
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

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const data = await getMovieById(id);
        if (!data || data.isDisabled) {
          setMovie(null);
          return;
        }

        const formattedMovie = {
          ...data,
          genre: data.MovieGenres?.map((g) => g.Genres.name) || [],
          director:
            data.MovieDirectors?.map((d) => d.Directors.name).join(", ") || "",
        };

        setMovie(formattedMovie);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Error loading movie");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleFavoriteToggle = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      await toggleFavorite(movie.id);
    } catch (error) {
      setError("Failed to update favorites");
    }
  }, [isLoggedIn, movie, toggleFavorite]);

  if (loading) return <Loader />;

  if (!movie) return <NoMovie message="This movie is currently unavailable." />;

  if (error)
    return <div className="error-message">Error loading movie: {error}</div>;

  const favorite = isFavorite(movie.id);

  return (
    <div className="movie-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="detail-content">
        <div className="poster-section">
          <div className="movie-poster">
            <img src={movie.poster_url} alt={movie.title} />
            <div className="movie-type">{movie.type}</div>
          </div>
          <button
            className="trailer-button"
            onClick={() => setShowTrailer(true)}
          >
            Watch Trailer
          </button>
        </div>

        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1>

          <div className="movie-meta">
            <span className="year">📅 {movie.year}</span>
            <span className="rating">⭐ {movie.imdb_rating}/10</span>
            <span className="runtime">⏱️ {formattedRuntime(movie)}</span>
          </div>

          <div className="genre-list">
            {movie.genre.map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre}
              </span>
            ))}
          </div>

          <div className="movie-details">
            <p className="description">{movie.description}</p>

            <div className="additional-info">
              <div className="info-item">
                <span className="label">Director:</span>
                <span className="value">{movie.director}</span>
              </div>
              <div className="info-item">
                <span className="label">Language:</span>
                <span className="value">{movie.language}</span>
              </div>
              <div className="info-item">
                <span className="label">Country:</span>
                <span className="value">{movie.country}</span>
              </div>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              className={`favorite-button ${favorite ? "is-favorite" : ""}`}
              onClick={handleFavoriteToggle}
            >
              {favorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
            </button>
          ) : (
            <div className="favorite-login-message">
              <Link to="/login" className="login-link">
                Login to add to your favorite list
              </Link>
            </div>
          )}
        </div>
      </div>

      <SimilarMovie currentMovie={movie} />

      {showTrailer && (
        <TrailerPopup
          trailerUrl={movie.trailer_url}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};

export default MovieDetail;
