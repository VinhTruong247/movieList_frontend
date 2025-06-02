import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { getMovieById } from "../../../services/MovieListAPI";
import { MovieContext } from "../../../context/MovieContext";
import { useFavorites } from "../../../hooks/useFavorites";
import SimilarMovie from "./SimilarMovie/SimilarMovie";
import Loader from "../../common/Loader";
import NoMovie from "./NoMovie/NoMovie";
import TrailerPopup from "./Trailer/TrailerPopup";
import "./MovieDetail.scss";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(MovieContext);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState("overview");
  const [showTrailer, setShowTrailer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const movieData = await getMovieById(id);
        setMovie(movieData);
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  const formatRuntime = () => {
    if (!movie.runtime) return "Not specified";

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

  const handleFavorite = async () => {
    if (!currentUser) return;
    try {
      await toggleFavorite(movie.id);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const renderCast = () => {
    if (!movie.MovieActors || movie.MovieActors.length === 0) {
      return <div className="no-data">No cast information available</div>;
    }

    return (
      <div className="cast-grid">
        {movie.MovieActors.map((actorRole, index) => (
          <div key={index} className="cast-card">
            <div className="actor-name">{actorRole.Actors?.name}</div>
            {actorRole.character_name && (
              <div className="character-name">
                as {actorRole.character_name}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderReviews = () => {
    if (!movie.Reviews || movie.Reviews.length === 0) {
      return <div className="no-data">No reviews yet</div>;
    }

    return (
      <div className="reviews-list">
        {movie.Reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-name">{review.Users?.username}</div>
                <div className="review-rating">⭐ {review.rating}/10</div>
              </div>
              <div className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
            {review.comment && (
              <div className="review-comment">{review.comment}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <Loader />;

  if (!movie) return <NoMovie message="This movie is currently unavailable." />;

  if (error)
    return <div className="error-message">Error loading movie: {error}</div>;

  const favorite = currentUser ? isFavorite(movie.id) : false;

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="movie-detail-page">
      <div className="movie-hero">
        {movie.banner_url && (
          <div className="hero-background">
            <img src={movie.banner_url} alt={`${movie.title} banner`} />
            <div className="hero-overlay"></div>
          </div>
        )}

        <div className="hero-content">
          <div className="movie-poster">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={`${movie.title} poster`} />
            ) : (
              <div className="no-poster">No Image Available</div>
            )}
          </div>

          <div className="movie-main-info">
            <h1 className="movie-title">
              {movie.title} <span className="year">({movie.year})</span>
            </h1>

            <div className="movie-meta">
              <div className="meta-item">
                <span className="meta-label">Type:</span>
                <span className="meta-value">{movie.type || "Movie"}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Runtime:</span>
                <span className="meta-value">{formatRuntime()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Rating:</span>
                <span className="meta-value rating">
                  ⭐{" "}
                  {movie.imdb_rating ? `${movie.imdb_rating}/10` : "Not rated"}
                </span>
              </div>
            </div>

            <div className="movie-genres">
              {movie.MovieGenres && movie.MovieGenres.length > 0 ? (
                movie.MovieGenres.map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre.Genres?.name}
                  </span>
                ))
              ) : (
                <span className="no-genres">No genres specified</span>
              )}
            </div>

            <div className="movie-actions">
              {movie.trailer_url && (
                <button
                  className="trailer-btn"
                  onClick={() => setShowTrailer(true)}
                >
                  Watch Trailer
                </button>
              )}

              {!currentUser && (
                <button
                  className="favorite-login-message"
                  onClick={handleLoginClick}
                >
                  🤍 Login to add to your favorite list
                </button>
              )}

              {currentUser && currentUser.role !== "admin" && (
                <button
                  className={`favorite-btn ${favorite ? "is-favorite" : ""}`}
                  onClick={handleFavorite}
                >
                  {favorite
                    ? "❤️ Remove from Favorites"
                    : "🤍 Add to Favorites"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="movie-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "cast" ? "active" : ""}`}
          onClick={() => setActiveTab("cast")}
        >
          Cast & Crew
        </button>
        <button
          className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews ({movie.Reviews?.length || 0})
        </button>
      </div>

      <div className="movie-detail-content">
        {activeTab === "overview" && (
          <div className="tab-content overview-tab">
            <div className="content-layout">
              <div className="main-content">
                {movie.description && (
                  <div className="info-section">
                    <h3 className="section-title">Description</h3>
                    <div className="movie-description">{movie.description}</div>
                  </div>
                )}

                <div className="info-section">
                  <h3 className="section-title">Movie Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Release Year</span>
                      <span className="detail-value">
                        {movie.year || "Unknown"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Language</span>
                      <span className="detail-value">
                        {movie.language || "Not specified"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Country</span>
                      <span className="detail-value">
                        {movie.country || "Not specified"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type</span>
                      <span className="detail-value">
                        {movie.type || "Movie"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sidebar-content">
                <SimilarMovie currentMovie={movie} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "cast" && (
          <div className="tab-content cast-tab">
            <div className="content-layout">
              <div className="main-content">
                {movie.MovieDirectors && movie.MovieDirectors.length > 0 && (
                  <div className="info-section">
                    <h3 className="section-title">Directors</h3>
                    <div className="directors-list">
                      {movie.MovieDirectors.map((director, index) => (
                        <span key={index} className="director-tag">
                          {director.Directors?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="info-section">
                  <h3 className="section-title">Cast</h3>
                  {renderCast()}
                </div>
              </div>

              <div className="sidebar-content">
                <SimilarMovie currentMovie={movie} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="tab-content reviews-tab">
            <div className="info-section">
              <h3 className="section-title">User Reviews</h3>

              {!currentUser && (
                <div className="login-prompt">
                  <p>Please log in to write a review for this movie</p>
                  <button className="login-btn" onClick={handleLoginClick}>
                    Login to Review
                  </button>
                </div>
              )}

              {currentUser && currentUser.role !== "admin" && (
                <div className="review-form-section">
                  <button className="write-review-btn">Write a Review</button>
                </div>
              )}

              {renderReviews()}
            </div>
          </div>
        )}

        {showTrailer && (
          <TrailerPopup
            trailerUrl={movie.trailer_url}
            onClose={() => setShowTrailer(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
