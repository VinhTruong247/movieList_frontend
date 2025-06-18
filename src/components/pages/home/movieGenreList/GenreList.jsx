import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getAllGenres } from "../../../../services/GenresAPI";
import "./GenreList.scss";

const GenreList = ({ selectedGenre, onGenreSelect }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const data = await getAllGenres(isAdmin);
        if (isMounted.current) {
          setGenres(data || []);
        }
      } catch (err) {
        console.error("Failed to load genres:", err);
        if (isMounted.current) {
          setError(err.message);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    fetchGenres();
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
          Error loading genres: {error}
        </div>
      ) : genres && genres.length > 0 ? (
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
        <div className="genre-error">
          <span className="error-icon">⚠️</span>
          No genres available
        </div>
      )}
    </div>
  );
};

export default GenreList;
