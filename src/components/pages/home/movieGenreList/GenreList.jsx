import { useState, useEffect, useContext } from "react";
import { getAllGenres } from "../../../../services/GenresAPI";
import { MovieContext } from "../../../../context/MovieContext";
import "./GenreList.scss";

const GenreList = ({
  selectedGenre,
  onGenreSelect
}) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(MovieContext);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const data = await getAllGenres(isAdmin);
        setGenres(data);
      } catch (err) {
        console.error("Failed to load genres:", err);
        setError(err.message);
      } finally {
        setLoading(false);
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
      ) : (
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
      )}
    </div>
  );
};

export default GenreList;
