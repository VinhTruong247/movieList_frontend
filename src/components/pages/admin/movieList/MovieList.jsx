import React, { useState, useMemo, useEffect } from "react";
import { getMovies, addMovie, updateMovie } from "../../../../utils/MovieListAPI";
import MovieForm from "./movieForm/MovieForm";
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

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovies();
      const formattedMovies = data.map((movie) => ({
        ...movie,
        poster: movie.poster_url,
        trailer: movie.trailer_url,
        genre: movie.MovieGenres?.map((g) => g.Genres.name) || [],
        director:
          movie.MovieDirectors?.map((d) => d.Director.name).join(", ") || "",
        isDisable: movie.isDisabled,
      }));
      setMovies(formattedMovies);
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

  const filteredMovies = useMemo(() => {
    let result = [...movies].sort((a, b) => Number(a.id) - Number(b.id));

    if (searchMovie) {
      const searchedMovie = searchMovie.toLowerCase();
      result = result.filter((movie) =>
        movie.title.toLowerCase().includes(searchedMovie)
      );
    }

    return result;
  }, [movies, searchMovie]);

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const pageCount = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const handleAddMovie = () => {
    setEditingMovie(null);
    setShowForm(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setProcessingMovies((prev) => [...prev, values.id]);
      const movieData = {
        title: values.title,
        type: values.type,
        year: values.year,
        genre: values.genre,
        director: values.director,
        imdb_rating: values.imdb_rating,
        description: values.description,
        runtime: values.runtime,
        language: values.language,
        country: values.country,
        posterUrl: values.poster,
        trailerUrl: values.trailer,
        isDisabled: values.isDisable || false,
        genreIds: values.genre?.map((g) => g.id) || [],
        directorIds: [values.director.id],
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
