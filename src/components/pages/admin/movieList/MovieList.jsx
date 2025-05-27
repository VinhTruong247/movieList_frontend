import { useState, useEffect, useMemo } from "react";
import supabase from "../../../../supabase-client";
import MovieFormPopup from "./movieForm/MovieFormPopup";
import "../ListStyle.scss";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    yearMin: "",
    yearMax: "",
    ratingMin: "",
    ratingMax: "",
  });
  const [filterErrors, setFilterErrors] = useState({
    yearMin: "",
    yearMax: "",
    ratingMin: "",
    ratingMax: "",
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

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

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const moviesData = await supabase
        .from("Movies")
        .select(
          `
          *,
          MovieGenres(
            genre_id,
            Genres(id, name)
          ),
          MovieDirectors(
            director_id,
            Directors(id, name)
          )
        `
        )
        .order("title");

      if (moviesData.error) throw moviesData.error;

      const processedMovies = moviesData.data.map((movie) => {
        return {
          ...movie,
          genres:
            movie.MovieGenres?.map((mg) => mg.Genres?.name)
              .filter(Boolean)
              .join(", ") || "",
          directors:
            movie.MovieDirectors?.map((md) => md.Directors?.name)
              .filter(Boolean)
              .join(", ") || "",
        };
      });

      setMovies(processedMovies);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = useMemo(() => {
    let result = [...movies];
    if (searchQuery) {
      const searchedText = searchQuery.toLowerCase();
      result = result.filter((movie) =>
        movie.title?.toLowerCase().includes(searchedText)
      );
    }
    if (filters.status) {
      if (filters.status === "active") {
        result = result.filter((movie) => !movie.isDisabled);
      } else if (filters.status === "disabled") {
        result = result.filter((movie) => movie.isDisabled);
      }
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
    return result;
  }, [movies, searchQuery, filters]);

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const pageCount = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

    if (name === "yearMin" || name === "yearMax") {
      if (!/^\d+$/.test(value)) {
        errors[name] = "Please enter numbers only";
        setFilterErrors(errors);
        return;
      }
      const numValue = parseInt(value);
      if (name === "yearMin") {
        if (numValue < 1900) {
          errors.yearMin = "Year must be 1900 or later";
        } else if (filters.yearMax && numValue > parseInt(filters.yearMax)) {
          errors.yearMin = "Minimum cannot exceed maximum";
        } else {
          errors.yearMin = "";
        }
        if (filters.yearMax && parseInt(filters.yearMax) < numValue) {
          errors.yearMax = "Maximum must be greater than minimum";
        } else if (filters.yearMax) {
          errors.yearMax = "";
        }
      }

      if (name === "yearMax") {
        const currentYear = new Date().getFullYear();
        if (numValue > currentYear + 5) {
          errors.yearMax = `Year must be ${currentYear + 5} or earlier`;
        } else if (filters.yearMin && numValue < parseInt(filters.yearMin)) {
          errors.yearMax = "Maximum must be greater than minimum";
        } else {
          errors.yearMax = "";
        }
        if (filters.yearMin && parseInt(filters.yearMin) > numValue) {
          errors.yearMin = "Minimum cannot exceed maximum";
        } else if (filters.yearMin) {
          errors.yearMin = "";
        }
      }
    }

    if (name === "ratingMin" || name === "ratingMax") {
      if (!/^\d*\.?\d*$/.test(value)) {
        errors[name] = "Please enter valid numbers";
        setFilterErrors(errors);
        return;
      }

      const numValue = parseFloat(value);
      if (name === "ratingMin") {
        if (numValue < 0) {
          errors.ratingMin = "Rating cannot be negative";
        } else if (numValue > 10) {
          errors.ratingMin = "Rating cannot exceed 10";
        } else if (
          filters.ratingMax &&
          numValue > parseFloat(filters.ratingMax)
        ) {
          errors.ratingMin = "Minimum cannot exceed maximum";
        } else {
          errors.ratingMin = "";
        }
        if (filters.ratingMax && parseFloat(filters.ratingMax) < numValue) {
          errors.ratingMax = "Maximum must be greater than minimum";
        } else if (filters.ratingMax) {
          errors.ratingMax = "";
        }
      }

      if (name === "ratingMax") {
        if (numValue < 0) {
          errors.ratingMax = "Rating cannot be negative";
        } else if (numValue > 10) {
          errors.ratingMax = "Rating cannot exceed 10";
        } else if (
          filters.ratingMin &&
          numValue < parseFloat(filters.ratingMin)
        ) {
          errors.ratingMax = "Maximum must be greater than minimum";
        } else {
          errors.ratingMax = "";
        }
        if (filters.ratingMin && parseFloat(filters.ratingMin) > numValue) {
          errors.ratingMin = "Minimum cannot exceed maximum";
        } else if (filters.ratingMin) {
          errors.ratingMin = "";
        }
      }
    }

    setFilterErrors(errors);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "",
      yearMin: "",
      yearMax: "",
      ratingMin: "",
      ratingMax: "",
    });
    setFilterErrors({
      yearMin: "",
      yearMax: "",
      ratingMin: "",
      ratingMax: "",
    });
    setCurrentPage(1);
  };

  const handleAddMovie = () => {
    setEditingMovie(null);
    setShowForm(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleToggleStatus = async (movie) => {
    const action = movie.isDisabled ? "enable" : "disable";

    if (window.confirm(`Are you sure you want to ${action} this movie?`)) {
      try {
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
          message: `Movie ${action}d successfully`,
          type: "success",
        });
      } catch (err) {
        console.error(`Error ${action}ing movie:`, err);
        setNotification({
          show: true,
          message: `Failed to ${action} movie: ${err.message}`,
          type: "error",
        });
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingMovie) {
        const { error } = await supabase
          .from("Movies")
          .update({
            title: values.title,
            year: values.year,
            type: values.type,
            description: values.description || null,
            isDisabled: values.isDisabled || false,
            imdb_rating: values.imdb_rating,
            poster_url: values.poster_url || null,
            banner_url: values.banner_url || null,
            trailer_url: values.trailer_url || null,
            runtime: values.runtime || null,
            country: values.country || null,
            language: values.language || null,
          })
          .eq("id", editingMovie.id);

        if (error) throw error;

        const { error: deleteGenreError } = await supabase
          .from("MovieGenres")
          .delete()
          .eq("movie_id", editingMovie.id);

        if (deleteGenreError) throw deleteGenreError;

        if (values.genreIds && values.genreIds.length > 0) {
          const uniqueGenreIds = [...new Set(values.genreIds)];

          const genreAssociations = uniqueGenreIds.map((genreId) => ({
            movie_id: editingMovie.id,
            genre_id: genreId,
          }));

          const { error: genreError } = await supabase
            .from("MovieGenres")
            .insert(genreAssociations);

          if (genreError) throw genreError;
        }

        const { error: deleteDirectorError } = await supabase
          .from("MovieDirectors")
          .delete()
          .eq("movie_id", editingMovie.id);

        if (deleteDirectorError) throw deleteDirectorError;

        if (values.directorIds && values.directorIds.length > 0) {
          const uniqueDirectorIds = [...new Set(values.directorIds)];
          const directorAssociations = uniqueDirectorIds.map((directorId) => ({
            movie_id: editingMovie.id,
            director_id: directorId,
          }));

          const { error: directorError } = await supabase
            .from("MovieDirectors")
            .insert(directorAssociations);

          if (directorError) throw directorError;
        }

        const { error: deleteActorError } = await supabase
          .from("MovieActors")
          .delete()
          .eq("movie_id", editingMovie.id);

        if (deleteActorError) throw deleteActorError;

        if (values.actorIds && values.actorIds.length > 0) {
          const uniqueActorIds = [...new Set(values.actorIds)];

          const actorAssociations = uniqueActorIds.map((actorId) => ({
            movie_id: editingMovie.id,
            actor_id: actorId,
          }));

          const { error: actorError } = await supabase
            .from("MovieActors")
            .insert(actorAssociations);

          if (actorError) throw actorError;
        }

        await fetchMovies();

        setNotification({
          show: true,
          message: "Movie updated successfully",
          type: "success",
        });
      } else {
        const { data, error } = await supabase
          .from("Movies")
          .insert({
            title: values.title,
            year: values.year,
            type: values.type,
            description: values.description || null,
            isDisabled: false,
            imdb_rating: values.imdb_rating,
            poster_url: values.poster_url || null,
            banner_url: values.banner_url || null,
            trailer_url: values.trailer_url || null,
            runtime: values.runtime || null,
            country: values.country || null,
            language: values.language || null,
          })
          .select();

        if (error) throw error;

        const newMovieId = data[0].id;
        if (values.genreIds && values.genreIds.length > 0) {
          const genreAssociations = values.genreIds.map((genreId) => ({
            movie_id: newMovieId,
            genre_id: genreId,
          }));

          await supabase.from("MovieGenres").insert(genreAssociations);
        }
        if (values.directorIds && values.directorIds.length > 0) {
          const directorAssociations = values.directorIds.map((directorId) => ({
            movie_id: newMovieId,
            director_id: directorId,
          }));

          await supabase.from("MovieDirectors").insert(directorAssociations);
        }
        if (values.actorIds && values.actorIds.length > 0) {
          const actorAssociations = values.actorIds.map((actorId) => ({
            movie_id: newMovieId,
            actor_id: actorId,
          }));

          await supabase.from("MovieActors").insert(actorAssociations);
        }
        fetchMovies();

        setNotification({
          show: true,
          message: "Movie created successfully",
          type: "success",
        });
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving movie:", err);
      setNotification({
        show: true,
        message: `Failed to save movie: ${err.message}`,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading movies...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="list-section">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button onClick={handleAddMovie} className="add-btn">
            Add New Movie
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
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
            <label>Year Min</label>
            <input
              type="number"
              name="yearMin"
              value={filters.yearMin}
              onChange={handleFilterChange}
              placeholder="Min Year"
              min="1900"
              className={filterErrors.yearMin ? "input-error" : ""}
            />
            {filterErrors.yearMin && (
              <div className="error-text">{filterErrors.yearMin}</div>
            )}
          </div>
          <div className="filter-group">
            <label>Year Max</label>
            <input
              type="number"
              name="yearMax"
              value={filters.yearMax}
              onChange={handleFilterChange}
              placeholder="Max Year"
              min="1900"
              className={filterErrors.yearMax ? "input-error" : ""}
            />
            {filterErrors.yearMax && (
              <div className="error-text">{filterErrors.yearMax}</div>
            )}
          </div>
          <div className="filter-group">
            <label>Rating Min</label>
            <input
              type="number"
              name="ratingMin"
              value={filters.ratingMin}
              onChange={handleFilterChange}
              placeholder="Min Rating"
              min="0"
              max="10"
              step="0.1"
              className={filterErrors.ratingMin ? "input-error" : ""}
            />
            {filterErrors.ratingMin && (
              <div className="error-text">{filterErrors.ratingMin}</div>
            )}
          </div>
          <div className="filter-group">
            <label>Rating Max</label>
            <input
              type="number"
              name="ratingMax"
              value={filters.ratingMax}
              onChange={handleFilterChange}
              placeholder="Max Rating"
              min="0"
              max="10"
              step="0.1"
              className={filterErrors.ratingMax ? "input-error" : ""}
            />
            {filterErrors.ratingMax && (
              <div className="error-text">{filterErrors.ratingMax}</div>
            )}
          </div>
          <button className="reset-filter-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      {showForm && (
        <MovieFormPopup
          movie={editingMovie}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          isSubmitting={false}
        />
      )}

      <div className="table-container">
        <table className="table-data">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Year</th>
              <th>Rating</th>
              <th>Genres</th>
              <th>Directors</th>
              <th>Status</th>
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
                  <td>
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
                  <td>{movie.year}</td>
                  <td>⭐ {movie.imdb_rating}</td>
                  <td>{movie.genres}</td>
                  <td>{movie.directors}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        movie.isDisabled ? "disabled" : "active"
                      }`}
                    >
                      {movie.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEditMovie(movie)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(movie)}
                      className={
                        movie.isDisabled ? "enable-btn" : "disable-btn"
                      }
                    >
                      {movie.isDisabled ? "Enable" : "Disable"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data-row">
                  {movies.length > 0
                    ? "No movies found matching your criteria"
                    : "No movies found. Add your first movie!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredMovies.length > ITEMS_PER_PAGE && (
        <div className="table-footer">
          <div className="results-count">
            Showing {paginatedMovies.length} of {filteredMovies.length} movies
          </div>

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
        </div>
      )}
    </div>
  );
};

export default MovieList;
