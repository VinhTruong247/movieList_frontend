import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router";
import { getMovieById, movieCache } from "../../../services/MovieListAPI";
import {
  addReview,
  updateReview,
  deleteReview,
} from "../../../services/ReviewsAPI";
import { useFavorites } from "../../../hooks/useFavorites";
import { useToast } from "../../../hooks/useToast";
import SimilarMovie from "./SimilarMovie/SimilarMovie";
import Loader from "../../common/Loader";
import NoMovie from "./NoMovie/NoMovie";
import TrailerPopup from "./Trailer/TrailerPopup";
import ReviewForm from "./ReviewForm/ReviewForm";
import "./MovieDetail.scss";

const MovieDetail = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const { toggleFavorite, isFavorite } = useFavorites();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [showTrailer, setShowTrailer] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const movieData = await getMovieById(movieId);
        setMovie(movieData);
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

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

  const refreshMovieData = async () => {
    movieCache.delete(movieId);
    const updatedMovieData = await getMovieById(movieId);
    setMovie(updatedMovieData);
  };

  const renderCast = () => {
    if (!movie.MovieActors || movie.MovieActors.length === 0) {
      return <div className="no-data">No cast information available</div>;
    }

    const visibleActors = movie.MovieActors.filter(
      (actorRole) => isAdmin || !actorRole.Actors?.isDisabled
    );

    if (visibleActors.length === 0) {
      return <div className="no-data">No cast information available</div>;
    }

    return (
      <div className="cast-grid">
        {visibleActors.map((actorRole, index) => (
          <Link
            to={`/actors/${actorRole.Actors?.id}`}
            key={actorRole.Actors?.id || index}
          >
            <div className="cast-card">
              <div
                className={`actor-name ${isAdmin && actorRole.Actors?.isDisabled ? "disabled-actor" : ""}`}
              >
                {actorRole.Actors?.name}
                {isAdmin && actorRole.Actors?.isDisabled && (
                  <span className="disabled-indicator"> (disabled)</span>
                )}
              </div>
              {actorRole.character_name && (
                <div className="character-name">
                  as {actorRole.character_name}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderDirectors = () => {
    if (!movie.MovieDirectors || movie.MovieDirectors.length === 0) {
      return <span className="no-directors">No directors specified</span>;
    }

    const visibleDirectors = movie.MovieDirectors.filter(
      (director) => isAdmin || !director.Directors?.isDisabled
    );

    if (visibleDirectors.length === 0) {
      return <span className="no-directors">No directors specified</span>;
    }

    return visibleDirectors.map((director, index) => (
      <Link
        to={`/directors/${director.Directors?.id}`}
        key={director.Directors?.id || index}
      >
        <span
          className={`director-tag ${isAdmin && director.Directors?.isDisabled ? "disabled-director" : ""}`}
        >
          {director.Directors?.name}
          {isAdmin && director.Directors?.isDisabled && (
            <span className="disabled-indicator"> (disabled)</span>
          )}
        </span>
      </Link>
    ));
  };

  const renderGenres = () => {
    if (!movie.MovieGenres || movie.MovieGenres.length === 0) {
      return <span className="no-genres">No genres specified</span>;
    }

    const visibleGenres = movie.MovieGenres.filter(
      (genre) => isAdmin || !genre.Genres?.isDisabled
    );

    if (visibleGenres.length === 0) {
      return <span className="no-genres">No genres specified</span>;
    }

    return visibleGenres.map((genre, index) => (
      <span
        key={index}
        className={`genre-tag ${isAdmin && genre.Genres?.isDisabled ? "disabled-genre" : ""}`}
      >
        {genre.Genres?.name}
        {isAdmin && genre.Genres?.isDisabled && (
          <span className="disabled-indicator"> (disabled)</span>
        )}
      </span>
    ));
  };

  const formatReviewTime = (createdAt) => {
    const reviewDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now - reviewDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    } else {
      return reviewDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const renderReviews = () => {
    if (!movie.Reviews || movie.Reviews.length === 0) {
      return (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this movie!</p>
        </div>
      );
    }

    return (
      <div className="reviews-list">
        {movie.Reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.user_public_profiles?.avatar_url ? (
                    <img
                      src={review.user_public_profiles.avatar_url}
                      alt={`${review.user_public_profiles?.name || "User"}'s avatar`}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-initial">
                      {(review.user_public_profiles?.name ||
                        "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="reviewer-details">
                  <Link
                    to={`/profile/${review.user_id}`}
                    className="reviewer-name-link"
                  >
                    <span className="reviewer-name">
                      {review.user_public_profiles?.name || "User"}
                    </span>
                  </Link>
                  <div className="review-rating">
                    <span className="stars">
                      {[...Array(10)].map((_, index) => (
                        <span
                          key={index}
                          className={`star ${index < review.rating ? "filled" : ""}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </span>
                    <span className="rating-value">{review.rating}/10</span>
                  </div>
                </div>
              </div>
              <div className="review-actions">
                <div className="review-time">
                  <span className="time-ago">
                    {formatReviewTime(review.created_at)}
                    {review.updated_at &&
                      review.updated_at !== review.created_at && (
                        <span className="edited-indicator"> (edited)</span>
                      )}
                  </span>
                </div>
                <div className="action-buttons">
                  {currentUser && currentUser.id === review.user_id && (
                    <>
                      <button
                        className="edit-review-btn"
                        onClick={() => handleEditReview(review)}
                        title="Edit your review"
                      >
                        Edit
                      </button>
                      <button
                        className="delete-review-btn"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                        title="Delete your review"
                      >
                        {deletingReviewId === review.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </>
                  )}
                  {currentUser &&
                    currentUser.role === "admin" &&
                    currentUser.id !== review.user_id && (
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                        title="Admin: Delete this review"
                      >
                        {deletingReviewId === review.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
                </div>
              </div>
            </div>
            <div className="review-content">
              <p>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleReviewSubmit = async (values, { resetForm }) => {
    if (!currentUser) return;

    setIsSubmittingReview(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, values.rating, values.comment);
        toast.success("Your review has been updated!");
      } else {
        await addReview(
          movie.id,
          currentUser.id,
          values.rating,
          values.comment
        );
        toast.success("Your review has been submitted!");
      }

      await refreshMovieData();
      resetForm();
      setShowReviewForm(false);
      setEditingReview(null);
    } catch (error) {
      toast.error("Error saving review. Please try again.");
      console.error("Error saving review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!currentUser) return;

    const confirmMessage =
      currentUser.role === "admin"
        ? "Are you sure you want to delete this review as an admin?"
        : "Are you sure you want to delete your review?";

    if (window.confirm(confirmMessage)) {
      setDeletingReviewId(reviewId);
      try {
        await deleteReview(reviewId);
        await refreshMovieData();
        toast.info("Review has been deleted");
      } catch (error) {
        toast.error("Error deleting review. Please try again.");
        console.error("Error deleting review:", error);
      } finally {
        setDeletingReviewId(null);
      }
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const hasUserReviewed = () => {
    if (!currentUser || !movie.Reviews) return false;
    return movie.Reviews.some((review) => review.user_id === currentUser.id);
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

            <div className="movie-genres">{renderGenres()}</div>

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
        )}

        {activeTab === "cast" && (
          <div className="tab-content cast-tab">
            <div className="main-content">
              <div className="info-section">
                <h3 className="section-title">Directors</h3>
                <div className="directors-list">{renderDirectors()}</div>
              </div>
              <div className="info-section">
                <h3 className="section-title">Cast</h3>
                {renderCast()}
              </div>
            </div>

            <div className="sidebar-content">
              <SimilarMovie currentMovie={movie} />
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

              {currentUser &&
                currentUser.role !== "admin" &&
                !hasUserReviewed() && (
                  <div className="review-form-section">
                    {!showReviewForm ? (
                      <button
                        className="write-review-btn"
                        onClick={() => setShowReviewForm(true)}
                      >
                        Write a Review
                      </button>
                    ) : (
                      <ReviewForm
                        onSubmit={handleReviewSubmit}
                        onCancel={handleCancelReview}
                        isSubmitting={isSubmittingReview}
                        editingReview={editingReview}
                      />
                    )}
                  </div>
                )}

              {currentUser &&
                currentUser.role !== "admin" &&
                hasUserReviewed() &&
                !showReviewForm && (
                  <div className="already-reviewed">
                    <p>✅ You have already reviewed this movie</p>
                  </div>
                )}

              {showReviewForm && editingReview && (
                <div className="review-form-section">
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    onCancel={handleCancelReview}
                    isSubmitting={isSubmittingReview}
                    editingReview={editingReview}
                  />
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
