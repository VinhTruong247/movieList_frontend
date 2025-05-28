import "./MovieDetailPopup.scss";

const MovieDetailPopup = ({ movie, onClose, onEdit }) => {
  return (
    <div className="movie-detail-overlay">
      <div className="movie-detail-container">
        <div className="movie-detail-header">
          <h2>{movie.title}</h2>
          <div className="movie-detail-actions">
            <button className="edit-button" onClick={onEdit}>
              Edit
            </button>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="movie-detail-content">
          <div className="movie-poster">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={`${movie.title} poster`} />
            ) : (
              <div className="no-poster-detail">No Image Available</div>
            )}
          </div>

          <div className="movie-info">
            <div className="info-row">
              <strong>Year:</strong> {movie.year}
            </div>
            <div className="info-row">
              <strong>IMDB Rating:</strong> ⭐ {movie.imdb_rating}
            </div>
            <div className="info-row">
              <strong>Genres:</strong> {movie.genres}
            </div>
            <div className="info-row">
              <strong>Directors:</strong> {movie.directors}
            </div>
            <div className="info-row">
              <strong>Status:</strong>
              <span
                className={`status-badge ${movie.isDisabled ? "disabled" : "active"}`}
              >
                {movie.isDisabled ? "Disabled" : "Active"}
              </span>
            </div>
            {movie.plot && (
              <div className="info-row plot">
                <strong>Plot:</strong>
                <p>{movie.plot}</p>
              </div>
            )}
            {movie.runtime && (
              <div className="info-row">
                <strong>Runtime:</strong> {movie.runtime} minutes
              </div>
            )}
            {movie.description && (
              <div className="info-row description">
                <strong>Description:</strong>
                <p>{movie.description}</p>
              </div>
            )}
            {movie.trailerUrl && (
              <div className="info-row">
                <strong>Trailer URL:</strong>
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {movie.trailerUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPopup;
