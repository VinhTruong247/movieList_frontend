import React, { useState, useMemo, useEffect } from 'react';
import { useMovies } from '../../../../hooks/useMovies';
import { createMovie, updateMovie } from '../../../../utils/MovieListAPI';
import MovieForm from './movieForm/MovieForm';
import './MovieList.scss';

const ITEMS_PER_PAGE = 10;

const MovieList = () => {
  const { movies, loading, error, refreshMovies } = useMovies();
  const [searchMovie, setSearchMovie] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const filteredMovies = useMemo(() => {
    let result = [...movies].sort((a, b) => Number(a.id) - Number(b.id));

    if (searchMovie) {
      const searchedMovie = searchMovie.toLowerCase();
      result = result.filter(movie =>
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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (editingMovie) {
        await updateMovie(editingMovie.id, values);
      } else {
        await createMovie(values);
      }
      await refreshMovies();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving movie:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="movie-list-section">
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMovies.map(movie => (
              <tr key={movie.id}>
                <td>{movie.id}</td>
                <td>{movie.title}</td>
                <td>{movie.type}</td>
                <td>{movie.year}</td>
                <td>⭐ {movie.imdb_rating}</td>
                <td>{movie.genre.join(', ')}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditMovie(movie)}
                  >
                    Edit
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
              className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
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