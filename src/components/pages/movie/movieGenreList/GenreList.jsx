import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAllGenres } from "../../../../services/GenresAPI";
import "./GenreList.scss";

const GenreList = ({ selectedGenre, onGenreSelect }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await getAllGenres(isAdmin);
        setLoading(false);

        if (Array.isArray(data) && data.length > 0) {
          setGenres(data);
        } else {
          setError("No genres found");
        }
      } catch (error) {
        console.error("Error loading genres:", error);
        setLoading(false);
        setError(error.message);
      }
    };

    loadGenres();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAdmin]);

  return (
    <div className="genre-list-container">
      <h3 className="filter-title">Genres</h3>

      {loading ? (
        <div className="genre-loading">
          <div className="loading-spinner"></div>
          Loading genres...
        </div>
      ) : error ? (
        <div className="genre-error">
          <span className="error-icon">⚠️</span>
          Error: {error}
        </div>
      ) : genres.length > 0 ? (
        <div className="genre-list">
          <button
            className={`genre-item ${selectedGenre === "all" ? "active" : ""}`}
            onClick={() => onGenreSelect("all")}
          >
            All Genres
          </button>

          {genres.map((genre) => (
            <button
              key={genre.id}
              className={`genre-item ${
                selectedGenre === genre.name ? "active" : ""
              } ${isAdmin && genre.isDisabled ? "disabled-item" : ""}`}
              onClick={() => onGenreSelect(genre.name)}
              disabled={!isAdmin && genre.isDisabled}
            >
              {genre.name}
              {isAdmin && genre.isDisabled && (
                <span className="admin-disabled"> (disabled)</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="genre-message">No genres available</div>
      )}
    </div>
  );
};

export default GenreList;
