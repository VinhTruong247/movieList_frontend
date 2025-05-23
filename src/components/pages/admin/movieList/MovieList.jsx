import { useState, useMemo, useEffect } from "react";
import {
  getMovies,
  addMovie,
  updateMovie,
} from "../../../../services/MovieListAPI";
import MovieForm from "./movieForm/MovieForm";
import supabase from "../../../../supabase-client";
import "./MovieList.scss";

const ITEMS_PER_PAGE = 10;

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMovie, setSearchMovie] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [processingMovies, setProcessingMovies] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    yearFrom: "",
    yearTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterErrors, setFilterErrors] = useState({
    yearFrom: "",
    yearTo: "",
  });
  const [formData, setFormData] = useState({ genres: [], directors: [] });

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      setError("Failed to load movies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (searchMovie) {
      const searchedMovie = searchMovie.toLowerCase();
      result = result.filter((movie) =>
        movie.title?.toLowerCase().includes(searchedMovie)
      );
    }

    if (filters.type) {
      result = result.filter((movie) => movie.type === filters.type);
    }

    if (filters.status) {
      if (filters.status === "active") {
        result = result.filter((movie) => !movie.isDisabled);
      } else if (filters.status === "disabled") {
        result = result.filter((movie) => movie.isDisabled);
      }
    }

    if (filters.yearFrom) {
      result = result.filter(
        (movie) => movie.year >= parseInt(filters.yearFrom)
      );
    }

    if (filters.yearTo) {
      result = result.filter((movie) => movie.year <= parseInt(filters.yearTo));
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [movies, searchMovie, sortConfig, filters]);

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const pageCount = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddMovie = async () => {
    // Only fetch form data when needed
    if (formData.genres.length === 0 || formData.directors.length === 0) {
      setLoading(true);
      try {
        const [genresData, { data: directorsData }] = await Promise.all([
          getAllGenres(),
          supabase.from("Directors").select("*").order("name"),
        ]);

        setFormData({
          genres: genresData || [],
          directors: directorsData || [],
        });
      } catch (err) {
        console.error("Error loading form data:", err);
      } finally {
        setLoading(false);
      }
    }

    setEditingMovie(null);
    setShowForm(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleToggleStatus = async (movie) => {
    const message = movie.isDisabled ? "enable" : "disable";
    if (window.confirm(`Are you sure you want to ${message} this movie?`)) {
      try {
        setProcessingMovies((prev) => [...prev, movie.id]);

        const { error } = await supabase
          .from("Movies")
          .update({ isDisabled: !movie.isDisabled })
          .eq("id", movie.id);

        if (error) throw error;

        setMovies(
          movies.map((m) =>
            m.id === movie.id ? { ...m, isDisabled: !movie.isDisabled } : m
          )
        );

        setNotification({
          show: true,
          message: `Movie ${message}d successfully!`,
          type: "success",
        });
      } catch (err) {
        console.error(`Failed to ${message} movie:`, err);
        setNotification({
          show: true,
          message: `Failed to ${message} movie: ${err.message}`,
          type: "error",
        });
      } finally {
        setProcessingMovies((prev) => prev.filter((id) => id !== movie.id));
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
    setCurrentPage(1);
  };

  const validateField = (name, value) => {
    const errors = { ...filterErrors };
    if (!value) {
      errors[name] = "";
      setFilterErrors(errors);
      return;
    }

    const currentYear = new Date().getFullYear();
    const containsNonNumeric = /[^\d]/.test(value);

    if ((name === "yearFrom" || name === "yearTo") && containsNonNumeric) {
      errors[name] = "Please enter numbers only";
      setFilterErrors(errors);
      return;
    }

    if (name === "yearFrom") {
      const yearNum = parseInt(value);

      if (isNaN(yearNum)) {
        errors.yearFrom = "Please enter a valid year";
      } else if (yearNum < 1888) {
        errors.yearFrom = "Year must be 1888 or later";
      } else if (yearNum > currentYear + 10) {
        errors.yearFrom = `Year cannot be more than ${currentYear + 10}`;
      } else if (filters.yearTo && yearNum > parseInt(filters.yearTo)) {
        errors.yearFrom = "From year cannot exceed To year";
      } else {
        errors.yearFrom = "";
      }
      if (filters.yearTo && parseInt(filters.yearTo) < yearNum) {
        errors.yearTo = "To year must be after From year";
      } else if (filters.yearTo) {
        errors.yearTo = "";
      }
    }

    if (name === "yearTo") {
      const yearNum = parseInt(value);

      if (isNaN(yearNum)) {
        errors.yearTo = "Please enter a valid year";
      } else if (yearNum < 1888) {
        errors.yearTo = "Year must be 1888 or later";
      } else if (yearNum > currentYear + 10) {
        errors.yearTo = `Year cannot be more than ${currentYear + 10}`;
      } else if (filters.yearFrom && yearNum < parseInt(filters.yearFrom)) {
        errors.yearTo = "To year must be after From year";
      } else {
        errors.yearTo = "";
      }
      if (filters.yearFrom && parseInt(filters.yearFrom) > yearNum) {
        errors.yearFrom = "From year cannot exceed To year";
      } else if (filters.yearFrom) {
        errors.yearFrom = "";
      }
    }

    setFilterErrors(errors);
  };

  const resetFilters = () => {
    setFilters({
      type: "",
      status: "",
      yearFrom: "",
      yearTo: "",
    });
    setFilterErrors({
      yearFrom: "",
      yearTo: "",
    });
    setCurrentPage(1);
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setProcessingMovies((prev) => [...prev, values.id]);
      const movieData = {
        title: values.title,
        year: values.year,
        imdb_rating: values.imdb_rating,
        description: values.description,
        type: values.type,
        runtime: values.runtime,
        language: values.language,
        country: values.country,
        posterUrl: values.poster_url,
        bannerUrl: values.banner_url,
        trailerUrl: values.trailer_url,
        isDisabled: values.isDisabled || false,
        genreIds: values.genre?.map((g) => g.id || g) || [],
        directorIds: values.director?.id ? [values.director.id] : [],
      };

      if (editingMovie) {
        await updateMovie(values.id, movieData);
        setNotification({
          show: true,
          message: "Movie updated successfully!",
          type: "success",
        });
      } else {
        await addMovie(movieData);
        setNotification({
          show: true,
          message: "Movie added successfully!",
          type: "success",
        });
      }

      resetForm();
      setShowForm(false);
      fetchMovies();
    } catch (error) {
      setNotification({
        show: true,
        message: `Failed to ${editingMovie ? "update" : "add"} movie: ${
          error.message
        }`,
        type: "error",
      });
    } finally {
      setSubmitting(false);
      setProcessingMovies((prev) => prev.filter((id) => id !== values.id));
    }
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="movie-list-section">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="list-header">
        <h2>Movie Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Title..."
              value={searchMovie}
              onChange={(e) => setSearchMovie(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button className="add-btn" onClick={handleAddMovie}>
            Add Movie
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Movie Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="Movie">Movie</option>
              <option value="TV Series">TV Series</option>
              <option value="Documentary">Documentary</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Year From</label>
            <input
              type="number"
              name="yearFrom"
              value={filters.yearFrom}
              onChange={handleFilterChange}
              placeholder="From"
              className={filterErrors.yearFrom ? "input-error" : ""}
            />
            {filterErrors.yearFrom && (
              <div className="error-text">{filterErrors.yearFrom}</div>
            )}
          </div>
          <div className="filter-group">
            <label>Year To</label>
            <input
              type="number"
              name="yearTo"
              value={filters.yearTo}
              onChange={handleFilterChange}
              placeholder="To"
              className={filterErrors.yearTo ? "input-error" : ""}
            />
            {filterErrors.yearTo && (
              <div className="error-text">{filterErrors.yearTo}</div>
            )}
          </div>
          <button className="reset-filter-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th onClick={() => requestSort("title")} className="sortable">
                Title{getSortIndicator("title")}
              </th>
              <th onClick={() => requestSort("type")} className="sortable">
                Type{getSortIndicator("type")}
              </th>
              <th onClick={() => requestSort("year")} className="sortable">
                Year{getSortIndicator("year")}
              </th>
              <th
                onClick={() => requestSort("imdb_rating")}
                className="sortable"
              >
                Rating{getSortIndicator("imdb_rating")}
              </th>
              <th
                onClick={() => requestSort("isDisabled")}
                className="sortable"
              >
                Status{getSortIndicator("isDisabled")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMovies.length > 0 ? (
              paginatedMovies.map((movie) => (
                <tr
                  key={movie.id}
                  className={movie.isDisabled ? "disabled-row" : ""}
                >
                  <td className="poster-cell">
                    {movie.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={`${movie.title} poster`}
                        className="movie-thumbnail"
                      />
                    ) : (
                      <div className="no-poster">No Image</div>
                    )}
                  </td>
                  <td>{movie.title}</td>
                  <td>{movie.type}</td>
                  <td>{movie.year}</td>
                  <td>⭐ {movie.imdb_rating}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        movie.isDisabled ? "disabled" : "active"
                      }`}
                    >
                      {movie.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditMovie(movie)}
                      disabled={processingMovies.includes(movie.id)}
                    >
                      Edit
                    </button>
                    <button
                      className={`toggle-btn ${
                        movie.isDisabled ? "enable" : "disable"
                      }`}
                      onClick={() => handleToggleStatus(movie)}
                      disabled={processingMovies.includes(movie.id)}
                    >
                      {processingMovies.includes(movie.id) ? (
                        <span className="loading-spinner"></span>
                      ) : movie.isDisabled ? (
                        "Enable"
                      ) : (
                        "Disable"
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  No movies found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="results-count">
          Showing {paginatedMovies.length} of {filteredMovies.length} movies
        </div>

        {pageCount > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <MovieForm
          movie={editingMovie}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingMovie(null);
          }}
          formData={formData}
        />
      )}
    </div>
  );
};

export default MovieList;
