import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router";
import { fetchMovies } from "../../../redux/slices/moviesSlice";
import { getAllGenres } from "../../../services/GenresAPI";
import { getAllDirectors } from "../../../services/DirectorsAPI";
import MovieCard from "./movieCard/MovieCard";
import "./MovieList.scss";

const MovieList = () => {
  const dispatch = useDispatch();
  const {
    items: movies,
    loading,
    error,
  } = useSelector((state) => state.movies);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    genre: "all",
    movieType: "all",
    yearMin: "",
    yearMax: "",
    ratingMin: "",
    ratingMax: "",
    director: "all",
    sortBy: "title",
    sortOrder: "asc",
  });
  const [genres, setGenres] = useState([]);
  const [directors, setDirectors] = useState([]);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    dispatch(fetchMovies());
    loadFilterData();
  }, [dispatch]);

  const loadFilterData = async () => {
    try {
      const [genresData, directorsData] = await Promise.all([
        getAllGenres(),
        getAllDirectors(),
      ]);

      setGenres(genresData.filter((g) => !g.isDisabled));
      setDirectors(directorsData.filter((d) => !d.isDisabled));
    } catch (error) {
      console.error("Error loading filter data:", error);
    }
  };

  const filteredMovies = useMemo(() => {
    let result = [...movies];
    result = result.filter((movie) => !movie.isDisabled);

    if (searchQuery) {
      const searchText = searchQuery.toLowerCase();
      result = result.filter((movie) => {
        if (movie.title?.toLowerCase().includes(searchText)) {
          return true;
        }
        if (movie.MovieDirectors && Array.isArray(movie.MovieDirectors)) {
          if (
            movie.MovieDirectors.some((director) =>
              director.Directors?.name?.toLowerCase().includes(searchText)
            )
          ) {
            return true;
          }
        }
        if (movie.MovieActors && Array.isArray(movie.MovieActors)) {
          if (
            movie.MovieActors.some(
              (actor) =>
                actor.Actors?.name?.toLowerCase().includes(searchText) ||
                actor.character_name?.toLowerCase().includes(searchText)
            )
          ) {
            return true;
          }
        }

        return false;
      });
    }

    if (filters.genre !== "all") {
      D;
      result = result.filter((movie) => {
        if (!movie.MovieGenres || !Array.isArray(movie.MovieGenres)) {
          return false;
        }
        return movie.MovieGenres.some(
          (genreItem) =>
            genreItem.Genres &&
            genreItem.Genres.name === filters.genre &&
            !genreItem.Genres.isDisabled
        );
      });
    }

    if (filters.movieType !== "all") {
      result = result.filter((movie) => movie.type === filters.movieType);
    }

    if (filters.yearMin) {
      const minYear = parseInt(filters.yearMin);
      result = result.filter((movie) => parseInt(movie.year) >= minYear);
    }
    if (filters.yearMax) {
      const maxYear = parseInt(filters.yearMax);
      result = result.filter((movie) => parseInt(movie.year) <= maxYear);
    }

    if (filters.ratingMin) {
      const minRating = parseFloat(filters.ratingMin);
      result = result.filter(
        (movie) => parseFloat(movie.imdb_rating) >= minRating
      );
    }
    if (filters.ratingMax) {
      const maxRating = parseFloat(filters.ratingMax);
      result = result.filter(
        (movie) => parseFloat(movie.imdb_rating) <= maxRating
      );
    }

    if (filters.director !== "all") {
      result = result.filter((movie) => {
        if (!movie.MovieDirectors || !Array.isArray(movie.MovieDirectors)) {
          return false;
        }
        return movie.MovieDirectors.some(
          (directorItem) =>
            directorItem.Directors &&
            directorItem.Directors.name === filters.director &&
            !directorItem.Directors.isDisabled
        );
      });
    }

    result.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "title":
          aValue = a.title?.toLowerCase() || "";
          bValue = b.title?.toLowerCase() || "";
          break;
        case "year":
          aValue = parseInt(a.year) || 0;
          bValue = parseInt(b.year) || 0;
          break;
        case "rating":
          aValue = parseFloat(a.imdb_rating) || 0;
          bValue = parseFloat(b.imdb_rating) || 0;
          break;
        case "newest":
          aValue = new Date(a.created_at) || new Date(0);
          bValue = new Date(b.created_at) || new Date(0);
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return result;
  }, [movies, searchQuery, filters]);

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const pageCount = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      genre: "all",
      movieType: "all",
      yearMin: "",
      yearMax: "",
      ratingMin: "",
      ratingMax: "",
      director: "all",
      sortBy: "title",
      sortOrder: "asc",
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      searchQuery ||
      filters.genre !== "all" ||
      filters.movieType !== "all" ||
      filters.yearMin ||
      filters.yearMax ||
      filters.ratingMin ||
      filters.ratingMax ||
      filters.director !== "all"
    );
  };

  if (loading) return <div className="loading">Loading movies...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="movie-list-page">
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Browse Movies & TV Shows</h1>
            <p>Discover your next favorite entertainment from our collection</p>
            <div className="stats">
              <span className="stat-item">
                <strong>{filteredMovies.length}</strong>{" "}
                {filteredMovies.length === 1 ? "title" : "titles"} found
              </span>
            </div>
          </div>

          <div className="header-controls">
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <span className="icon">⊞</span>
                Grid
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <span className="icon">☰</span>
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-actions">
            <button
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="icon">⚙</span>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {hasActiveFilters() && (
              <button className="clear-filters-btn" onClick={resetFilters}>
                <span className="icon">✕</span>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-grid">
              <div className="filter-group">
                <label>Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange("genre", e.target.value)}
                >
                  <option value="all">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.name}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Type</label>
                <select
                  value={filters.movieType}
                  onChange={(e) =>
                    handleFilterChange("movieType", e.target.value)
                  }
                >
                  <option value="all">All Types</option>
                  <option value="Movie">Movies</option>
                  <option value="TV Series">TV Series</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Director</label>
                <select
                  value={filters.director}
                  onChange={(e) =>
                    handleFilterChange("director", e.target.value)
                  }
                >
                  <option value="all">All Directors</option>
                  {directors.map((director) => (
                    <option key={director.id} value={director.name}>
                      {director.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Year From</label>
                <input
                  type="number"
                  placeholder="Min Year"
                  value={filters.yearMin}
                  onChange={(e) =>
                    handleFilterChange("yearMin", e.target.value)
                  }
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="filter-group">
                <label>Year To</label>
                <input
                  type="number"
                  placeholder="Max Year"
                  value={filters.yearMax}
                  onChange={(e) =>
                    handleFilterChange("yearMax", e.target.value)
                  }
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="filter-group">
                <label>Rating From</label>
                <input
                  type="number"
                  placeholder="Min Rating"
                  value={filters.ratingMin}
                  onChange={(e) =>
                    handleFilterChange("ratingMin", e.target.value)
                  }
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              <div className="filter-group">
                <label>Rating To</label>
                <input
                  type="number"
                  placeholder="Max Rating"
                  value={filters.ratingMax}
                  onChange={(e) =>
                    handleFilterChange("ratingMax", e.target.value)
                  }
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                >
                  <option value="title">Title</option>
                  <option value="year">Year</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest Added</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sort Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    handleFilterChange("sortOrder", e.target.value)
                  }
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="content-section">
        {filteredMovies.length > 0 ? (
          <>
            <div className={`movies-container ${viewMode}`}>
              {paginatedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} viewMode={viewMode} />
              ))}
            </div>

            {pageCount > 1 && (
              <div className="pagination-section">
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                    let pageNum;
                    if (pageCount <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pageCount - 2) {
                      pageNum = pageCount - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    className="page-btn"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                    }
                    disabled={currentPage === pageCount}
                  >
                    Next
                  </button>
                </div>

                <div className="pagination-info">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredMovies.length
                  )}{" "}
                  of {filteredMovies.length} results
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🎬</div>
            <h3>No movies found</h3>
            <p>
              {hasActiveFilters()
                ? "No movies match your current filters. Try adjusting your search criteria."
                : "No movies are currently available in our collection."}
            </p>
            {hasActiveFilters() && (
              <button className="clear-filters-btn" onClick={resetFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="browse-section">
        <div className="container">
          <h3>Explore More</h3>
          <p className="browse-description">
            Discover more about the people behind your favorite movies
          </p>
          <div className="browse-links">
            <Link to="/actors" className="browse-card">
              <div className="browse-icon">🎭</div>
              <div className="browse-content">
                <h4>Browse Actors</h4>
                <p>Discover talented actors and their filmography</p>
              </div>
              <div className="browse-arrow">→</div>
            </Link>
            <Link to="/directors" className="browse-card">
              <div className="browse-icon">🎬</div>
              <div className="browse-content">
                <h4>Browse Directors</h4>
                <p>Explore acclaimed directors and their masterpieces</p>
              </div>
              <div className="browse-arrow">→</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieList;
