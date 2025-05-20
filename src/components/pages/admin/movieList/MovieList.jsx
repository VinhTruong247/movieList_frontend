import { useState, useMemo, useEffect } from "react";
import { getMovies, addMovie, updateMovie } from "../../../../utils/MovieListAPI";
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

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovies();
      const formattedMovies = data.map((movie) => ({
        ...movie,
        poster: movie.poster_url,
        trailer: movie.trailer_url,
        genre: movie.MovieGenres?.map((g) => g.Genres?.name) || [],
        director:
          movie.MovieDirectors?.map((d) => d.Director?.name).join(", ") || "",
        isDisabled: movie.isDisabled,
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

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({...prev, show: false}));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const filteredMovies = useMemo(() => {
    let result = [...movies].sort((a, b) => Number(a.id) - Number(b.id));

    if (searchMovie) {
      const searchedMovie = searchMovie.toLowerCase();
      result = result.filter((movie) =>
        movie.title?.toLowerCase().includes(searchedMovie)
      );
    }

    return result;
  }, [movies, searchMovie]);

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const pageCount = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

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
          <button className="add-btn" onClick={handleAddMovie}>
            Add Movie
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
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
                className={movie.isDisabled ? "disabled-row" : ""}
              >
                <td>{movie.title}</td>
                <td>{movie.type}</td>
                <td>{movie.year}</td>
                <td>⭐ {movie.imdb_rating}</td>
                <td>{(movie.genre || []).join(", ")}</td>
                <td>
                  <span
                    className={`status-badge ${movie.isDisabled ? "disabled" : "active"}`}
                  >
                    {movie.isDisabled ? "Disabled" : "Active"}
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
                    className={`toggle-btn ${movie.isDisabled ? "enable" : "disable"}`}
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
            ))}
          </tbody>
        </table>
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
