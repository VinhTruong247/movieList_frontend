import React from 'react';
import { useMovies } from '../../../../hooks/useMovies';
import './MovieList.scss';

const MovieList = () => {
  const { movies, loading, error } = useMovies();

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="movie-list-section">
      <h2>Movie Management</h2>
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
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie.id}>
                <td>{movie.id}</td>
                <td>{movie.title}</td>
                <td>{movie.type}</td>
                <td>{movie.year}</td>
                <td>⭐ {movie.imdb_rating}</td>
                <td>{movie.genre.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovieList;