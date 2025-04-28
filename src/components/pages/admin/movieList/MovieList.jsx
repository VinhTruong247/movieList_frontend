import React, { useState, useMemo, useEffect } from "react";
import { useMovies } from "../../../../hooks/useMovies";
import { createMovie, updateMovie } from "../../../../utils/MovieListAPI";
import MovieForm from "./movieForm/MovieForm";
import "./MovieList.scss";

const ITEMS_PER_PAGE = 10;

const MovieList = () => {
  const { movies, loading, error, refreshMovies } = useMovies();
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

  const filteredMovies = useMemo(() => {
    let result = [...movies].sort((a, b) => Number(a.id) - Number(b.id));

    if (searchMovie) {
      const searchedMovie = searchMovie.toLowerCase();
      result = result.filter(
        (movie) =>
          movie.id.toLowerCase().includes(searchedMovie) ||
          movie.title.toLowerCase().includes(searchedMovie)
      );
    }
    return result;
  }, [movies, searchMovie]);

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchMovie]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
    try {
      setProcessingMovies((prev) => [...prev, movie.id]);

      const updatedMovie = {
        ...movie,
        isDisable: !movie.isDisable,
      };
      await updateMovie(movie.id, updatedMovie);
      await refreshMovies();

      setNotification({
        show: true,
        message: `"${movie.title}" has been ${updatedMovie.isDisable ? "disabled" : "enabled"}`,
        type: "success",
      });
    } catch (error) {
      console.error("Error toggling movie status:", error);
      setNotification({
        show: true,
        message: `Error: Failed to update status for "${movie.title}"`,
        type: "error",
      });
    } finally {
      setProcessingMovies((prev) => prev.filter((id) => id !== movie.id));
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (editingMovie) {
        await updateMovie(editingMovie.id, values);
        setNotification({
          show: true,
          message: `"${values.title}" has been updated successfully`,
          type: "success",
        });
      } else {
        await createMovie(values);
        setNotification({
          show: true,
          message: `"${values.title}" has been added successfully`,
          type: "success",
        });
      }
      await refreshMovies();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving movie:", error);
      setNotification({
        show: true,
        message: `Error: ${error.message || "Failed to save movie"}`,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
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
              placeholder="Search by ID or Title..."
              value={searchMovie}
              onChange={(e) => setSearchMovie(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-btn" onClick={handleAddMovie}>
            Add Movie
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Year</th>
              <th>Rating</th>
              <th>Genre</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMovies.map((movie) => (
              <tr
                key={movie.id}
                className={movie.isDisable ? "disabled-row" : ""}
              >
                <td>{movie.id}</td>
                <td>{movie.title}</td>
                <td>{movie.type}</td>
                <td>{movie.year}</td>
                <td>⭐ {movie.imdb_rating}</td>
                <td>{movie.genre.join(", ")}</td>
                <td>
                  <span
                    className={`status-badge ${movie.isDisable ? "disabled" : "active"}`}
                  >
                    {movie.isDisable ? "Disabled" : "Active"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditMovie(movie)}
                    disabled={processingMovies.includes(movie.id)}
                  >
                    Edit
                  </button>
                  <button
                    className={`toggle-btn ${movie.isDisable ? "enable" : "disable"}`}
                    onClick={() => handleToggleStatus(movie)}
                    disabled={processingMovies.includes(movie.id)}
                  >
                    {processingMovies.includes(movie.id) ? (
                      <span className="loading-spinner"></span>
                    ) : movie.isDisable ? (
                      "Enable"
                    ) : (
                      "Disable"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <MovieForm
          movie={editingMovie}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingMovie(null);
          }}
        />
      )}
    </div>
  );
};

export default MovieList;
