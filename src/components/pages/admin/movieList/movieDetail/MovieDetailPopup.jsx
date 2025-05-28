import { useState } from "react";
import "./MovieDetailPopup.scss";

const MovieDetailPopup = ({ movie, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState("info");
  const formatRuntime = () => {
    if (!movie.runtime) return "Not specified";

    if (
      movie.type &&
      (movie.type.includes("TV") ||
        movie.type.includes("Series") ||
        movie.type.includes("series"))
    ) {
      return `${movie.runtime} episode(s)`;
    } else {
      return `${movie.runtime} minutes`;
    }
  };

  const renderActors = () => {
    if (!movie.MovieActors || movie.MovieActors.length === 0) {
      return <div className="no-data">No actors listed for this movie</div>;
    }

    return (
      <div className="actors-grid">
        {movie.MovieActors.map((actorRole, index) => (
          <div key={index} className="actor-card">
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

  return (
    <div className="movie-detail-overlay" onClick={onClose}>
      <div
        className="movie-detail-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="movie-detail-header">
          <h2>
            {movie.title} <span className="year">({movie.year})</span>
          </h2>
          <div className="movie-detail-actions">
            <button className="close-detail-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="movie-tabs">
          <button
            className={`tab-button ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Information
          </button>
          <button
            className={`tab-button ${activeTab === "cast" ? "active" : ""}`}
            onClick={() => setActiveTab("cast")}
          >
            Cast & Crew
          </button>
          <button
            className={`tab-button ${activeTab === "media" ? "active" : ""}`}
            onClick={() => setActiveTab("media")}
          >
            Media & Links
          </button>
        </div>

        <div className="movie-detail-content">
          {activeTab === "info" && (
            <>
              <div className="content-layout">
                <div className="movie-poster">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={`${movie.title} poster`} />
                  ) : (
                    <div className="no-poster-detail">No Image Available</div>
                  )}
                  <div className="movie-badges">
                    <div className="badge movie-type-badge">
                      {movie.type || "Movie"}
                    </div>
                    <div className="badge rating-badge">
                      ⭐ {movie.imdb_rating || "N/A"}
                    </div>
                    <div
                      className={`status-badge ${movie.isDisabled ? "disabled" : "active"}`}
                    >
                      {movie.isDisabled ? "DISABLED" : "ACTIVE"}
                    </div>
                  </div>
                </div>

                <div className="movie-info">
                  <div className="info-section">
                    <h3 className="section-title">Details</h3>

                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-label">Release Year</div>
                        <div className="info-value">
                          {movie.year || "Unknown"}
                        </div>
                      </div>

                      <div className="info-item">
                        <div className="info-label">Runtime</div>
                        <div className="info-value">{formatRuntime()}</div>
                      </div>

                      <div className="info-item">
                        <div className="info-label">IMDb Rating</div>
                        <div className="info-value rating">
                          {movie.imdb_rating
                            ? `${movie.imdb_rating}/10`
                            : "Not rated"}
                        </div>
                      </div>

                      <div className="info-item">
                        <div className="info-label">Language</div>
                        <div className="info-value">
                          {movie.language || "Not specified"}
                        </div>
                      </div>

                      <div className="info-item">
                        <div className="info-label">Country</div>
                        <div className="info-value">
                          {movie.country || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="section-title">Genres</h3>
                    <div className="genre-tags">
                      {movie.MovieGenres && movie.MovieGenres.length > 0 ? (
                        movie.MovieGenres.map((genre, index) => (
                          <span
                            key={index}
                            className={`genre-tag ${genre.Genres?.isDisabled ? "disabled" : ""}`}
                          >
                            {genre.Genres?.name}
                            {genre.Genres?.isDisabled && (
                              <span className="disabled-indicator">
                                (disabled)
                              </span>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="no-data">No genres specified</span>
                      )}
                    </div>
                  </div>

                  {movie.description && (
                    <div className="info-section">
                      <h3 className="section-title">Description</h3>
                      <div className="movie-description">
                        {movie.description}
                      </div>
                    </div>
                  )}

                  {movie.plot && (
                    <div className="info-section">
                      <h3 className="section-title">Plot</h3>
                      <div className="movie-plot">{movie.plot}</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "cast" && (
            <div className="tab-content">
              <div className="cast-section">
                <h3 className="section-title">Directors</h3>
                <div className="directors-list">
                  {movie.MovieDirectors && movie.MovieDirectors.length > 0 ? (
                    movie.MovieDirectors.map((director, index) => (
                      <div key={index} className="director-item">
                        {director.Directors?.name}
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No directors listed</div>
                  )}
                </div>
              </div>

              <div className="cast-section">
                <h3 className="section-title">Cast</h3>
                {renderActors()}
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="tab-content">
              <div className="media-section">
                <h3 className="section-title">Media</h3>

                <div className="media-item">
                  <div className="media-label">Poster URL</div>
                  <div className="media-value">
                    <a
                      href={movie.poster_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {movie.poster_url || "No poster URL"}
                    </a>
                  </div>
                </div>

                <div className="media-item">
                  <div className="media-label">Banner URL</div>
                  <div className="media-value">
                    {movie.banner_url ? (
                      <img
                        src={movie.banner_url}
                        alt={`${movie.title} poster`}
                      />
                    ) : (
                      <div className="no-poster-detail">No Image Available</div>
                    )}
                  </div>
                </div>

                {movie.trailer_url && (
                  <div className="media-item">
                    <div className="media-label">Trailer</div>
                    <div className="media-value">
                      <a
                        href={movie.trailer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trailer-btn"
                      >
                        <i className="fas fa-play-circle"></i> Watch Trailer
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {movie.banner_url && (
                <div className="banner-preview">
                  <h3 className="section-title">Banner Preview</h3>
                  <img src={movie.banner_url} alt={`${movie.title} banner`} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="movie-detail-footer">
          <div className="id-info">Movie ID: {movie.id}</div>
          <button className="action-button" onClick={onEdit}>
            Edit Movie
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPopup;
