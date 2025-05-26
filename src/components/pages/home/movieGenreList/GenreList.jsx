import { useState, useEffect, useContext } from "react";
import { getAllGenres } from "../../../../services/GenresAPI";
import { MovieContext } from "../../../../context/MovieContext";
import "./GenreList.scss";

const GenreList = ({
  selectedGenre,
  onGenreSelect,
  activeMovieType,
  activeSortType,
  onMovieTypeChange,
  onSortTypeChange,
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
      <h3 className="filter-title">Movie Type</h3>
      <div className="filter-buttons">
        <button
          className={`filter-btn ${activeMovieType === "all" ? "active" : ""}`}
          onClick={() => onMovieTypeChange("all")}
        >
          All Types
        </button>
        <button
          className={`filter-btn ${activeMovieType === "Movie" ? "active" : ""}`}
          onClick={() => onMovieTypeChange("Movie")}
        >
          Movies
        </button>
        <button
          className={`filter-btn ${activeMovieType === "TV Series" ? "active" : ""}`}
          onClick={() => onMovieTypeChange("TV Series")}
        >
          TV Series
        </button>
      </div>

      <h3 className="filter-title">Sort By</h3>
      <div className="filter-buttons">
        <button
          className={`filter-btn ${activeSortType === "all" ? "active" : ""}`}
          onClick={() => onSortTypeChange("all")}
        >
          Default
        </button>
        <button
          className={`filter-btn ${activeSortType === "top-rated" ? "active" : ""}`}
          onClick={() => onSortTypeChange("top-rated")}
        >
          Top Rated
        </button>
        <button
          className={`filter-btn ${activeSortType === "latest" ? "active" : ""}`}
          onClick={() => onSortTypeChange("latest")}
        >
          Latest
        </button>
      </div>

      <h3 className="filter-title">Genres</h3>
      <div className="genre-list">
        <button
          className={`genre-item ${selectedGenre === "all" ? "active" : ""}`}
          onClick={() => onGenreSelect("all")}
        >
          All Genres
        </button>

        {loading ? (
          <div className="genre-loading">Loading genres...</div>
        ) : error ? (
          <div className="genre-error">Error loading genres</div>
        ) : (
          genres.map((genre) => (
            <button
              key={genre.id}
              className={`genre-item ${
                selectedGenre === genre.name ? "active" : ""
              } ${isAdmin && genre.isDisabled ? "disabled-item" : ""}`}
              onClick={() => onGenreSelect(genre.name)}
            >
              {genre.name}
              {isAdmin && genre.isDisabled && (
                <span className="admin-disabled"> (disabled)</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default GenreList;
